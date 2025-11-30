import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const webhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');
const ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'production';

// Rate limiting: max 100 requests per minute per IP
async function checkRateLimit(supabase: any, identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 1000); // 1 minute
  const maxRequests = 100;
  
  const { data: existingLog } = await supabase
    .from("rate_limit_log")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", "mercado-pago-webhook")
    .gte("window_start", windowStart.toISOString())
    .single();

  if (existingLog) {
    if (existingLog.request_count >= maxRequests) {
      return false;
    }
    await supabase
      .from("rate_limit_log")
      .update({ request_count: existingLog.request_count + 1 })
      .eq("id", existingLog.id);
  } else {
    await supabase
      .from("rate_limit_log")
      .insert({
        identifier,
        endpoint: "mercado-pago-webhook",
        request_count: 1,
        window_start: new Date().toISOString(),
      });
  }
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const supabase = createClient(supabaseUrl, supabaseKey);
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  const allowed = await checkRateLimit(supabase, clientIP);
  if (!allowed) {
    console.warn("Rate limit exceeded", { ip: clientIP });
    return new Response(
      JSON.stringify({ error: "Too many requests" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      }
    );
  }

  // Verify HMAC signature
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  
  if (!xSignature || !xRequestId) {
    console.warn('Invalid signature');
    return new Response(JSON.stringify({ error: 'Missing signature headers' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const rawBody = await req.text();
  
  // Validate HMAC signature
  if (webhookSecret) {
    try {
      const parts = xSignature.split(',');
      const tsParam = parts.find(p => p.startsWith('ts='));
      const v1Param = parts.find(p => p.startsWith('v1='));
      
      if (!tsParam || !v1Param) {
        throw new Error('Invalid signature format');
      }
      
      const ts = tsParam.replace('ts=', '');
      const hash = v1Param.replace('v1=', '');
      
      // Build manifest: id + request-id + ts
      const dataId = JSON.parse(rawBody).data?.id || '';
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      
      // Calculate HMAC
      const encoder = new TextEncoder();
      const keyData = encoder.encode(webhookSecret);
      const messageData = encoder.encode(manifest);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const calculatedHash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (calculatedHash !== hash) {
        console.warn('Invalid signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
  } else {
    console.error('MERCADO_PAGO_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook not properly configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.log('Webhook received');

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }

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
    
    if (ENVIRONMENT === "development") {
      console.log('Payment details:', JSON.stringify(payment, null, 2));
    }

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

    if (paymentStatus === 'completed') {
      console.log('Payment approved', { orderId: targetOrderId });
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
