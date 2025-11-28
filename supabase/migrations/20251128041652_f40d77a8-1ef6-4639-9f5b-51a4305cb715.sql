-- Fix RLS policies to prevent data leakage between users

-- 1. Fix CUSTOMERS table policies
DROP POLICY IF EXISTS "Users view own customer data" ON public.customers;
DROP POLICY IF EXISTS "Customers can update own data" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users create customer" ON public.customers;

CREATE POLICY "Users can view only their own customer data"
ON public.customers
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update only their own customer data"
ON public.customers
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert only their own customer record"
ON public.customers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Fix ADDRESSES table policies
DROP POLICY IF EXISTS "Customers can manage own addresses" ON public.addresses;

CREATE POLICY "Users can view only their own addresses"
ON public.addresses
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert only their own addresses"
ON public.addresses
FOR INSERT
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update only their own addresses"
ON public.addresses
FOR UPDATE
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete only their own addresses"
ON public.addresses
FOR DELETE
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

-- 3. Fix PROFILES table policies (already correct but ensure)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update only their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- 4. Fix ORDERS table policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;

CREATE POLICY "Users can view only their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert only their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Fix ORDER_ADDRESSES table policies
DROP POLICY IF EXISTS "Users view own order addresses" ON public.order_addresses;
DROP POLICY IF EXISTS "Users can insert own order addresses" ON public.order_addresses;

CREATE POLICY "Users can view only their own order addresses"
ON public.order_addresses
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert only addresses for their own orders"
ON public.order_addresses
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- 6. Fix PAYMENTS table policies
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;

CREATE POLICY "Users can view only their own payments"
ON public.payments
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

-- 7. Fix ORDER_ITEMS table policies for completeness
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

CREATE POLICY "Users can view only their own order items"
ON public.order_items
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert items only for their own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);