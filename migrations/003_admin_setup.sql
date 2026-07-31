-- UP
-- =====================================================
-- ADMIN SETUP
-- 1. admin_emails allowlist  – add/remove admins here
-- 2. Trigger to sync auth.users → public.users on signup
-- 3. Replace hardcoded-email RLS policies with role-based ones
-- =====================================================

-- =====================================================
-- 1. ADMIN EMAILS ALLOWLIST TABLE
--    Add new admin emails here; the trigger below will
--    automatically grant them role = 'admin' when they
--    sign up / accept the Supabase invite.
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email     TEXT        PRIMARY KEY,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed your initial two admins (replace with real emails)
INSERT INTO public.admin_emails (email) VALUES
  ('admin1@yourdomain.com'),
  ('admin2@yourdomain.com')
ON CONFLICT (email) DO NOTHING;

-- Only allow admins to read this table (not public)
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin_emails"
  ON public.admin_emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. TRIGGER: auto-populate public.users on Supabase signup
--    Fires when a user accepts an invite or signs up.
--    Sets role = 'admin' if their email is in admin_emails,
--    otherwise role = 'user'.
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as the DB owner so it can write public.users
SET search_path = public  -- prevent search_path injection
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    -- Use full_name from metadata if provided (Supabase invite sets this),
    -- otherwise fall back to the part before @ in the email.
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    CASE
      WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email)
        THEN 'admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;   -- idempotent: safe to re-run
  RETURN NEW;
END;
$$;

-- Fire once per new auth user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- =====================================================
-- 3. FIX PRODUCT RLS — replace hardcoded email with role check
--    Drop the old policies created in 002 and re-create them
--    so the admin check goes through public.users.role.
-- =====================================================

-- Helper: returns true if the caller is an authenticated admin
-- (used inside each policy so you only write the logic once)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── Products table ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (public.is_admin());

-- ── Storage: product-images bucket ───────────────────────
DROP POLICY IF EXISTS "Admins can upload product images"  ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images"  ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images"  ON storage.objects;

CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND public.is_admin()
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND public.is_admin()
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- DOWN
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP TABLE    IF EXISTS public.admin_emails;
-- Note: re-run 002_create_products.sql DOWN + UP to restore old hardcoded-email policies
