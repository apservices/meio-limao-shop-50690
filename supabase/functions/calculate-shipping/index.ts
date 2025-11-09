import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShippingRequest {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep, items } = await req.json();

    console.log('Calculating shipping for CEP:', cep);

    const melhorEnvioToken = Deno.env.get('MELHOR_ENVIO_TOKEN');
    if (!melhorEnvioToken) {
      throw new Error('Melhor Envio token not configured');
    }

    // Preparar produtos para a API do Melhor Envio
    const products = items.map((item: any) => ({
      id: item.id || '1',
      width: item.width || 11, // cm - mínimo da API
      height: item.height || 2, // cm - mínimo da API
      length: item.length || 16, // cm - mínimo da API
      weight: item.weight || 0.3, // kg - mínimo da API
      insurance_value: item.price || 50, // valor para seguro
      quantity: item.quantity || 1,
    }));

    const shippingRequest: ShippingRequest = {
      from: {
        postal_code: '09860000', // CEP de origem da loja
      },
      to: {
        postal_code: cep.replace(/\D/g, ''),
      },
      products,
    };

    console.log('Sending request to Melhor Envio:', JSON.stringify(shippingRequest, null, 2));

    // Chamar API do Melhor Envio
    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${melhorEnvioToken}`,
        'User-Agent': 'Meio Limao Store (contato@meiolimao.com.br)',
      },
      body: JSON.stringify(shippingRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Melhor Envio API error:', response.status, errorText);
      throw new Error(`Melhor Envio API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Melhor Envio response:', JSON.stringify(data, null, 2));

    // Formatar resposta para o frontend
    const options = data.map((option: any) => ({
      id: option.id,
      name: option.name,
      company: {
        name: option.company.name,
        picture: option.company.picture
      },
      price: parseFloat(option.price),
      discount: option.discount || 0,
      currency: option.currency,
      delivery_time: option.delivery_time,
      delivery_range: option.delivery_range,
      custom_delivery_time: option.custom_delivery_time,
      custom_delivery_range: option.custom_delivery_range,
      packages: option.packages,
      additional_services: option.additional_services,
      error: option.error || null,
    })).filter((option: any) => !option.error);

    return new Response(
      JSON.stringify({ options }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error calculating shipping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        options: [] 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});
