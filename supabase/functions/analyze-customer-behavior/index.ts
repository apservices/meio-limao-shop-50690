import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { customer_id } = await req.json();
    
    if (!customer_id) {
      throw new Error("customer_id is required");
    }

    // Get customer data
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customer_id)
      .single();

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Get recent events (last 30 days)
    const { data: events } = await supabase
      .from("customer_events")
      .select("*")
      .eq("customer_id", customer_id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(100);

    // Get orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer_id)
      .order("created_at", { ascending: false });

    // Prepare data for AI analysis
    const customerSummary = {
      name: customer.name,
      email: customer.email,
      marketing_opt_in: customer.marketing_opt_in,
      total_events: events?.length || 0,
      total_orders: orders?.length || 0,
      total_spent: orders?.reduce((sum, order) => sum + (order.total_cents || 0), 0) / 100,
      recent_events: events?.slice(0, 20).map(e => ({
        type: e.event_type,
        data: e.event_data,
        date: e.created_at
      })),
      has_abandoned_cart: events?.some(e => e.event_type === 'add_to_cart') && 
                          !events?.some(e => e.event_type === 'purchase'),
      viewed_products_count: events?.filter(e => e.event_type === 'product_view').length || 0,
    };

    // Call Lovable AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um analista de e-commerce especializado em comportamento do cliente. 
Analise os dados do cliente e forneça insights acionáveis em JSON.

Retorne no formato:
{
  "priority": "low|medium|high|urgent",
  "recommendations": ["recomendação1", "recomendação2"],
  "suggested_products": ["categoria1", "categoria2"],
  "contact_strategy": "descrição da melhor estratégia de contato",
  "predicted_value": "baixo|médio|alto",
  "risk_of_churn": "baixo|médio|alto"
}`
          },
          {
            role: "user",
            content: `Analise este cliente:
${JSON.stringify(customerSummary, null, 2)}

Forneça insights detalhados e recomendações de ações.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "customer_analysis",
              description: "Análise completa do comportamento do cliente",
              parameters: {
                type: "object",
                properties: {
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "urgent"]
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  suggested_products: {
                    type: "array",
                    items: { type: "string" }
                  },
                  contact_strategy: {
                    type: "string"
                  },
                  predicted_value: {
                    type: "string",
                    enum: ["baixo", "médio", "alto"]
                  },
                  risk_of_churn: {
                    type: "string",
                    enum: ["baixo", "médio", "alto"]
                  }
                },
                required: ["priority", "recommendations", "contact_strategy"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "customer_analysis" } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysis = JSON.parse(
      aiResult.choices[0].message.tool_calls[0].function.arguments
    );

    // Save insights to database
    await supabase
      .from("customer_insights")
      .insert({
        customer_id,
        insight_type: "ai_behavior_analysis",
        insight_data: {
          ...analysis,
          analyzed_at: new Date().toISOString(),
          events_analyzed: events?.length || 0,
        },
        priority: analysis.priority,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing customer:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
