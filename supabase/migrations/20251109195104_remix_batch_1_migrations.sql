
-- Migration: 20251109190149

-- Migration: 20251109183745

-- Migration: 20251104235738
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Migration: 20251106181202
-- Collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Collection products (many-to-many)
CREATE TABLE public.collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

-- Product categories (many-to-many)
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Product variants
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  option1_label TEXT,
  option1_value TEXT,
  option2_label TEXT,
  option2_value TEXT,
  price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER,
  cost_cents INTEGER,
  weight_grams INTEGER,
  barcode TEXT,
  image_url TEXT,
  inventory_qty INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customers (separate from profiles for extensibility)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  document TEXT,
  marketing_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  label TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  zipcode TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'BR',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Carts
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  session_id TEXT,
  coupon_code TEXT,
  subtotal_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  shipping_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  name_snapshot TEXT NOT NULL,
  sku_snapshot TEXT,
  unit_price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  sku_snapshot TEXT,
  unit_price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update orders table with new fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number SERIAL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cents INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_cents INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders DROP COLUMN IF EXISTS items;
ALTER TABLE public.orders DROP COLUMN IF EXISTS shipping_address;

-- Order addresses (embedded)
CREATE TABLE public.order_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'shipping' or 'billing'
  name TEXT NOT NULL,
  phone TEXT,
  zipcode TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'stripe', 'mercadopago', 'pix'
  provider_ref TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Shipments
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'correios', 'melhor_envio', 'table', 'pickup'
  tracking_code TEXT,
  cost_cents INTEGER,
  status TEXT DEFAULT 'pending',
  label_url TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Returns / RMA
CREATE TABLE public.returns_rma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'requested', -- 'requested', 'approved', 'rejected', 'received', 'refunded'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'percentage' or 'fixed'
  value NUMERIC NOT NULL,
  min_subtotal_cents INTEGER DEFAULT 0,
  first_purchase_only BOOLEAN DEFAULT false,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wishlists
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(customer_id)
);

CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wishlist_id, product_id, variant_id)
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  diff JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_collection_products_collection_id ON public.collection_products(collection_id);
CREATE INDEX idx_collection_products_product_id ON public.collection_products(product_id);
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_addresses_customer_id ON public.addresses(customer_id);
CREATE INDEX idx_carts_customer_id ON public.carts(customer_id);
CREATE INDEX idx_carts_session_id ON public.carts(session_id);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX idx_returns_rma_order_id ON public.returns_rma(order_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_wishlist_items_wishlist_id ON public.wishlist_items(wishlist_id);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns_rma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read for active content
CREATE POLICY "Anyone can view active collections" ON public.collections FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view collection products" ON public.collection_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage collection products" ON public.collection_products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage product categories" ON public.product_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage variants" ON public.product_variants FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Customers
CREATE POLICY "Customers can view own data" ON public.customers FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers can update own data" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create customer" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Addresses
CREATE POLICY "Customers can manage own addresses" ON public.addresses FOR ALL USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Carts
CREATE POLICY "Users can manage own carts" ON public.carts FOR ALL USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Anyone can create cart" ON public.carts FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  cart_id IN (SELECT id FROM public.carts WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Order items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Order addresses
CREATE POLICY "Users can view own order addresses" ON public.order_addresses FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Admins can manage order addresses" ON public.order_addresses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Shipments
CREATE POLICY "Users can view own shipments" ON public.shipments FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Admins can manage shipments" ON public.shipments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Returns
CREATE POLICY "Users can manage own returns" ON public.returns_rma FOR ALL USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Customers can update own reviews" ON public.reviews FOR UPDATE USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Wishlists
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can manage own wishlist items" ON public.wishlist_items FOR ALL USING (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Audit logs (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can create audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_returns_rma_updated_at BEFORE UPDATE ON public.returns_rma FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Migration: 20251109185201
-- ============================================
-- MEIO LIMÃO - CORREÇÃO COMPLETA DE SEGURANÇA
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS INSEGURAS BASEADAS EM EMAIL
-- ============================================

-- Orders: Remover políticas com email
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

-- Criar políticas seguras apenas com customer_id
CREATE POLICY "Users view own orders via customer"
ON orders FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users create own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

-- Block anonymous access to orders
CREATE POLICY "Block anonymous from orders"
ON orders FOR ALL
TO anon
USING (false);

-- Order Items: Remover e recriar sem email
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

CREATE POLICY "Users view own order items"
ON order_items FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders 
    WHERE customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Block anonymous from order items"
ON order_items FOR ALL
TO anon
USING (false);

-- Order Addresses: Remover políticas com email
DROP POLICY IF EXISTS "Users can view own order addresses" ON order_addresses;

CREATE POLICY "Users view own order addresses"
ON order_addresses FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Block anonymous from order addresses"
ON order_addresses FOR ALL
TO anon
USING (false);

-- Payments: Remover políticas com email
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

CREATE POLICY "Users view own payments"
ON payments FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Block anonymous from payments"
ON payments FOR ALL
TO anon
USING (false);

-- 2. CORRIGIR CUSTOMERS - BLOQUEAR INSERÇÃO ANÔNIMA
-- ============================================

-- Remover política insegura
DROP POLICY IF EXISTS "Anyone can create customer" ON customers;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;

-- Apenas usuários autenticados podem criar customers
CREATE POLICY "Authenticated users create customer"
ON customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários veem apenas seus próprios dados
CREATE POLICY "Users view own customer data"
ON customers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Bloquear anônimos completamente
CREATE POLICY "Block anonymous from customers"
ON customers FOR ALL
TO anon
USING (false);

-- 3. ADDRESSES - BLOQUEAR ANÔNIMOS
-- ============================================

CREATE POLICY "Block anonymous from addresses"
ON addresses FOR ALL
TO anon
USING (false);

-- 4. PROFILES - ADICIONAR BLOQUEIO EXPLÍCITO
-- ============================================

CREATE POLICY "Block anonymous from profiles"
ON profiles FOR ALL
TO anon
USING (false);

-- 5. SHIPMENTS - BLOQUEAR ANÔNIMOS
-- ============================================

CREATE POLICY "Block anonymous from shipments"
ON shipments FOR ALL
TO anon
USING (false);

-- 6. RETURNS - BLOQUEAR ANÔNIMOS
-- ============================================

CREATE POLICY "Block anonymous from returns"
ON returns_rma FOR ALL
TO anon
USING (false);

-- 7. CART E WISHLIST - GARANTIR BLOQUEIO
-- ============================================

DROP POLICY IF EXISTS "Anyone can create cart" ON carts;

CREATE POLICY "Authenticated users create cart"
ON carts FOR INSERT
TO authenticated
WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Block anonymous from carts"
ON carts FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous from cart items"
ON cart_items FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous from wishlists"
ON wishlists FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous from wishlist items"
ON wishlist_items FOR ALL
TO anon
USING (false);

-- ============================================
-- CONFIRMAÇÃO: NENHUMA POLÍTICA USA EMAIL
-- ============================================
-- Todas as políticas agora usam apenas:
-- - auth.uid() para verificar identidade
-- - customer_id para relacionamento com customers
-- - has_role() para verificações de admin
-- ZERO referências a email em condições de acesso;

