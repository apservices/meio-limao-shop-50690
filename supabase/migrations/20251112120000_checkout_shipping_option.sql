-- Add shipping option metadata to orders so we can persist the service selected on checkout
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_option_id TEXT,
  ADD COLUMN IF NOT EXISTS shipping_option_label TEXT;
