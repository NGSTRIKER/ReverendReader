-- Forward-only security corrections for account and reading tables.
-- The locked progress RPC is created in migration 020 and finalized in 030.

-- Replace any old broad profile visibility policy with owner-only visibility.
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

ALTER TABLE public.reading_progress
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Keep grants limited to these application tables; never revoke privileges on
-- unrelated tables, sequences, or routines in the public schema.
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.reading_progress FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.bookmarks FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.reading_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_handle_new_user() FROM PUBLIC, anon, authenticated;
