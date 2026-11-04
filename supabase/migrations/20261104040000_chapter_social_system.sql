-- ==============================================================================
-- Migration: 20261104040000_chapter_social_system.sql
-- Description: Chapter-scoped social features (likes, comments, threaded replies,
--              comment likes, comment reports, chapter reactions) for all
--              chapters in ONE shared schema, plus bookmark write hardening.
--
-- Security model
--   * RLS is enabled on every new table. Ownership is always derived from
--     auth.uid(): user_id / reporter_id default to auth.uid(), clients are NOT
--     granted INSERT on those columns, and policies re-check them.
--   * Table privileges are revoked from PUBLIC/anon/authenticated and then
--     re-granted per column (Supabase auto-grants ALL on new objects).
--   * Aggregate counts and public author fields are exposed only through
--     narrow, read-only SECURITY DEFINER RPCs. The owner-only profiles RLS
--     policy is left untouched.
--   * Comment reports are insert-only for clients; nobody but the service role
--     / dashboard can read them.
--
-- Forward-only and idempotent: safe to re-run; it never drops user data.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. SHARED VALIDATION
-- ------------------------------------------------------------------------------
-- Chapter ids are the decimal manifest ids "1".."2334" (same rule as the
-- reading-progress RPC). CASE guarantees the cast only runs on digit strings.
CREATE OR REPLACE FUNCTION public.reverend_reader_is_valid_chapter_id(p_chapter_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p_chapter_id ~ '^[1-9][0-9]{0,3}$' THEN p_chapter_id::INTEGER <= 2334
    ELSE FALSE
  END;
$$;

-- Normalises user-supplied comment text: strips control characters (keeps
-- newline/tab), collapses 3+ blank lines, and trims surrounding whitespace.
CREATE OR REPLACE FUNCTION public.reverend_reader_normalize_comment(p_content TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT pg_catalog.regexp_replace(
    pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(
        pg_catalog.replace(COALESCE(p_content, ''), E'\r\n', E'\n'),
        E'[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'
      ),
      E'\\n{3,}', E'\n\n', 'g'
    ),
    E'^\\s+|\\s+$', '', 'g'
  );
$$;

-- ------------------------------------------------------------------------------
-- 1. BOOKMARK HARDENING & SIGNUP TRIGGER FIX
-- ------------------------------------------------------------------------------
-- Fix bug in reverend_reader_handle_new_user() where ->>'custom_claims'->>'global_name'
-- applied ->> to TEXT instead of JSONB (->'custom_claims'->>'global_name').
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
  raw_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->'custom_claims'->>'global_name',
    NEW.raw_user_meta_data->>'preferred_username',
    pg_catalog.split_part(NEW.email, '@', 1),
    'Cultivator'
  );

  raw_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    pg_catalog.split_part(NEW.email, '@', 1),
    'user_' || pg_catalog.substr(NEW.id::text, 1, 8)
  );

  raw_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, created_at, updated_at)
    VALUES (NEW.id, raw_username, raw_display_name, raw_avatar_url, pg_catalog.now(), pg_catalog.now());
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, created_at, updated_at)
    VALUES (NEW.id, raw_username || '_' || pg_catalog.substr(NEW.id::text, 1, 6), raw_display_name, raw_avatar_url, pg_catalog.now(), pg_catalog.now());
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_handle_new_user() FROM PUBLIC, anon, authenticated;

-- Clients insert bookmarks directly. Previously any chapter_id string and an
-- unbounded chapter_title were accepted, allowing unbounded storage per user.
-- NOT VALID: enforced for all new writes without rescanning legacy rows.
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_chapter_id_format;
ALTER TABLE public.bookmarks
  ADD CONSTRAINT bookmarks_chapter_id_format
  CHECK (public.reverend_reader_is_valid_chapter_id(chapter_id)) NOT VALID;

ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_chapter_title_length;
ALTER TABLE public.bookmarks
  ADD CONSTRAINT bookmarks_chapter_title_length
  CHECK (chapter_title IS NULL OR pg_catalog.char_length(chapter_title) <= 300) NOT VALID;

-- ------------------------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapter_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chapter_likes_chapter_id_check
    CHECK (public.reverend_reader_is_valid_chapter_id(chapter_id)),
  -- Also serves COUNT(*) per chapter and the viewer lookup (index-only scans).
  CONSTRAINT chapter_likes_chapter_user_key UNIQUE (chapter_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  -- Denormalised counters maintained only by SECURITY DEFINER triggers. They
  -- make "Top" cursor pagination index-backed and avoid per-page aggregation.
  like_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comments_chapter_id_check
    CHECK (public.reverend_reader_is_valid_chapter_id(chapter_id)),
  CONSTRAINT comments_content_check CHECK (
    (is_deleted AND content = '')
    OR (
      NOT is_deleted
      AND pg_catalog.char_length(content) BETWEEN 1 AND 1000
      AND content ~ '\S'
    )
  ),
  CONSTRAINT comments_not_own_parent CHECK (parent_id IS DISTINCT FROM id),
  CONSTRAINT comments_like_count_check CHECK (like_count >= 0),
  CONSTRAINT comments_reply_count_check CHECK (reply_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comment_likes_comment_user_key UNIQUE (comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comment_reports_reason_check
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'spoiler', 'other')),
  CONSTRAINT comment_reports_details_check
    CHECK (details IS NULL OR pg_catalog.char_length(details) <= 500),
  CONSTRAINT comment_reports_comment_reporter_key UNIQUE (comment_id, reporter_id)
);

CREATE TABLE IF NOT EXISTS public.chapter_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chapter_reactions_chapter_id_check
    CHECK (public.reverend_reader_is_valid_chapter_id(chapter_id)),
  CONSTRAINT chapter_reactions_type_check
    CHECK (reaction_type IN ('love', 'funny', 'shock', 'sad', 'fire')),
  CONSTRAINT chapter_reactions_chapter_user_key UNIQUE (chapter_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES (only what the access paths need)
-- ------------------------------------------------------------------------------
-- Unique constraints above already index (chapter_id, user_id) and
-- (comment_id, user_id|reporter_id), covering counts, viewer lookups and FK
-- cascades from comments.

-- Top-level comments, "Top" sort keyset: (like_count, created_at, id) DESC.
CREATE INDEX IF NOT EXISTS idx_comments_chapter_top
  ON public.comments (chapter_id, like_count DESC, created_at DESC, id DESC)
  WHERE parent_id IS NULL;

-- Top-level comments, "Newest"/"Oldest" keyset (scanned in either direction).
-- Also backs the per-chapter comment count.
CREATE INDEX IF NOT EXISTS idx_comments_chapter_recent
  ON public.comments (chapter_id, created_at DESC, id DESC)
  WHERE parent_id IS NULL;

-- Replies of one parent in chronological order; also backs the parent FK.
CREATE INDEX IF NOT EXISTS idx_comments_parent_created
  ON public.comments (parent_id, created_at, id)
  WHERE parent_id IS NOT NULL;

-- Per-user comment rate limit and auth.users ON DELETE CASCADE.
CREATE INDEX IF NOT EXISTS idx_comments_user_created
  ON public.comments (user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. TRIGGERS: validation, server-controlled fields, counters
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reverend_reader_comments_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_parent RECORD;
  v_recent INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Server-controlled fields can never be supplied by a client.
    NEW.is_deleted := FALSE;
    NEW.like_count := 0;
    NEW.reply_count := 0;
    NEW.created_at := pg_catalog.now();
    NEW.updated_at := NEW.created_at;
    NEW.is_spoiler := COALESCE(NEW.is_spoiler, FALSE);
    NEW.content := public.reverend_reader_normalize_comment(NEW.content);

    IF NEW.parent_id IS NOT NULL THEN
      SELECT c.chapter_id, c.parent_id, c.is_deleted
        INTO v_parent
        FROM public.comments AS c
       WHERE c.id = NEW.parent_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Parent comment not found' USING ERRCODE = '23503';
      END IF;
      IF v_parent.chapter_id IS DISTINCT FROM NEW.chapter_id THEN
        RAISE EXCEPTION 'Replies must belong to the same chapter' USING ERRCODE = '23514';
      END IF;
      IF v_parent.parent_id IS NOT NULL THEN
        RAISE EXCEPTION 'Replies cannot be nested more than one level' USING ERRCODE = '23514';
      END IF;
      IF v_parent.is_deleted THEN
        RAISE EXCEPTION 'Cannot reply to a deleted comment' USING ERRCODE = '23514';
      END IF;
    END IF;

    -- Lightweight abuse throttle for end users (the service role is exempt).
    IF auth.uid() IS NOT NULL THEN
      SELECT pg_catalog.count(*)::INTEGER
        INTO v_recent
        FROM public.comments AS c
       WHERE c.user_id = NEW.user_id
         AND c.created_at > pg_catalog.now() - INTERVAL '1 minute';
      IF v_recent >= 5 THEN
        RAISE EXCEPTION 'rate_limited: too many comments, please wait a moment'
          USING ERRCODE = 'P0001';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.chapter_id IS DISTINCT FROM OLD.chapter_id
     OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Comment ownership and placement are immutable' USING ERRCODE = '42501';
  END IF;

  IF OLD.is_deleted AND NOT NEW.is_deleted THEN
    RAISE EXCEPTION 'Deleted comments cannot be restored' USING ERRCODE = '42501';
  END IF;

  IF NEW.is_deleted AND NOT OLD.is_deleted THEN
    -- Soft delete keeps the thread shape but erases the text permanently.
    NEW.content := '';
    NEW.is_spoiler := FALSE;
    NEW.updated_at := pg_catalog.now();
  ELSIF OLD.is_deleted THEN
    IF NEW.content IS DISTINCT FROM OLD.content
       OR NEW.is_spoiler IS DISTINCT FROM OLD.is_spoiler THEN
      RAISE EXCEPTION 'Deleted comments cannot be edited' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.content IS DISTINCT FROM OLD.content
     OR NEW.is_spoiler IS DISTINCT FROM OLD.is_spoiler THEN
    NEW.content := public.reverend_reader_normalize_comment(NEW.content);
    NEW.updated_at := pg_catalog.now();
  ELSE
    -- Counter-only updates from the counter triggers keep updated_at intact.
    NEW.updated_at := OLD.updated_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reverend_reader_comments_before_write ON public.comments;
CREATE TRIGGER reverend_reader_comments_before_write
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_comments_before_write();

-- Reply counters (counts visible, i.e. non-deleted, replies). SECURITY DEFINER
-- because the acting user can neither write counters nor others' comments.
CREATE OR REPLACE FUNCTION public.reverend_reader_comments_reply_counter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments
       SET reply_count = reply_count + 1
     WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.comments
       SET reply_count = GREATEST(reply_count - 1, 0)
     WHERE id = NEW.parent_id;
  ELSE
    UPDATE public.comments
       SET reply_count = GREATEST(reply_count - 1, 0)
     WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reverend_reader_comments_reply_insert ON public.comments;
CREATE TRIGGER reverend_reader_comments_reply_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW
  WHEN (NEW.parent_id IS NOT NULL)
  EXECUTE FUNCTION public.reverend_reader_comments_reply_counter();

DROP TRIGGER IF EXISTS reverend_reader_comments_reply_soft_delete ON public.comments;
CREATE TRIGGER reverend_reader_comments_reply_soft_delete
  AFTER UPDATE OF is_deleted ON public.comments
  FOR EACH ROW
  WHEN (NEW.parent_id IS NOT NULL AND NEW.is_deleted AND NOT OLD.is_deleted)
  EXECUTE FUNCTION public.reverend_reader_comments_reply_counter();

DROP TRIGGER IF EXISTS reverend_reader_comments_reply_delete ON public.comments;
CREATE TRIGGER reverend_reader_comments_reply_delete
  AFTER DELETE ON public.comments
  FOR EACH ROW
  WHEN (OLD.parent_id IS NOT NULL AND NOT OLD.is_deleted)
  EXECUTE FUNCTION public.reverend_reader_comments_reply_counter();

-- Comment like counters.
CREATE OR REPLACE FUNCTION public.reverend_reader_comment_likes_counter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments
       SET like_count = like_count + 1
     WHERE id = NEW.comment_id;
  ELSE
    UPDATE public.comments
       SET like_count = GREATEST(like_count - 1, 0)
     WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reverend_reader_comment_likes_counter ON public.comment_likes;
CREATE TRIGGER reverend_reader_comment_likes_counter
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_comment_likes_counter();

-- Server-controlled timestamps for the remaining tables.
CREATE OR REPLACE FUNCTION public.reverend_reader_social_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := pg_catalog.now();
    IF TG_TABLE_NAME = 'chapter_reactions' THEN
      NEW.updated_at := NEW.created_at;
    END IF;
  ELSIF TG_TABLE_NAME = 'chapter_reactions' THEN
    IF NEW.chapter_id IS DISTINCT FROM OLD.chapter_id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Reaction ownership is immutable' USING ERRCODE = '42501';
    END IF;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := pg_catalog.now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reverend_reader_chapter_likes_timestamps ON public.chapter_likes;
CREATE TRIGGER reverend_reader_chapter_likes_timestamps
  BEFORE INSERT ON public.chapter_likes
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_social_timestamps();

DROP TRIGGER IF EXISTS reverend_reader_comment_likes_timestamps ON public.comment_likes;
CREATE TRIGGER reverend_reader_comment_likes_timestamps
  BEFORE INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_social_timestamps();

DROP TRIGGER IF EXISTS reverend_reader_comment_reports_timestamps ON public.comment_reports;
CREATE TRIGGER reverend_reader_comment_reports_timestamps
  BEFORE INSERT ON public.comment_reports
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_social_timestamps();

DROP TRIGGER IF EXISTS reverend_reader_chapter_reactions_timestamps ON public.chapter_reactions;
CREATE TRIGGER reverend_reader_chapter_reactions_timestamps
  BEFORE INSERT OR UPDATE ON public.chapter_reactions
  FOR EACH ROW EXECUTE FUNCTION public.reverend_reader_social_timestamps();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.chapter_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_reactions ENABLE ROW LEVEL SECURITY;

-- Helper for report policy: policy subqueries run with the caller's
-- privileges, and comments.user_id is intentionally not readable by clients.
CREATE OR REPLACE FUNCTION public.reverend_reader_comment_is_reportable(p_comment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.comments AS c
     WHERE c.id = p_comment_id
       AND NOT c.is_deleted
       AND c.user_id IS DISTINCT FROM auth.uid()
  );
$$;

-- chapter_likes: a user sees and manages only their own like rows. Public
-- counts come from get_chapter_social(), so who-liked-what stays private.
DROP POLICY IF EXISTS "Users can view own chapter likes" ON public.chapter_likes;
CREATE POLICY "Users can view own chapter likes"
  ON public.chapter_likes FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can like chapters" ON public.chapter_likes;
CREATE POLICY "Users can like chapters"
  ON public.chapter_likes FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unlike chapters" ON public.chapter_likes;
CREATE POLICY "Users can unlike chapters"
  ON public.chapter_likes FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- comments: public read (deleted rows carry no text), owner-only writes.
-- There is no DELETE policy/grant: deletion is a soft delete via UPDATE so a
-- user cannot cascade-delete other users' replies.
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Users can create own comments" ON public.comments;
CREATE POLICY "Users can create own comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can edit own comments" ON public.comments;
CREATE POLICY "Users can edit own comments"
  ON public.comments FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- comment_likes
DROP POLICY IF EXISTS "Users can view own comment likes" ON public.comment_likes;
CREATE POLICY "Users can view own comment likes"
  ON public.comment_likes FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can like visible comments" ON public.comment_likes;
CREATE POLICY "Users can like visible comments"
  ON public.comment_likes FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.comments AS c
       WHERE c.id = comment_id AND NOT c.is_deleted
    )
  );

DROP POLICY IF EXISTS "Users can unlike comments" ON public.comment_likes;
CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- comment_reports: insert-only. No SELECT/UPDATE/DELETE policy exists, so
-- report data is unreadable through the API by anyone but the service role.
DROP POLICY IF EXISTS "Users can report other users comments" ON public.comment_reports;
CREATE POLICY "Users can report other users comments"
  ON public.comment_reports FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = reporter_id
    AND public.reverend_reader_comment_is_reportable(comment_id)
  );

-- chapter_reactions: own rows only; aggregates via get_chapter_social().
DROP POLICY IF EXISTS "Users can view own chapter reactions" ON public.chapter_reactions;
CREATE POLICY "Users can view own chapter reactions"
  ON public.chapter_reactions FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can add own chapter reactions" ON public.chapter_reactions;
CREATE POLICY "Users can add own chapter reactions"
  ON public.chapter_reactions FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can change own chapter reactions" ON public.chapter_reactions;
CREATE POLICY "Users can change own chapter reactions"
  ON public.chapter_reactions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove own chapter reactions" ON public.chapter_reactions;
CREATE POLICY "Users can remove own chapter reactions"
  ON public.chapter_reactions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- 6. READ RPCs (aggregates + public author fields only)
-- ------------------------------------------------------------------------------
-- One round trip for the sidebar of the active chapter.
CREATE OR REPLACE FUNCTION public.get_chapter_social(p_chapter_id TEXT)
RETURNS TABLE (
  chapter_id TEXT,
  like_count BIGINT,
  comment_count BIGINT,
  reaction_counts JSONB,
  viewer_liked BOOLEAN,
  viewer_reaction TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF NOT public.reverend_reader_is_valid_chapter_id(p_chapter_id) THEN
    RAISE EXCEPTION 'Invalid chapter id' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    p_chapter_id,
    (SELECT pg_catalog.count(*) FROM public.chapter_likes AS l
      WHERE l.chapter_id = p_chapter_id),
    -- Visible top-level comments plus their visible replies, read from the
    -- top-level partial index only.
    (SELECT COALESCE(pg_catalog.sum((NOT c.is_deleted)::INTEGER + c.reply_count), 0)::BIGINT
       FROM public.comments AS c
      WHERE c.chapter_id = p_chapter_id AND c.parent_id IS NULL),
    (SELECT COALESCE(pg_catalog.jsonb_object_agg(r.reaction_type, r.n), '{}'::JSONB)
       FROM (
         SELECT cr.reaction_type, pg_catalog.count(*) AS n
           FROM public.chapter_reactions AS cr
          WHERE cr.chapter_id = p_chapter_id
          GROUP BY cr.reaction_type
       ) AS r),
    (v_uid IS NOT NULL AND EXISTS (
       SELECT 1 FROM public.chapter_likes AS l
        WHERE l.chapter_id = p_chapter_id AND l.user_id = v_uid)),
    (SELECT cr.reaction_type FROM public.chapter_reactions AS cr
      WHERE v_uid IS NOT NULL AND cr.chapter_id = p_chapter_id AND cr.user_id = v_uid);
END;
$$;

-- Shared projection: never exposes user ids; avatar URLs are restricted to the
-- Discord CDN (also enforced by CSP); names are length-capped.
CREATE OR REPLACE FUNCTION public.get_chapter_comments(
  p_chapter_id TEXT,
  p_sort TEXT DEFAULT 'top',
  p_limit INTEGER DEFAULT 20,
  p_cursor_like_count INTEGER DEFAULT NULL,
  p_cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chapter_id TEXT,
  parent_id UUID,
  content TEXT,
  is_spoiler BOOLEAN,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count INTEGER,
  reply_count INTEGER,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  viewer_liked BOOLEAN,
  is_own BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 51);
  v_has_cursor BOOLEAN := p_cursor_created_at IS NOT NULL;
  v_cursor_sql TEXT;
  v_order_sql TEXT;
BEGIN
  IF NOT public.reverend_reader_is_valid_chapter_id(p_chapter_id) THEN
    RAISE EXCEPTION 'Invalid chapter id' USING ERRCODE = '22023';
  END IF;
  IF p_sort IS NULL OR p_sort NOT IN ('top', 'newest', 'oldest') THEN
    RAISE EXCEPTION 'Invalid sort' USING ERRCODE = '22023';
  END IF;
  IF v_has_cursor AND (p_cursor_id IS NULL OR (p_sort = 'top' AND p_cursor_like_count IS NULL)) THEN
    RAISE EXCEPTION 'Incomplete cursor' USING ERRCODE = '22023';
  END IF;

  -- Only these constant fragments are ever spliced in; every value is bound
  -- through USING, so the dynamic statement cannot be injected. Dynamic SQL
  -- gives each sort its own plan that walks the matching keyset index.
  IF p_sort = 'top' THEN
    v_cursor_sql := '(c.like_count, c.created_at, c.id) < ($3, $4, $5)';
    v_order_sql := 'c.like_count DESC, c.created_at DESC, c.id DESC';
  ELSIF p_sort = 'newest' THEN
    v_cursor_sql := '(c.created_at, c.id) < ($4, $5)';
    v_order_sql := 'c.created_at DESC, c.id DESC';
  ELSE
    v_cursor_sql := '(c.created_at, c.id) > ($4, $5)';
    v_order_sql := 'c.created_at ASC, c.id ASC';
  END IF;

  IF NOT v_has_cursor THEN
    v_cursor_sql := 'TRUE';
  END IF;

  RETURN QUERY EXECUTE pg_catalog.format(
    $q$
    WITH page AS (
      SELECT c.*
        FROM public.comments AS c
       WHERE c.chapter_id = $1
         AND c.parent_id IS NULL
         AND (NOT c.is_deleted OR c.reply_count > 0)
         AND %1$s
       ORDER BY %2$s
       LIMIT $2
    )
    SELECT
      c.id, c.chapter_id, c.parent_id, c.content, c.is_spoiler, c.is_deleted,
      c.created_at, c.updated_at, c.like_count, c.reply_count,
      CASE WHEN c.is_deleted THEN NULL ELSE pg_catalog.left(p.username, 40) END,
      CASE WHEN c.is_deleted THEN NULL
           ELSE pg_catalog.left(COALESCE(NULLIF(p.display_name, ''), p.username), 60) END,
      CASE WHEN NOT c.is_deleted
                AND p.avatar_url ~ '^https://cdn\.discordapp\.com/[A-Za-z0-9_./-]+(\?[A-Za-z0-9=&_.-]*)?$'
                AND pg_catalog.char_length(p.avatar_url) <= 300
           THEN p.avatar_url END,
      ($6::UUID IS NOT NULL AND EXISTS (
         SELECT 1 FROM public.comment_likes AS cl
          WHERE cl.comment_id = c.id AND cl.user_id = $6::UUID)),
      ($6::UUID IS NOT NULL AND NOT c.is_deleted AND c.user_id = $6::UUID)
    FROM page AS c
    LEFT JOIN public.profiles AS p ON p.id = c.user_id
    ORDER BY %2$s
    $q$,
    v_cursor_sql,
    v_order_sql
  )
  USING p_chapter_id, v_limit, p_cursor_like_count, p_cursor_created_at, p_cursor_id, v_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_comment_replies(
  p_parent_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chapter_id TEXT,
  parent_id UUID,
  content TEXT,
  is_spoiler BOOLEAN,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count INTEGER,
  reply_count INTEGER,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  viewer_liked BOOLEAN,
  is_own BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
#variable_conflict use_column
DECLARE
  v_uid UUID := auth.uid();
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 51);
BEGIN
  IF p_parent_id IS NULL THEN
    RAISE EXCEPTION 'Missing parent id' USING ERRCODE = '22023';
  END IF;
  IF p_cursor_created_at IS NOT NULL AND p_cursor_id IS NULL THEN
    RAISE EXCEPTION 'Incomplete cursor' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    c.id, c.chapter_id, c.parent_id, c.content, c.is_spoiler, c.is_deleted,
    c.created_at, c.updated_at, c.like_count, c.reply_count,
    pg_catalog.left(p.username, 40),
    pg_catalog.left(COALESCE(NULLIF(p.display_name, ''), p.username), 60),
    CASE WHEN p.avatar_url ~ '^https://cdn\.discordapp\.com/[A-Za-z0-9_./-]+(\?[A-Za-z0-9=&_.-]*)?$'
              AND pg_catalog.char_length(p.avatar_url) <= 300
         THEN p.avatar_url END,
    (v_uid IS NOT NULL AND EXISTS (
       SELECT 1 FROM public.comment_likes AS cl
        WHERE cl.comment_id = c.id AND cl.user_id = v_uid)),
    (v_uid IS NOT NULL AND c.user_id = v_uid)
  FROM public.comments AS c
  LEFT JOIN public.profiles AS p ON p.id = c.user_id
  WHERE c.parent_id = p_parent_id
    AND NOT c.is_deleted
    AND (p_cursor_created_at IS NULL OR (c.created_at, c.id) > (p_cursor_created_at, p_cursor_id))
  ORDER BY c.created_at ASC, c.id ASC
  LIMIT v_limit;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. WRITE RPC (SECURITY INVOKER: RLS and column grants still apply)
-- ------------------------------------------------------------------------------
-- Idempotent set/change/remove of the caller's single reaction for a chapter.
CREATE OR REPLACE FUNCTION public.set_chapter_reaction(
  p_chapter_id TEXT,
  p_reaction_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF NOT public.reverend_reader_is_valid_chapter_id(p_chapter_id) THEN
    RAISE EXCEPTION 'Invalid chapter id' USING ERRCODE = '22023';
  END IF;

  IF p_reaction_type IS NULL THEN
    DELETE FROM public.chapter_reactions AS cr
     WHERE cr.chapter_id = p_chapter_id AND cr.user_id = v_uid;
    RETURN NULL;
  END IF;

  IF p_reaction_type NOT IN ('love', 'funny', 'shock', 'sad', 'fire') THEN
    RAISE EXCEPTION 'Invalid reaction type' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.chapter_reactions AS cr (chapter_id, reaction_type)
  VALUES (p_chapter_id, p_reaction_type)
  ON CONFLICT (chapter_id, user_id)
  DO UPDATE SET reaction_type = EXCLUDED.reaction_type
  WHERE cr.reaction_type IS DISTINCT FROM EXCLUDED.reaction_type;

  RETURN p_reaction_type;
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. PRIVILEGES (least privilege, column-scoped)
-- ------------------------------------------------------------------------------
REVOKE ALL PRIVILEGES ON TABLE public.chapter_likes FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.comments FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.comment_likes FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.comment_reports FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.chapter_reactions FROM PUBLIC, anon, authenticated;

-- chapter_likes: user_id is never client-writable (defaults to auth.uid()).
GRANT SELECT, DELETE ON TABLE public.chapter_likes TO authenticated;
GRANT INSERT (chapter_id) ON TABLE public.chapter_likes TO authenticated;

-- comments: user_id is not readable or writable; counters/flags are server-side.
GRANT SELECT (
  id, chapter_id, parent_id, content, is_spoiler, is_deleted,
  like_count, reply_count, created_at, updated_at
) ON TABLE public.comments TO anon, authenticated;
GRANT INSERT (chapter_id, parent_id, content, is_spoiler) ON TABLE public.comments TO authenticated;
GRANT UPDATE (content, is_spoiler, is_deleted) ON TABLE public.comments TO authenticated;

-- comment_likes
GRANT SELECT, DELETE ON TABLE public.comment_likes TO authenticated;
GRANT INSERT (comment_id) ON TABLE public.comment_likes TO authenticated;

-- comment_reports: write-only.
GRANT INSERT (comment_id, reason, details) ON TABLE public.comment_reports TO authenticated;

-- chapter_reactions
GRANT SELECT, DELETE ON TABLE public.chapter_reactions TO authenticated;
GRANT INSERT (chapter_id, reaction_type) ON TABLE public.chapter_reactions TO authenticated;
GRANT UPDATE (reaction_type) ON TABLE public.chapter_reactions TO authenticated;

-- Functions: revoke Supabase's default EXECUTE grants, then allow only the
-- intended API surface. Trigger/policy helpers are not callable by clients.
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_comments_before_write() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_comments_reply_counter() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_comment_likes_counter() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_social_timestamps() FROM PUBLIC, anon, authenticated;

-- Policy helper must stay executable by the role evaluating the policy.
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_comment_is_reportable(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reverend_reader_comment_is_reportable(UUID) TO authenticated;

-- Pure validators used by CHECK constraints and triggers.
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_is_valid_chapter_id(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reverend_reader_is_valid_chapter_id(TEXT) TO anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_normalize_comment(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reverend_reader_normalize_comment(TEXT) TO authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_chapter_social(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chapter_social(TEXT) TO anon, authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_chapter_comments(TEXT, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chapter_comments(TEXT, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, UUID) TO anon, authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_comment_replies(UUID, INTEGER, TIMESTAMPTZ, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_comment_replies(UUID, INTEGER, TIMESTAMPTZ, UUID) TO anon, authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.set_chapter_reaction(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_chapter_reaction(TEXT, TEXT) TO authenticated;
