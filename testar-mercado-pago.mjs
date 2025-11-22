import "dotenv/config";
import axios from "axios";

async function testarMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env.VITE_MP_ACCESS_TOKEN;
  console.log("Token MP carregado:", accessToken ? "OK" : "FALHOU");

  if (!accessToken) {
    console.error("❌ MP_ACCESS_TOKEN não encontrado no .env");
    return;
  }

  try {
    const body = {
      items: [
        {
          title: "Produto teste MeioLimão",
          description: "Teste de integração Mercado Pago",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 99.9
        }
      ],
      back_urls: {
        success: "https://meiolimao.shop/sucesso",
        failure: "https://meiolimao.shop/erro",
        pending: "https://meiolimao.shop/pendente"
      },
      auto_return: "approved"
    };

    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      body,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Status HTTP:", response.status);
    console.log("\\n--- PREFERÊNCIA GERADA ---");
    console.log("ID:", response.data.id);
    console.log("init_point:", response.data.init_point);
    console.log("sandbox_init_point:", response.data.sandbox_init_point);
  } catch (error) {
    console.error("\\n❌ Erro ao chamar API Mercado Pago:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
  }
}

testarMercadoPago();
