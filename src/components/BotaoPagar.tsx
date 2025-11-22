import { useState } from "react";
import { criarCheckoutMercadoPago } from "../lib/payments";

type Props = {
  total: number; // valor total do pedido (produtos + frete)
};

export function BotaoPagar({ total }: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePagar() {
    try {
      setLoading(true);

      const pref = await criarCheckoutMercadoPago({
        items: [
          {
            title: "Pedido MeioLimão",
            description: "Compra via meiolimao.shop",
            quantity: 1,
            unit_price: total,
          },
        ],
        metadata: {
          origem: "meiolimao.shop",
        },
      });

      window.location.href = pref.init_point;
    } catch (e) {
      alert("Erro ao iniciar pagamento. Tente novamente.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePagar}
      disabled={loading}
      style={{
        padding: "10px 18px",
        borderRadius: 8,
        border: "none",
        backgroundColor: "#00a650",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {loading ? "Redirecionando..." : "Pagar com Mercado Pago"}
    </button>
  );
}
