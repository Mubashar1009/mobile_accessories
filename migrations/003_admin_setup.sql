-- UP
-- =====================================================
-- ADMIN SETUP
-- 1. admin_emails allowlist – add/remove admins here
-- 2. Trigger to sync auth.users → public.users on signup
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

-- Note: Admin emails should NOT be hardcoded in migration files.
-- Insert your production/dev admin emails via Supabase SQL Editor or a private seed script:
-- Example (Run manually in SQL Editor or via seed script):
-- INSERT INTO public.admin_emails (email) VALUES ('<admin-email>');

-- Only allow admins to read this table (not public)
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin_emails"
  ON public.admin_emails
  FOR SELECT
  USING (public.is_admin());

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
      WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE LOWER(email) = LOWER(NEW.email))
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

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
/*
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP TABLE    IF EXISTS public.admin_emails;
*/
