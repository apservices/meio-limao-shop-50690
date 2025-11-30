import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  source?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

async function checkRateLimit(supabase: any, identifier: string, endpoint: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW);
  
  // Get existing rate limit entry
  const { data: existingLog } = await supabase
    .from("rate_limit_log")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())
    .single();

  if (existingLog) {
    if (existingLog.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return false; // Rate limit exceeded
    }
    
    // Update count
    await supabase
      .from("rate_limit_log")
      .update({ request_count: existingLog.request_count + 1 })
      .eq("id", existingLog.id);
  } else {
    // Create new entry
    await supabase
      .from("rate_limit_log")
      .insert({
        identifier,
        endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
      });
  }
  
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get IP address for rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Check rate limit
    const allowed = await checkRateLimit(supabase, clientIP, "submit-contact");
    if (!allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Muitas requisições. Por favor, aguarde um minuto antes de tentar novamente." 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }
    const payload = (await req.json()) as ContactPayload;
    const { name, email, phone, subject, message, source } = payload;

    if (!name || !email || !subject || !message) {
      throw new Error("Nome, e-mail, assunto e mensagem são obrigatórios");
    }

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone,
      subject,
      message,
      source: source || "contact_page",
      metadata: { received_via: "submit-contact" },
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error while saving contact message", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
