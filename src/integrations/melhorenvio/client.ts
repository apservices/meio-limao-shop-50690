const BASE_URL = import.meta.env.VITE_MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br/api/v2"
  : "https://www.melhorenvio.com.br/api/v2";

const TOKEN = import.meta.env.VITE_MELHOR_ENVIO_TOKEN;

export async function melhorEnvioQuote(payload: any) {
  const res = await fetch(\\/me/shipment/calculate\, {
    method: "POST",
    headers: {
      Authorization: \Bearer \\,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Erro Melhor Envio:", error);
    throw new Error("Falha ao consultar frete");
  }

  return res.json();
}
