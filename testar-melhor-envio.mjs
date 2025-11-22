import "dotenv/config";
import axios from "axios";

async function testarMelhorEnvio() {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  console.log("Token carregado:", token ? "OK" : "FALHOU");

  if (!token) {
    console.error("❌ MELHOR_ENVIO_TOKEN não encontrado no .env");
    return;
  }

  try {
    const body = {
      from: {
        postal_code: "01001000"
      },
      to: {
        postal_code: "20040030"
      },
      volumes: [
        {
          width: 11,
          height: 2,
          length: 16,
          weight: 0.3,
          insurance_value: 50
        }
      ]
    };

    const response = await axios.post(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      body,
      {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "MeioLimaoShop (meiolimaomodas@gmail.com)"
        }
      }
    );

    console.log("Status HTTP:", response.status);
    console.log("\\n--- FRETES RETORNADOS ---");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("\\n❌ Erro ao chamar API Melhor Envio:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error);
    }
  }
}

testarMelhorEnvio();
