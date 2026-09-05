-- =====================================================================
-- RESET ALL USERS + CREATE THE 2 ADMIN ACCOUNTS
-- =====================================================================
-- Run manually in the Supabase SQL Editor, AFTER applying
-- migrations/006_admin_role_and_rls_fix.sql.
--
-- Lives OUTSIDE /migrations on purpose: that folder is scanned and
-- auto-applied by `npm run db:migrate`, and this script is destructive
-- and one-time.
--
-- ⚠️  IRREVERSIBLE. Deletes every row in public.users and auth.users
-- (auth.users cascades to auth.identities / sessions / refresh_tokens,
-- and — once 005 is applied — to public.users too). Take a backup first
-- if you want a way back.
--
-- NO EMAIL IS SENT BY THIS SCRIPT. A raw SQL INSERT bypasses GoTrue
-- (Supabase's auth API), and only GoTrue sends mail. That's also why
-- email_confirmed_at is set below — the accounts are born confirmed, so
-- no confirmation mail is needed.
--
-- HOW EACH ADMIN GETS IN
--   1. This script creates the account with a RANDOM password that
--      nobody knows — not even you. It is never meant to be used.
--   2. The admin opens /forgot-password on the site and enters their
--      email. THAT is what makes Supabase send the reset email.
--   3. They click the link → /auth/confirm → /update-password → they
--      set their real password.
--   4. From then on they are an ordinary account; the only thing that
--      makes them an admin is public.users.role = 'admin' (section 3).
--
--   Locked out because the email never arrives? Supabase Dashboard →
--   Authentication → Users → (user) → "Send password recovery" or set a
--   password directly. No need to re-run this script.
--
-- Normal users are NOT created here — they come through the app's
-- signup flow and get role = 'user' automatically.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. WIPE ALL EXISTING USERS
-- ---------------------------------------------------------------------
DELETE FROM public.users;
DELETE FROM auth.users;

-- ---------------------------------------------------------------------
-- 2. CREATE THE 2 ADMIN ACCOUNTS IN SUPABASE AUTH
--    crypt()/gen_salt('bf') writes the same bcrypt format GoTrue uses.
--    The password is gen_random_uuid() — unguessable and discarded, since
--    step 2 of the flow above replaces it.
--    Inserting into auth.users fires on_auth_user_created, which creates
--    the public.users row with role='user'; section 3 promotes it.
--    public.users.password stays NULL on purpose: AuthService.login skips
--    its pre-check while NULL, and AuthService.updatePassword fills in the
--    correct hash the moment the admin sets their real password.
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin 1 — mubashershakeel1009@gmail.com
WITH new_admin AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'mubashershakeel1009@gmail.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Mubasher Shakeel'),
    now(), now(),
    '', '', '', ''
  )
  RETURNING id, email
)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(), new_admin.id, new_admin.id::text,
  jsonb_build_object('sub', new_admin.id::text, 'email', new_admin.email),
  'email', now(), now(), now()
FROM new_admin;

-- Admin 2 — rehmanraza4521@gmail.com
WITH new_admin AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'rehmanraza4521@gmail.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Rehman Raza'),
    now(), now(),
    '', '', '', ''
  )
  RETURNING id, email
)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(), new_admin.id, new_admin.id::text,
  jsonb_build_object('sub', new_admin.id::text, 'email', new_admin.email),
  'email', now(), now(), now()
FROM new_admin;

-- ---------------------------------------------------------------------
-- 3. PROMOTE THEM TO ADMIN
--    The one and only thing granting admin rights — read by is_admin()
--    (RLS), checkIsAdmin() (/dashboard) and the navbar.
-- ---------------------------------------------------------------------
UPDATE public.users
SET role = 'admin'::public.user_role
WHERE lower(email) IN (
  'mubashershakeel1009@gmail.com',
  'rehmanraza4521@gmail.com'
);

COMMIT;

-- ---------------------------------------------------------------------
-- 4. VERIFY — expect exactly 2 rows, both role = 'admin'
-- ---------------------------------------------------------------------
SELECT id, email, name, role, created_at
FROM public.users
ORDER BY created_at;

-- =====================================================================
-- FALLBACK — if the auth.users / auth.identities INSERT errors
-- =====================================================================
-- Those are Supabase-internal tables (undocumented, GoTrue-version-
-- dependent). The shape above matches GoTrue's current identity-linking
-- schema, but on a "column ... does not exist" error, don't hand-patch:
--   1. Run section 1 as-is (plain, version-safe SQL).
--   2. Create both admins via Supabase Dashboard → Authentication →
--      Users → Add user (any password, tick "Auto Confirm User").
--   3. Run section 3 to promote them, then section 4 to verify.
