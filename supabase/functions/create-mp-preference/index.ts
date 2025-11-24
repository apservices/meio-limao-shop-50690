import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
  if (!MP_ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: "MP_ACCESS_TOKEN não configurado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { items, back_urls, metadata } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ error: "items é obrigatório e deve ser um array" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = {
    items,
    back_urls: back_urls ?? {
      success: "https://meiolimao.shop/sucesso",
      failure: "https://meiolimao.shop/erro",
      pending: "https://meiolimao.shop/pendente",
    },
    auto_return: "approved",
    metadata: metadata ?? {},
  };

  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + MP_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await mpRes.json();

  if (!mpRes.ok) {
    return new Response(
      JSON.stringify({ error: "Mercado Pago error", details: data }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
