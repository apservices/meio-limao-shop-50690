import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

// Rate limiting: max 1000 requests per hour per user
async function checkRateLimit(supabase: any, identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000); // 1 hour
  const maxRequests = 1000;
  
  const { data: existingLog } = await supabase
    .from("rate_limit_log")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", "create-mercado-pago-payment")
    .gte("window_start", windowStart.toISOString())
    .single();

  if (existingLog) {
    if (existingLog.request_count >= maxRequests) {
      return false;
    }
    await supabase
      .from("rate_limit_log")
      .update({ request_count: existingLog.request_count + 1 })
      .eq("id", existingLog.id);
  } else {
    await supabase
      .from("rate_limit_log")
      .insert({
        identifier,
        endpoint: "create-mercado-pago-payment",
        request_count: 1,
        window_start: new Date().toISOString(),
      });
  }
  return true;
}

serve(async (req) => {
  console.log("[MP Payment] Function invoked");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error("[MP Payment] Invalid method:", req.method);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: jsonHeaders },
    );
  }

  const MP_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "production";

  // Rate limiting check
  const authHeader = req.headers.get('authorization');
  const userId = authHeader ? authHeader.split(' ')[1] : 'anonymous';
  
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const allowed = await checkRateLimit(supabase, userId);
    if (!allowed) {
      console.warn("Rate limit exceeded", { userId });
      return new Response(
        JSON.stringify({ error: "Muitas requisições. Aguarde antes de tentar novamente." }),
        { status: 429, headers: jsonHeaders },
      );
    }
  }
  
  if (!MP_ACCESS_TOKEN) {
    console.error("[MP Payment] MP_ACCESS_TOKEN not configured");
    return new Response(
      JSON.stringify({ error: "MP_ACCESS_TOKEN não configurado" }),
      { status: 500, headers: jsonHeaders },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido" }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const { orderId, items, payer, shippingAddress, shippingOption } = body;
  
  if (ENVIRONMENT === "development") {
    console.log("[MP Payment] Request data:", { orderId, itemsCount: items?.length, hasPayer: !!payer });
  }

  if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
    console.error("[MP Payment] Invalid request data");
    return new Response(
      JSON.stringify({ error: "orderId e items são obrigatórios" }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const webhookUrl = `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`;
  
  const preferencePayload: any = {
    external_reference: String(orderId),
    items: items.map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: "BRL",
    })),
    auto_return: "approved",
    back_urls: {
      success: "https://meiolimao.shop/checkout/success",
      failure: "https://meiolimao.shop/checkout/failure",
      pending: "https://meiolimao.shop/checkout/pending",
    },
    notification_url: webhookUrl,
    metadata: {
      orderId,
      shippingOption,
    },
  };

  if (payer) {
    preferencePayload.payer = {
      name: payer.name,
      email: payer.email,
    };
  }

  if (shippingAddress) {
    preferencePayload.shipments = {
      receiver_address: {
        zip_code: shippingAddress.zipcode,
        street_name: shippingAddress.street,
        street_number: shippingAddress.number,
        city_name: shippingAddress.city,
        state_name: shippingAddress.state,
        neighborhood: shippingAddress.neighborhood,
        country_name: shippingAddress.country ?? "BR",
        floor: null,
        apartment: null,
      },
    };
  }

  if (ENVIRONMENT === "development") {
    console.log("[MP Payment] Preference payload:", JSON.stringify(preferencePayload, null, 2));
  }
  
  const mpRes = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MP_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    },
  );

  const data = await mpRes.json();

  if (!mpRes.ok) {
    console.error("[MP Payment] Payment creation failed with status:", mpRes.status);
    return new Response(
      JSON.stringify({ error: "Erro ao criar preferência no Mercado Pago" }),
      { status: 500, headers: jsonHeaders },
    );
  }

  console.log("Payment created", { preferenceId: data.id });
  
  // Create payment record in database
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );
    
    const paymentRecord = {
      order_id: orderId,
      provider: 'mercado_pago',
      provider_ref: data.id,
      status: 'pending',
      amount_cents: Math.round(totalAmount * 100),
      payload: data,
    };
    
    const paymentRes = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(paymentRecord),
    });
    
    if (!paymentRes.ok) {
      console.error("[MP Payment] Failed to create payment record");
    } else {
      console.log("Payment record created", { orderId });
    }
  }
  
  return new Response(
    JSON.stringify({
      preference_id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    }),
    { status: 200, headers: jsonHeaders },
  );
});