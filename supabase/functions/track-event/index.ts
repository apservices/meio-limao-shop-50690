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
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { event_type, event_data, session_id } = await req.json();
    
    if (!event_type) {
      throw new Error("event_type is required");
    }

    // Get user from auth header if available
    const authHeader = req.headers.get("authorization");
    let user_id = null;
    let customer_id = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        user_id = user.id;
        
        // Get customer_id
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (customer) {
          customer_id = customer.id;
        }
      }
    }

    // Get IP and user agent
    const ip_address = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const user_agent = req.headers.get("user-agent");

    // Insert event
    const { error } = await supabase
      .from("customer_events")
      .insert({
        customer_id,
        user_id,
        event_type,
        event_data,
        session_id,
        ip_address,
        user_agent,
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error tracking event:", error);
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
