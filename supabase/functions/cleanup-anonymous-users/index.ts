import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentication check - only allow requests with valid CRON_SECRET
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  
  if (!cronSecret) {
    console.error("[Cleanup] CRON_SECRET not configured");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (!providedSecret || providedSecret !== cronSecret) {
    console.warn("[Cleanup] Unauthorized access attempt");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase credentials" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log("[Cleanup] Starting anonymous users cleanup");

    // Data de corte: 30 dias atrás
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffIso = cutoffDate.toISOString();

    console.log("[Cleanup] Cutoff date:", cutoffIso);

    // Buscar usuários anônimos com pedidos antigos ou sem pedidos
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    console.log("[Cleanup] Total users found:", users.length);

    const anonymousUsers = users.filter(user => user.is_anonymous);
    console.log("[Cleanup] Anonymous users found:", anonymousUsers.length);

    let deletedCount = 0;
    let keptCount = 0;

    for (const user of anonymousUsers) {
      // Verificar se o usuário tem pedidos pagos recentes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, payment_status')
        .eq('user_id', user.id)
        .eq('payment_status', 'approved')
        .gte('created_at', cutoffIso)
        .limit(1);

      if (ordersError) {
        console.error(`[Cleanup] Error checking orders for user ${user.id}:`, ordersError);
        continue;
      }

      // Se tem pedidos pagos recentes, manter o usuário
      if (orders && orders.length > 0) {
        keptCount++;
        console.log(`[Cleanup] Keeping user ${user.id} - has recent paid orders`);
        continue;
      }

      // Verificar se o último login foi há mais de 30 dias
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date(user.created_at);
      
      if (lastSignIn > cutoffDate) {
        keptCount++;
        console.log(`[Cleanup] Keeping user ${user.id} - recent activity`);
        continue;
      }

      // Deletar usuário anônimo antigo sem atividade
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`[Cleanup] Error deleting user ${user.id}:`, deleteError);
      } else {
        deletedCount++;
        console.log(`[Cleanup] Deleted anonymous user ${user.id}`);
      }
    }

    // Registrar no audit log
    await supabase.from('audit_logs').insert({
      action: 'cleanup_anonymous_users',
      entity: 'auth',
      diff: {
        total_anonymous: anonymousUsers.length,
        deleted: deletedCount,
        kept: keptCount,
        cutoff_date: cutoffIso,
      },
    });

    console.log("[Cleanup] Cleanup completed:", { deleted: deletedCount, kept: keptCount });

    return new Response(
      JSON.stringify({
        success: true,
        deleted: deletedCount,
        kept: keptCount,
        total_anonymous: anonymousUsers.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[Cleanup] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
