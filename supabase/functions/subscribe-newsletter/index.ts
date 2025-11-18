import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type NewsletterPayload = {
  email?: string;
  name?: string;
  source?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function syncWithMailchimp(email: string) {
  const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
  const listId = Deno.env.get("MAILCHIMP_AUDIENCE_ID");

  if (!apiKey || !listId) {
    return;
  }

  const [, dataCenter] = apiKey.split("-");
  if (!dataCenter) {
    console.warn("MAILCHIMP_API_KEY missing datacenter segment");
    return;
  }

  const endpoint = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
    },
    body: JSON.stringify({
      email_address: email,
      status: "subscribed",
    }),
  });

  if (!response.ok && response.status !== 400) {
    const error = await response.text();
    console.error("Mailchimp sync failed", error);
    throw new Error("Falha ao sincronizar com Mailchimp");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as NewsletterPayload;
    const { email, name, source } = payload;

    if (!email) {
      throw new Error("E-mail é obrigatório");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("newsletter_subscribers").upsert({
      email,
      name,
      source: source || "newsletter_section",
      metadata: { received_via: "subscribe-newsletter" },
    });

    if (error) {
      throw error;
    }

    await syncWithMailchimp(email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error while subscribing to newsletter", error);
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
