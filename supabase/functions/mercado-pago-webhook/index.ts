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
    const body = await req.json();
    console.log('Mercado Pago webhook received:', JSON.stringify(body, null, 2));

    // Get Mercado Pago access token (production only)
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle payment notification
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.error('No payment ID in webhook');
        return new Response(JSON.stringify({ error: 'No payment ID' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Get payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Error fetching payment:', paymentResponse.status, errorText);
        throw new Error(`Error fetching payment: ${paymentResponse.status}`);
      }

      const payment = await paymentResponse.json();
      console.log('Payment details:', JSON.stringify(payment, null, 2));

      const orderId = payment.external_reference;
      const status = payment.status;

      // Map Mercado Pago status to our status
      let paymentStatus = 'pending';
      let orderStatus = 'pending';

      switch (status) {
        case 'approved':
          paymentStatus = 'completed';
          orderStatus = 'processing';
          break;
        case 'pending':
        case 'in_process':
          paymentStatus = 'pending';
          orderStatus = 'pending';
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = 'failed';
          orderStatus = 'cancelled';
          break;
        case 'refunded':
          paymentStatus = 'refunded';
          orderStatus = 'refunded';
          break;
      }

      // Update payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          payload: payment,
          updated_at: new Date().toISOString(),
        })
        .eq('provider_ref', payment.preference_id || paymentId);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          payment_method: payment.payment_type_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
      }

      console.log(`Order ${orderId} updated to status: ${orderStatus}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
