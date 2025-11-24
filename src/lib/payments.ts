export async function criarCheckoutMercadoPago(params: {
  items: { title: string; quantity: number; unit_price: number; description?: string }[];
  backUrls?: { success: string; failure: string; pending: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}) {
  const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!baseUrl) {
    throw new Error("VITE_SUPABASE_FUNCTIONS_URL não configurada");
  }

  const res = await fetch(`${baseUrl}/create-mp-preference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: params.items,
      back_urls: params.backUrls,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("Erro ao criar preferência MP:", error);
    throw new Error("Falha ao criar preferência de pagamento");
  }

  const data = await res.json();
  return data as { id: string; init_point: string; sandbox_init_point?: string };
}
