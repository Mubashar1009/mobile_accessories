-- UP
-- =====================================================
-- ENUM: product_category
-- Mirrors the Category enum in src/types/product/index.ts
-- =====================================================
CREATE TYPE public.product_category AS ENUM (
  'earbuds',
  'headphones',
  'speakers',
  'power-banks',
  'smart-trackers',
  'lcd-panels',
  'parts',
  'cables'
);

-- =====================================================
-- TABLE: public.products
-- Matches the Product interface in src/types/product/index.ts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id               UUID                   DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT                   NOT NULL,
  description      TEXT,

  -- Pricing
  -- price          = the current selling / discounted price (always required)
  -- original_price = the MRP / strike-through price; NULL means no discount
  -- Rule: original_price must be strictly greater than price when provided
  price            NUMERIC(10, 2)         NOT NULL DEFAULT 0
                     CONSTRAINT price_positive CHECK (price >= 0),
  original_price   NUMERIC(10, 2)
                     CONSTRAINT original_price_positive CHECK (original_price IS NULL OR original_price > 0)
                     CONSTRAINT original_gt_sale       CHECK (original_price IS NULL OR original_price > price),

  -- Auto-computed discount percentage (Postgres keeps this in sync).
  -- NULL when no original_price is set (i.e. no active discount).
  discount_pct     NUMERIC(5, 2)          GENERATED ALWAYS AS (
                     CASE
                       WHEN original_price IS NOT NULL AND original_price > 0
                       THEN ROUND(((original_price - price) / original_price) * 100, 2)
                       ELSE NULL
                     END
                   ) STORED,

  tag              TEXT,
  category         public.product_category,
  colors           TEXT,
  image_url        TEXT,
  is_out_of_stock  BOOLEAN                NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ            NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can read products
CREATE POLICY "Products are publicly readable"
  ON public.products
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert products
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only authenticated admins can update products
CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only authenticated admins can delete products
CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- STORAGE BUCKET: product-images
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Admins can upload product images
CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- Admins can update product images
CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- Admins can delete product images
CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_created_at      ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category        ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_out_of_stock ON public.products (is_out_of_stock);
-- Partial index: fast storefront queries for in-stock products
CREATE INDEX IF NOT EXISTS idx_products_in_stock        ON public.products (created_at DESC)
  WHERE is_out_of_stock = false;
-- Partial index: fast queries for products currently on discount
CREATE INDEX IF NOT EXISTS idx_products_on_discount     ON public.products (discount_pct DESC)
  WHERE original_price IS NOT NULL;

-- =====================================================
-- ADD-COLUMN HELPERS (run only when migrating an existing DB)
-- =====================================================
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category public.product_category;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2)
--   CONSTRAINT original_price_positive CHECK (original_price IS NULL OR original_price > 0)
--   CONSTRAINT original_gt_sale CHECK (original_price IS NULL OR original_price > price);
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5,2)
--   GENERATED ALWAYS AS (
--     CASE WHEN original_price IS NOT NULL AND original_price > 0
--          THEN ROUND(((original_price - price) / original_price) * 100, 2)
--          ELSE NULL END
--   ) STORED;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tag TEXT;

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
/*
DROP INDEX IF EXISTS idx_products_on_discount;
DROP INDEX IF EXISTS idx_products_in_stock;
DROP INDEX IF EXISTS idx_products_is_out_of_stock;
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_created_at;
DROP TABLE IF EXISTS public.products;
DROP TYPE  IF EXISTS public.product_category;
*/
