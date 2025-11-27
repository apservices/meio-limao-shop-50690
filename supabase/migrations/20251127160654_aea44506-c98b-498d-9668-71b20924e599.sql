-- Add free_shipping column to coupons table
ALTER TABLE public.coupons 
ADD COLUMN free_shipping BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.coupons.free_shipping IS 'Se true, o cupom oferece frete grátis além do desconto';
