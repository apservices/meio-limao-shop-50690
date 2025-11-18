import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, items, payer, shippingAddress, shippingOption } = await req.json();

    console.log('Creating Mercado Pago payment for order:', orderId);

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const logCheckoutEvent = async (action: string, diff: Record<string, unknown>) => {
      try {
        await supabase.from('audit_logs').insert({
          action,
          entity: 'checkout',
          entity_id: orderId,
          diff,
        });
      } catch (logError) {
        console.error('Failed to log checkout event', logError);
      }
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const mpItems = order.order_items.map((item: any) => ({
      title: item.name_snapshot,
      quantity: item.qty,
      unit_price: item.unit_price_cents / 100,
      currency_id: 'BRL',
    }));

    if (order.shipping_cents > 0) {
      mpItems.push({
        title: 'Frete',
        quantity: 1,
        unit_price: order.shipping_cents / 100,
        currency_id: 'BRL',
      });
    }

    await logCheckoutEvent('mercado_pago_preference_requested', {
      orderId,
      item_count: mpItems.length,
      shipping_option_id: shippingOption?.id || order.shipping_option_id,
    });

    const siteUrl = (Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('VITE_SITE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '').replace(/\/$/, '');
    const checkoutBaseUrl = siteUrl || supabaseUrl;
    const webhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');
    const notificationUrl = webhookSecret
      ? `${supabaseUrl}/functions/v1/mercado-pago-webhook?secret=${webhookSecret}`
      : `${supabaseUrl}/functions/v1/mercado-pago-webhook`;

    const preference = {
      items: mpItems,
      payer: payer || {
        email: order.email,
      },
      back_urls: {
        success: `${checkoutBaseUrl}/checkout/success?order_id=${orderId}`,
        failure: `${checkoutBaseUrl}/checkout/failure?order_id=${orderId}`,
        pending: `${checkoutBaseUrl}/checkout/pending?order_id=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: notificationUrl,
      statement_descriptor: 'MEIO LIMAO',
      payment_methods: {
        installments: 12,
        excluded_payment_methods: [],
        excluded_payment_types: [],
      },
      shipments: shippingAddress ? {
        receiver_address: {
          street_name: shippingAddress.street,
          street_number: shippingAddress.number,
          zip_code: shippingAddress.zipcode,
          city_name: shippingAddress.city,
          state_name: shippingAddress.state,
        },
      } : undefined,
    };

    console.log('Creating preference:', JSON.stringify(preference, null, 2));

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mercado Pago API error:', response.status, errorText);
      throw new Error(`Mercado Pago API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Mercado Pago response:', JSON.stringify(data, null, 2));

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        provider: 'mercado_pago',
        provider_ref: data.id,
        amount_cents: order.total_cents,
        status: 'pending',
        payload: data,
      });

    if (paymentError) {
      console.error('Error saving payment:', paymentError);
    }

    await logCheckoutEvent('mercado_pago_preference_created', {
      orderId,
      preferenceId: data.id,
    });

    return new Response(
      JSON.stringify({
        init_point: data.init_point,
        preference_id: data.id,
        sandbox_init_point: data.sandbox_init_point,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating Mercado Pago payment:', error);
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('audit_logs').insert({
        action: 'mercado_pago_preference_error',
        entity: 'checkout',
        diff: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log Mercado Pago error:', logError);
    }
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
