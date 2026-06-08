-- =====================================================
-- PHASE 1: Supabase Database Schema & RLS Policies
-- Product Catalog Platform
-- =====================================================
-- Run this entire script in the Supabase SQL Editor
-- =====================================================

-- ==========================================
-- 1. CREATE THE PRODUCTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10, 2),
  tag TEXT,
  category TEXT,
  colors TEXT,
  image_url TEXT,
  is_out_of_stock BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- MIGRATION SQL FOR EXISTING DATABASE (Run in SQL Editor):
-- =====================================================
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT;
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS POLICIES FOR PRODUCTS TABLE
-- ==========================================

-- Public read access: anyone can view products
CREATE POLICY "Products are publicly readable"
  ON public.products
  FOR SELECT
  USING (true);

-- Authenticated admins can insert products
CREATE POLICY "Authenticated admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');

-- Authenticated admins can update products
CREATE POLICY "Authenticated admins can update products"
  ON public.products
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com')
  WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');

-- Authenticated admins can delete products
CREATE POLICY "Authenticated admins can delete products"
  ON public.products
  FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');

-- ==========================================
-- 3. CREATE THE PRODUCT-IMAGES STORAGE BUCKET
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. STORAGE RLS POLICIES FOR product-images
-- ==========================================

-- Public read access: anyone can view product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated admins can upload product images
CREATE POLICY "Authenticated admins can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');

-- Authenticated admins can update product images
CREATE POLICY "Authenticated admins can update product images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');

-- Authenticated admins can delete product images
CREATE POLICY "Authenticated admins can delete product images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');

-- ==========================================
-- 5. INDEX FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_out_of_stock ON public.products (is_out_of_stock);

-- ==========================================
-- 6. SEED DATA (Optional — for demo/testing)
-- ==========================================
-- Run this section ONLY if you want sample products.
-- Images are from Unsplash (public, no auth needed).
-- ==========================================

INSERT INTO public.products (title, description, price, image_url, is_out_of_stock) VALUES
  ('Evolve Earbuds', 'Dual ear fit | Customize half & full in-ear', 4995.00, 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop', false),
  ('Vesper AI Earbuds', '164+ Language Translator | ANC & ENC', 7595.00, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop', false),
  ('Warrior Earbuds', 'Environmental Noise Cancellation | Gaming Buds', 5895.00, 'https://images.unsplash.com/photo-1608754236920-3a27e7e758b2?w=600&h=600&fit=crop', true),
  ('Megawatt Power Bank', '30000 mAh | 65 Watt Max | Built-in Type-C Cable', 10995.00, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop', false),
  ('Magnus Headphones', 'Dedicated Active Noise Cancellation | Mood Tuned Sound', 6995.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', false),
  ('Hurricane Headphones', '25ms Ultra-Low Latency | Play Station | Laptop | Mobile', 8995.00, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop', false),
  ('Reverb Speaker', 'Portable Speaker | Dynamic LED', 4995.00, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop', true),
  ('Pulse Power Bank', '10000 mAh | 22.5 Watt Max | Digital Display', 5640.00, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop', false);
