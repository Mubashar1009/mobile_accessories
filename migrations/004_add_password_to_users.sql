-- UP
-- =====================================================
-- ADD PASSWORD COLUMN TO USERS TABLE
-- =====================================================
-- Adds the password field in public.users to store encrypted / hashed passwords
-- =====================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- =====================================================
-- UPDATE TRIGGER: sync encrypted password on auth signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as the DB owner so it can write public.users
SET search_path = public  -- prevent search_path injection
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, password, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data ->> 'encrypted_password',
    CASE
      WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE LOWER(email) = LOWER(NEW.email))
        THEN 'admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
/*
ALTER TABLE public.users DROP COLUMN IF EXISTS password;
*/
