import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, productId, limit = 8 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar histórico de pedidos do usuário
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        order_items (
          product_id,
          products (
            id,
            name,
            category_id,
            colors,
            price
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // 2. Extrair categorias e cores favoritas
    const purchasedProductIds = new Set<string>();
    const categoryCount = new Map<string, number>();
    const colorCount = new Map<string, number>();

    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const product = item.products;
        if (product) {
          purchasedProductIds.add(product.id);
          
          // Contar categorias
          if (product.category_id) {
            categoryCount.set(
              product.category_id,
              (categoryCount.get(product.category_id) || 0) + 1
            );
          }
          
          // Contar cores
          product.colors?.forEach((color: string) => {
            colorCount.set(color, (colorCount.get(color) || 0) + 1);
          });
        }
      });
    });

    // 3. Ordenar preferências
    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
    
    const topColors = Array.from(colorCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => color);

    // 4. Buscar produto atual para contexto
    let currentProductCategory = null;
    if (productId) {
      const { data: currentProduct } = await supabase
        .from('products')
        .select('category_id')
        .eq('id', productId)
        .single();
      currentProductCategory = currentProduct?.category_id;
    }

    // 5. Buscar produtos recomendados
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(${Array.from(purchasedProductIds).join(',') || 'null'})`);

    // Priorizar categoria atual se visualizando produto
    if (currentProductCategory) {
      query = query.eq('category_id', currentProductCategory);
    } else if (topCategories.length > 0) {
      // Senão, usar categorias favoritas
      query = query.in('category_id', topCategories);
    }

    const { data: recommendations } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    // 6. Se não encontrou produtos suficientes, buscar complementares
    let finalRecommendations = recommendations || [];
    
    if (finalRecommendations.length < limit) {
      const { data: moreProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${[...purchasedProductIds, ...finalRecommendations.map(p => p.id)].join(',') || 'null'})`)
        .order('rating', { ascending: false })
        .limit(limit - finalRecommendations.length);
      
      if (moreProducts) {
        finalRecommendations = [...finalRecommendations, ...moreProducts];
      }
    }

    // 7. Calcular score de relevância com IA
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY && topCategories.length > 0) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{
              role: "user",
              content: `Com base no histórico de compras do cliente:
              - Categorias favoritas: ${topCategories.join(', ')}
              - Cores favoritas: ${topColors.join(', ')}
              
              Ordene estes produtos por relevância para o cliente (retorne apenas os IDs em ordem):
              ${finalRecommendations.map(p => `ID: ${p.id}, Nome: ${p.name}, Categoria: ${p.category_id}, Cores: ${p.colors?.join(', ')}`).join('\n')}`
            }]
          }),
        });

        if (response.ok) {
          const aiData = await response.json();
          const aiSuggestion = aiData.choices?.[0]?.message?.content;
          
          // Tentar reordenar baseado na resposta da IA
          if (aiSuggestion) {
            const orderedIds = aiSuggestion.match(/[a-f0-9-]{36}/g) || [];
            const orderedRecommendations: any[] = [];
            
            orderedIds.forEach((id: string) => {
              const product = finalRecommendations.find(p => p.id === id);
              if (product) orderedRecommendations.push(product);
            });
            
            // Adicionar produtos não mencionados pela IA no final
            finalRecommendations.forEach(p => {
              if (!orderedRecommendations.find(op => op.id === p.id)) {
                orderedRecommendations.push(p);
              }
            });
            
            finalRecommendations = orderedRecommendations;
          }
        }
      } catch (aiError) {
        console.error('Erro ao usar IA para ordenação:', aiError);
        // Continua com ordenação padrão
      }
    }

    return new Response(
      JSON.stringify({
        recommendations: finalRecommendations,
        insights: {
          topCategories,
          topColors,
          totalPurchases: orders?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
