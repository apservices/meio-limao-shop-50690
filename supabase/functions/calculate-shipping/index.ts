import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MELHOR_ENVIO_TOKEN = Deno.env.get("MELHOR_ENVIO_TOKEN");

serve(async (req) => {
  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
  };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: jsonHeaders },
    );
  }

  if (!MELHOR_ENVIO_TOKEN) {
    return new Response(
      JSON.stringify({ error: "MELHOR_ENVIO_TOKEN não configurado" }),
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

  const { cep, weight } = body;

  if (!cep || typeof cep !== "string" || cep.length !== 8) {
    return new Response(
      JSON.stringify({ error: "CEP inválido" }),
      { status: 400, headers: jsonHeaders },
    );
  }

  if (!weight || Number(weight) <= 0) {
    return new Response(
      JSON.stringify({ error: "Peso inválido" }),
      { status: 400, headers: jsonHeaders },
    );
  }

  // CEP de origem fixo (loja)
  const fromPostalCode = "01001000";

  const requestBody = {
    from: { postal_code: fromPostalCode },
    to: { postal_code: cep },
    volumes: [
      {
        width: 16,
        height: 2,
        length: 23,
        weight: Number(weight),
        insurance_value: 50,
      },
    ],
  };

  try {
    const meRes = await fetch(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + MELHOR_ENVIO_TOKEN,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "MeioLimaoShop (frete@meiolimao.shop)",
        },
        body: JSON.stringify(requestBody),
      },
    );

    const meData = await meRes.json();

    if (!meRes.ok) {
      console.error("Melhor Envio error:", meData);
      return new Response(
        JSON.stringify({
          error: "Erro ao calcular frete no Melhor Envio",
          details: meData,
        }),
        { status: 500, headers: jsonHeaders },
      );
    }

    if (!Array.isArray(meData) || meData.length === 0) {
      return new Response(
        JSON.stringify({ options: [] }),
        { status: 200, headers: jsonHeaders },
      );
    }

    const options = meData
      .filter((opt: any) => !opt.error)
      .map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        price: Number(opt.price),
        delivery_time: opt.delivery_time,
        delivery_range: opt.delivery_range,
        company: opt.company?.name ?? "",
        raw: opt,
      }));

    return new Response(
      JSON.stringify({ options }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("Unexpected error in calculate-shipping:", error);
    return new Response(
      JSON.stringify({ error: "Erro inesperado ao calcular frete" }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
