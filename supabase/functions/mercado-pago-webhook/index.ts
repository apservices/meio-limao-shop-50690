import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const webhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const providedSecret = url.searchParams.get('secret');
  if (webhookSecret && providedSecret !== webhookSecret) {
    console.warn('Received webhook with invalid secret');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const rawBody = await req.text();
  let body: any;
  try {
    body = JSON.parse(rawBody || '{}');
  } catch (error) {
    console.error('Failed to parse webhook payload', error);
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    console.log('Mercado Pago webhook received:', JSON.stringify(body, null, 2));

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const logCheckoutEvent = async (action: string, diff: Record<string, unknown>) => {
      try {
        await supabase.from('audit_logs').insert({
          action,
          entity: 'checkout',
          diff,
        });
      } catch (logError) {
        console.error('Failed to log webhook event', logError);
      }
    };

    await logCheckoutEvent('mercado_pago_webhook_received', {
      type: body.type,
      payment_id: body.data?.id,
      topic: body.topic,
    });

    if (body.type !== 'payment') {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      await logCheckoutEvent('mercado_pago_webhook_missing_payment_id', {});
      return new Response(JSON.stringify({ error: 'No payment ID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

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

    const providerRef = payment.preference_id || paymentId;

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status, order_id')
      .eq('provider_ref', providerRef)
      .maybeSingle();

    let paymentUpdated = false;
    let orderUpdated = false;
    const targetOrderId = existingPayment?.order_id || orderId;

    if (existingPayment) {
      if (existingPayment.status !== paymentStatus) {
        const { error } = await supabase
          .from('payments')
          .update({
            status: paymentStatus,
            payload: payment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPayment.id);

        if (error) {
          console.error('Error updating payment:', error);
        } else {
          paymentUpdated = true;
        }
      }
    } else {
      await logCheckoutEvent('mercado_pago_payment_missing', {
        provider_ref: providerRef,
      });
    }

    if (targetOrderId) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status, payment_status')
        .eq('id', targetOrderId)
        .maybeSingle();

      if (existingOrder && (existingOrder.status !== orderStatus || existingOrder.payment_status !== paymentStatus)) {
        const { error } = await supabase
          .from('orders')
          .update({
            status: orderStatus,
            payment_status: paymentStatus,
            payment_method: payment.payment_type_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetOrderId);

        if (error) {
          console.error('Error updating order:', error);
        } else {
          orderUpdated = true;
        }
      }
    }

    await logCheckoutEvent('mercado_pago_webhook_processed', {
      orderId: targetOrderId,
      paymentUpdated,
      orderUpdated,
      paymentStatus,
      orderStatus,
    });

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
