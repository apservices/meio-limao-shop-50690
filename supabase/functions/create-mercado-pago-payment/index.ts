import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

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
  
  console.log("[MP Payment] Token present:", !!MP_ACCESS_TOKEN);
  console.log("[MP Payment] Token starts with:", MP_ACCESS_TOKEN?.substring(0, 10));
  
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
  console.log("[MP Payment] Request data:", { orderId, itemsCount: items?.length, hasPayer: !!payer });

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
      success: "https://meiolimao.shop/checkout/sucesso",
      failure: "https://meiolimao.shop/checkout/erro",
      pending: "https://meiolimao.shop/checkout/pendente",
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

  console.log("[MP Payment] Sending request to Mercado Pago API");
  console.log("[MP Payment] Preference payload:", JSON.stringify(preferencePayload, null, 2));
  
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
  console.log("[MP Payment] Mercado Pago response status:", mpRes.status);
  console.log("[MP Payment] Mercado Pago response:", JSON.stringify(data, null, 2));

  if (!mpRes.ok) {
    console.error("[MP Payment] Mercado Pago error:", data);
    return new Response(
      JSON.stringify({ error: "Erro ao criar preferência no Mercado Pago", details: data }),
      { status: 500, headers: jsonHeaders },
    );
  }

  console.log("[MP Payment] Success - Preference created:", data.id);
  
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
      console.error("[MP Payment] Failed to create payment record:", await paymentRes.text());
    } else {
      console.log("[MP Payment] Payment record created successfully");
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