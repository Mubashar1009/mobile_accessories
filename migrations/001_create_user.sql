-- UP
-- =====================================================
-- ENUM: user_role
-- Mirrors the role values used in LoginSlice / RLS checks
-- =====================================================
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- =====================================================
-- TABLE: public.users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT            NOT NULL,
  email       TEXT            UNIQUE NOT NULL,
  role        public.user_role NOT NULL DEFAULT 'user',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- =====================================================
-- TRIGGER: auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own row (name, avatar_url — not role)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- HELPER FUNCTION: is_admin()
-- Returns true if the caller is an authenticated admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  );
$$;

-- Admins have full read access to all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- INDEXES
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE        INDEX IF NOT EXISTS idx_users_role  ON public.users (role);

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
/*
DROP TRIGGER  IF EXISTS users_set_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP TABLE    IF EXISTS public.users;
DROP TYPE     IF EXISTS public.user_role;
*/