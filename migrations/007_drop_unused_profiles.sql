-- UP
-- =====================================================
-- DROP THE UNUSED public.profiles TABLE
-- =====================================================
-- Created by migration [005] create profiles, whose file
-- (migrations/005_create_profiles.sql) no longer exists anywhere —
-- not on disk, not in the git index, not in any commit — while the
-- schema_migrations row for it remains. Its shape (id, name, email,
-- ssn) reads like a trial run of the EncryptionExtension's encrypted-
-- field support rather than anything this product uses.
--
-- Safe to drop, verified against the live database before writing this:
--   * 0 rows
--   * 0 references anywhere in src/ (nothing reads or writes it)
--   * no other table has a foreign key pointing at it
--   * no triggers attached
--
-- The [005] history row is deliberately left in place: rewriting
-- applied migration history is worse than carrying one stale entry
-- whose effect this migration reverses.
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP TABLE  IF EXISTS public.profiles;

-- DOWN (Rollback Section — Safe: Commented out for manual SQL Editor runs)
-- Reconstructed from the live schema as it stood before this migration,
-- since the original 005 file is unrecoverable.
/*
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  ssn         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
*/
