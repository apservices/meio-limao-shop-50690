import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting storage (in-memory for edge function)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string, limit: number = 100, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
};

// Maximum payload size in bytes (10KB)
const MAX_PAYLOAD_SIZE = 10 * 1024;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check content length before reading body
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      console.warn(`[Track Event] Payload too large: ${contentLength} bytes`);
      return new Response(
        JSON.stringify({ error: "Payload too large. Maximum size is 10KB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting by IP
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(clientIP, 100, 60000)) { // 100 events per minute per IP
      console.warn(`[Track Event] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Read and validate body
    const bodyText = await req.text();
    if (bodyText.length > MAX_PAYLOAD_SIZE) {
      console.warn(`[Track Event] Payload too large after reading: ${bodyText.length} bytes`);
      return new Response(
        JSON.stringify({ error: "Payload too large. Maximum size is 10KB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { event_type, event_data, session_id } = JSON.parse(bodyText);
    
    if (!event_type) {
      throw new Error("event_type is required");
    }

    // Validate event_type length
    if (typeof event_type !== "string" || event_type.length > 100) {
      throw new Error("Invalid event_type");
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
        event_data: event_data || {},
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
