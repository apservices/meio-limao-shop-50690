-- Add INSERT policy for order_addresses to allow customers to save their shipping addresses
CREATE POLICY "Users can insert own order addresses"
ON public.order_addresses
FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (
    SELECT orders.id 
    FROM orders
    WHERE orders.customer_id IN (
      SELECT customers.id 
      FROM customers
      WHERE customers.user_id = auth.uid()
    )
  )
);