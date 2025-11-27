import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "URL da imagem é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Análise da imagem usando Gemini Vision
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise esta imagem de produto de moda feminina e retorne as seguintes informações em português:
                
1. Nome do produto (seja específico, ex: "Vestido Longo Floral" ou "Blusa Manga Curta Lisa")
2. Descrição detalhada (3-4 linhas sobre o produto, material, ocasião de uso, etc)
3. Tipo de peça (vestido, blusa, calça, saia, etc)
4. Cores principais (até 3 cores mais evidentes)
5. Tamanhos sugeridos (PP, P, M, G, GG)
6. Preço sugerido em BRL (baseado na aparência e qualidade visível)
7. Categoria (Vestidos, Blusas, Calças, Saias, Acessórios, etc)

Retorne APENAS um objeto JSON válido com estas chaves: name, description, type, colors (array), sizes (array), suggestedPrice (número), category`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_product_info",
              description: "Extrai informações estruturadas de um produto de moda",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome do produto" },
                  description: { type: "string", description: "Descrição detalhada" },
                  type: { type: "string", description: "Tipo de peça" },
                  colors: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Cores principais do produto"
                  },
                  sizes: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Tamanhos disponíveis"
                  },
                  suggestedPrice: { type: "number", description: "Preço sugerido em BRL" },
                  category: { type: "string", description: "Categoria do produto" }
                },
                required: ["name", "description", "type", "colors", "sizes", "suggestedPrice", "category"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_product_info" } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro na API Lovable:", error);
      throw new Error(`Erro ao analisar imagem: ${response.status}`);
    }

    const data = await response.json();
    console.log("Resposta da IA:", JSON.stringify(data, null, 2));

    // Extrair os argumentos da função tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const productInfo = JSON.parse(toolCall.function.arguments);
      
      return new Response(
        JSON.stringify({ success: true, data: productInfo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: tentar extrair do conteúdo
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      // Tentar extrair JSON do conteúdo
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const productInfo = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({ success: true, data: productInfo }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    throw new Error("Não foi possível extrair informações da imagem");

  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar imagem" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
