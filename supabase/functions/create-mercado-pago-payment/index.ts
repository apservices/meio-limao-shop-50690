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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: jsonHeaders },
    );
  }

  const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
  if (!MP_ACCESS_TOKEN) {
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

  if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ error: "orderId e items são obrigatórios" }),
      { status: 400, headers: jsonHeaders },
    );
  }

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
    console.error("Mercado Pago error:", data);
    return new Response(
      JSON.stringify({ error: "Erro ao criar preferência no Mercado Pago", details: data }),
      { status: 500, headers: jsonHeaders },
    );
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
