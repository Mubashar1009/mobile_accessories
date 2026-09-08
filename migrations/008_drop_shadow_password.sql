-- UP
-- =====================================================
-- DROP THE SHADOW PASSWORD COLUMN
-- =====================================================
-- 004 added public.users.password to hold an HMAC-SHA256 copy of each
-- user's password, which AuthService.login checked before delegating to
-- Supabase Auth. That copy is removed in favour of Supabase Auth's bcrypt
-- hash in auth.users.encrypted_password, which was always the real
-- authenticator.
--
-- Why the column has to go, not just its read path:
--   1. It gated nothing. Passing the HMAC check still required passing
--      signInWithPassword; failing it meant signInWithPassword would have
--      rejected the request too. It only ever rejected what Supabase was
--      already rejecting.
--   2. HMAC-SHA256 is one round of hashing, not a KDF, keyed with a single
--      process-wide secret and NO per-user salt. Equal passwords produced
--      equal hashes, so one leak of this column exposes the whole user base
--      to offline dictionary attack at GPU speed.
--   3. 001's "Users can view own profile" policy grants SELECT on a user's
--      own row, and 004 never excluded the new column from it — so any
--      signed-in user could read their own hash from the browser with the
--      anon key.
--   4. Whenever the copy drifted from the real password (a failed sync
--      after a reset), login refused a password Supabase would have
--      accepted — a lockout with no compensating benefit.
--
-- Nothing reads or writes this column after this migration:
-- src/lib/auth-crypto.ts is deleted and AuthService no longer references it.
-- =====================================================

ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- =====================================================
-- TRIGGER: drop the password write from the signup path
-- =====================================================
-- 006's version of this function already stopped writing `password`, but it
-- is redeclared here so the function is correct regardless of which
-- migration last touched it, and so re-running 004 by accident cannot
-- resurrect a reference to a column that no longer exists.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    'user'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    name       = EXCLUDED.name,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
-- Restoring the column restores an empty column, NOT the old hashes, and
-- AuthService no longer populates it. Reintroducing the shadow-password
-- scheme is not a supported rollback.
/*
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
*/
