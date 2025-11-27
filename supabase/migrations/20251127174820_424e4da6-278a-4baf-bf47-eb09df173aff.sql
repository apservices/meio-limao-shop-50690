-- Fix RLS policies blocking checkout operations

-- 1. Allow authenticated users to create audit logs
DROP POLICY IF EXISTS "Service role can create audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow users to insert order items for their own orders
CREATE POLICY "Users can insert own order items"
ON public.order_items
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

-- 3. Ensure cart_items policies allow proper CRUD operations
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;

CREATE POLICY "Users can insert own cart items"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (
  cart_id IN (
    SELECT carts.id
    FROM carts
    WHERE carts.customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.user_id = auth.uid()
    )
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view own cart items"
ON public.cart_items
FOR SELECT
TO authenticated
USING (
  cart_id IN (
    SELECT carts.id
    FROM carts
    WHERE carts.customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.user_id = auth.uid()
    )
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update own cart items"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (
  cart_id IN (
    SELECT carts.id
    FROM carts
    WHERE carts.customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.user_id = auth.uid()
    )
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete own cart items"
ON public.cart_items
FOR DELETE
TO authenticated
USING (
  cart_id IN (
    SELECT carts.id
    FROM carts
    WHERE carts.customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.user_id = auth.uid()
    )
  ) OR has_role(auth.uid(), 'admin')
);