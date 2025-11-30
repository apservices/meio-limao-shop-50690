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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get authenticated user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { secret } = await req.json();
    
    if (!secret) {
      throw new Error("Missing TOTP secret");
    }

    // Generate backup codes
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push(code);
    }

    // Save MFA settings
    const { error: insertError } = await supabase
      .from("user_mfa")
      .upsert({
        user_id: user.id,
        secret: secret,
        backup_codes: backupCodes,
        enabled_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (insertError) {
      throw insertError;
    }

    // Log to audit
    await supabase.from("audit_logs").insert({
      entity: "user_mfa",
      entity_id: user.id,
      action: "enable_2fa",
      actor: user.id,
      diff: { enabled: true },
    });

    return new Response(
      JSON.stringify({
        success: true,
        backupCodes,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error enabling MFA:", error);
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
