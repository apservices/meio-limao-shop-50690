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
    const { orderId, items, payer, shippingAddress } = await req.json();

    console.log('Creating Mercado Pago payment for order:', orderId);

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Prepare items for Mercado Pago
    const mpItems = order.order_items.map((item: any) => ({
      title: item.name_snapshot,
      quantity: item.qty,
      unit_price: item.unit_price_cents / 100,
      currency_id: 'BRL',
    }));

    // Add shipping cost if applicable
    if (order.shipping_cents > 0) {
      mpItems.push({
        title: 'Frete',
        quantity: 1,
        unit_price: order.shipping_cents / 100,
        currency_id: 'BRL',
      });
    }

    // Create payment preference
    const preference = {
      items: mpItems,
      payer: payer || {
        email: order.email,
      },
      back_urls: {
        success: `${Deno.env.get('VITE_SUPABASE_URL')}/checkout/success?order_id=${orderId}`,
        failure: `${Deno.env.get('VITE_SUPABASE_URL')}/checkout/failure?order_id=${orderId}`,
        pending: `${Deno.env.get('VITE_SUPABASE_URL')}/checkout/pending?order_id=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
      statement_descriptor: 'MEIO LIMAO',
      payment_methods: {
        installments: 12,
        excluded_payment_methods: [],
        excluded_payment_types: [],
      },
    };

    console.log('Creating preference:', JSON.stringify(preference, null, 2));

    // Call Mercado Pago API
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

    // Save payment record
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
