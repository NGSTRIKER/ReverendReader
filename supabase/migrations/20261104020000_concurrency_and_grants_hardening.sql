-- ============================================================================
-- Migration: 20261104020000_concurrency_and_grants_hardening.sql
-- Installs a locked, version-CAS progress RPC and narrowly scopes privileges.
-- Migration 030 replaces this transitional RPC with the final API signature.
-- ============================================================================

-- Remove the legacy client-timestamp overload before exposing the CAS RPC.
DROP FUNCTION IF EXISTS public.sync_reading_progress(
  TEXT, INTEGER, TEXT, DOUBLE PRECISION, TIMESTAMPTZ, INTEGER
);

CREATE OR REPLACE FUNCTION public.sync_reading_progress(
  p_chapter_id TEXT,
  p_chapter_number INTEGER,
  p_chapter_title TEXT,
  p_scroll_position DOUBLE PRECISION,
  p_expected_version INTEGER
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  chapter_id TEXT,
  chapter_number INTEGER,
  chapter_title TEXT,
  scroll_position DOUBLE PRECISION,
  progress_updated_at TIMESTAMPTZ,
  version INTEGER,
  updated BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_current_record public.reading_progress%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_expected_version IS NULL OR p_expected_version < 0 THEN
    RAISE EXCEPTION 'expected_version must be non-negative' USING ERRCODE = '22023';
  END IF;

  IF p_chapter_id IS NULL OR p_chapter_id !~ '^[1-9][0-9]{0,3}$' THEN
    RAISE EXCEPTION 'Invalid chapter id' USING ERRCODE = '22023';
  END IF;
  IF p_chapter_number IS NULL OR p_chapter_number < 1 OR p_chapter_number > 2334
     OR p_chapter_id::INTEGER IS DISTINCT FROM p_chapter_number THEN
    RAISE EXCEPTION 'Invalid chapter number' USING ERRCODE = '22023';
  END IF;
  IF p_chapter_title IS NULL OR length(p_chapter_title) < 1 OR length(p_chapter_title) > 300 THEN
    RAISE EXCEPTION 'Invalid chapter title' USING ERRCODE = '22023';
  END IF;
  IF p_scroll_position IS NULL OR p_scroll_position < 0.0 OR p_scroll_position > 1.0 THEN
    RAISE EXCEPTION 'scroll_position must be between 0 and 1' USING ERRCODE = '22003';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('reverend_reader_progress:' || v_user_id::TEXT, 0)
  );

  SELECT * INTO v_current_record
    FROM public.reading_progress AS rp
   WHERE rp.user_id = v_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    IF p_expected_version <> 0 THEN
      RETURN QUERY SELECT NULL::UUID, v_user_id, NULL::TEXT, NULL::INTEGER,
        NULL::TEXT, NULL::DOUBLE PRECISION, NULL::TIMESTAMPTZ, 0, FALSE;
      RETURN;
    END IF;

    INSERT INTO public.reading_progress (
      user_id, chapter_id, chapter_number, chapter_title,
      scroll_position, progress_updated_at, version
    ) VALUES (
      v_user_id, p_chapter_id, p_chapter_number, p_chapter_title,
      p_scroll_position, pg_catalog.now(), 1
    )
    RETURNING public.reading_progress.id, public.reading_progress.user_id,
      public.reading_progress.chapter_id, public.reading_progress.chapter_number,
      public.reading_progress.chapter_title, public.reading_progress.scroll_position,
      public.reading_progress.progress_updated_at, public.reading_progress.version, TRUE
    INTO id, user_id, chapter_id, chapter_number, chapter_title,
      scroll_position, progress_updated_at, version, updated;
    RETURN NEXT;
    RETURN;
  END IF;

  IF p_expected_version <> v_current_record.version THEN
    id := v_current_record.id;
    user_id := v_current_record.user_id;
    chapter_id := v_current_record.chapter_id;
    chapter_number := v_current_record.chapter_number;
    chapter_title := v_current_record.chapter_title;
    scroll_position := v_current_record.scroll_position;
    progress_updated_at := v_current_record.progress_updated_at;
    version := v_current_record.version;
    updated := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.reading_progress AS rp
     SET chapter_id = p_chapter_id,
         chapter_number = p_chapter_number,
         chapter_title = p_chapter_title,
         scroll_position = p_scroll_position,
         progress_updated_at = pg_catalog.now(),
         version = v_current_record.version + 1
   WHERE rp.user_id = v_user_id
   RETURNING rp.id, rp.user_id, rp.chapter_id, rp.chapter_number,
     rp.chapter_title, rp.scroll_position, rp.progress_updated_at,
     rp.version, TRUE
   INTO id, user_id, chapter_id, chapter_number, chapter_title,
     scroll_position, progress_updated_at, version, updated;
  RETURN NEXT;
END;
$$;

-- Revoke and regrant only privileges on this app's tables and functions.
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.reading_progress FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.bookmarks FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.reading_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.sync_reading_progress(
  TEXT, INTEGER, TEXT, DOUBLE PRECISION, INTEGER
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_reading_progress(
  TEXT, INTEGER, TEXT, DOUBLE PRECISION, INTEGER
) TO authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_handle_new_user() FROM PUBLIC, anon, authenticated;
