-- ==============================================================================
-- Migration: 20261104000000_account_and_reading_data.sql
-- Description: Creates profiles, reading_progress, and bookmarks tables with RLS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile for new auth.users
CREATE OR REPLACE FUNCTION public.reverend_reader_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  raw_display_name TEXT;
  raw_username TEXT;
  raw_avatar_url TEXT;
BEGIN
  -- Extract Discord / OAuth metadata safely
  raw_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'custom_claims'->>'global_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1),
    'Cultivator'
  );

  raw_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );

  raw_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Insert profile, appending short ID snippet if username collision occurs
  BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, created_at, updated_at)
    VALUES (NEW.id, raw_username, raw_display_name, raw_avatar_url, NOW(), NOW());
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, created_at, updated_at)
    VALUES (NEW.id, raw_username || '_' || substr(NEW.id::text, 1, 6), raw_display_name, raw_avatar_url, NOW(), NOW());
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reverend_reader_on_auth_user_created ON auth.users;
CREATE TRIGGER reverend_reader_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_handle_new_user();

REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_handle_new_user() FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. READING PROGRESS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  chapter_number INTEGER,
  chapter_title TEXT,
  scroll_position DOUBLE PRECISION DEFAULT 0 NOT NULL,
  progress_updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT reading_progress_user_id_key UNIQUE (user_id),
  CONSTRAINT reading_progress_scroll_check CHECK (scroll_position >= 0 AND scroll_position <= 1)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON public.reading_progress(user_id);

-- Enable RLS
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Reading Progress Policies
DROP POLICY IF EXISTS "Users can view own reading progress" ON public.reading_progress;
CREATE POLICY "Users can view own reading progress"
  ON public.reading_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can update own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can delete own reading progress" ON public.reading_progress;

-- ------------------------------------------------------------------------------
-- 3. BOOKMARKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  chapter_number INTEGER,
  chapter_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT bookmarks_user_chapter_unique UNIQUE (user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Bookmarks Policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Keep client permissions narrow from the moment these tables are created.
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.reading_progress FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.bookmarks FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.reading_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;
