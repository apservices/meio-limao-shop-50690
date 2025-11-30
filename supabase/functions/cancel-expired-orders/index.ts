import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar pedidos pendentes com mais de 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, email, user_id')
      .eq('payment_status', 'pending')
      .lt('created_at', twentyFourHoursAgo.toISOString());
    
    if (fetchError) {
      console.error('Error fetching expired orders:', fetchError);
      throw fetchError;
    }
    
    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('No expired orders found');
      return new Response(
        JSON.stringify({ message: 'No expired orders to cancel', cancelled: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${expiredOrders.length} expired orders to cancel`);
    
    // Cancelar cada pedido
    const cancelledIds = [];
    for (const order of expiredOrders) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'cancelled',
          notes: 'Pedido cancelado automaticamente - Pagamento não identificado após 24 horas',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      
      if (updateError) {
        console.error(`Error cancelling order ${order.order_number}:`, updateError);
        continue;
      }
      
      cancelledIds.push(order.id);
      
      // Registrar no audit log
      await supabase.from('audit_logs').insert({
        actor: null,
        action: 'order_auto_cancelled',
        entity: 'order',
        entity_id: order.id,
        diff: {
          order_number: order.order_number,
          reason: 'Pagamento não identificado após 24 horas',
          auto_cancelled: true,
        },
      });
      
      console.log(`Order ${order.order_number} cancelled successfully`);
    }
    
    return new Response(
      JSON.stringify({
        message: `Successfully cancelled ${cancelledIds.length} expired orders`,
        cancelled: cancelledIds.length,
        orders: cancelledIds,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in cancel-expired-orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});