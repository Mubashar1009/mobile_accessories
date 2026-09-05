-- UP
-- =====================================================
-- ADMIN MODEL SIMPLIFICATION + RLS HARDENING
-- =====================================================
-- Model this migration moves to:
--   * Normal users sign up through the app  → role = 'user'
--   * Admins are created manually in SQL    → role = 'admin'
--   * After creation, admins use the very same login / forgot-password
--     flows as everyone else — nothing about auth is admin-specific.
--
-- Consequences:
--   1. public.admin_emails is dropped. It only earned its keep when an
--      admin arrived through the signup flow and the trigger had to
--      decide their role at insert time. Admins are now inserted by
--      hand, so `UPDATE public.users SET role='admin'` says the same
--      thing without a second source of truth that can drift from
--      users.role (which is_admin(), checkIsAdmin() and the navbar all
--      already treat as authoritative).
--   2. The self-update RLS policy is removed — see section 3.
-- =====================================================

-- =====================================================
-- 1. DROP THE ADMIN ALLOWLIST
-- =====================================================
DROP POLICY IF EXISTS "Only admins can view admin_emails" ON public.admin_emails;
DROP TABLE  IF EXISTS public.admin_emails;

-- =====================================================
-- 2. TRIGGER: every signup is a plain user
--    Also drops the `raw_user_meta_data ->> 'encrypted_password'` read
--    added in 004: nothing in the app ever sets that metadata key, so
--    it was always NULL — and routing a password hash through
--    client-settable metadata would be the wrong idea anyway.
--    AuthService.signup writes public.users.password itself, right
--    after signUp() returns.
-- =====================================================
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

-- =====================================================
-- 3. FIX PRIVILEGE ESCALATION
--    001 shipped:
--      CREATE POLICY "Users can update own profile" ON public.users
--        FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
--    Its comment claimed role was excluded, but nothing checked the
--    role column — so any signed-in user could call
--      supabase.from('users').update({ role: 'admin' }).eq('id', <own id>)
--    from the browser with the anon key and grant themselves the
--    dashboard plus every product/storage write policy.
--
--    The app never updates public.users from the client (the only
--    client-side touch is a `select('role')` in useNavbar; all writes
--    go through Server Actions on the service-role key, which bypasses
--    RLS), so the policy is removed outright rather than patched.
-- =====================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Defense in depth: even if a self-update policy is reintroduced later,
-- a role change from a normal user's session is refused here.
-- auth.uid() IS NULL covers the service-role/server contexts.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin()
  THEN
    RAISE EXCEPTION 'Not allowed to change user role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_prevent_role_escalation ON public.users;
CREATE TRIGGER users_prevent_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- =====================================================
-- 4. TIE public.users TO auth.users
--    001 declared `id UUID DEFAULT gen_random_uuid() PRIMARY KEY` with
--    no foreign key: a row could be created with an id belonging to no
--    auth user, and deleting an auth user (Dashboard, Admin API) left
--    an orphaned profile behind. The id must always BE the auth user's
--    id, so the random default goes too.
-- =====================================================
DELETE FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id);

ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;

-- =====================================================
-- 5. DROP REDUNDANT INDEX
--    users.email is already declared UNIQUE in 001, which creates its
--    own index — idx_users_email was a second copy of it.
-- =====================================================
DROP INDEX IF EXISTS public.idx_users_email;

-- Case-insensitive uniqueness instead: Supabase Auth lowercases emails
-- and findUserByEmail() matches on a lowercased value, but nothing at
-- the DB level enforced that assumption until now.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
  ON public.users (lower(email));

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
/*
DROP INDEX   IF EXISTS public.idx_users_email_lower;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
ALTER TABLE  public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE  public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
DROP TRIGGER IF EXISTS users_prevent_role_escalation ON public.users;
DROP FUNCTION IF EXISTS public.prevent_role_escalation();
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email    TEXT        PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
*/
