-- Forward-only correction for the previous progress and grants migrations.
-- Removes their RPC overloads so PostgREST cannot select an older timestamp API.

DROP FUNCTION IF EXISTS public.sync_reading_progress(
  TEXT, INTEGER, TEXT, DOUBLE PRECISION, TIMESTAMPTZ, INTEGER
);
DROP FUNCTION IF EXISTS public.sync_reading_progress(
  TEXT, INTEGER, TEXT, DOUBLE PRECISION, INTEGER
);

CREATE OR REPLACE FUNCTION public.sync_reading_progress(
  p_expected_user_id UUID,
  p_expected_version INTEGER,
  p_chapter_id TEXT,
  p_chapter_number INTEGER,
  p_chapter_title TEXT,
  p_scroll_position DOUBLE PRECISION
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
  updated BOOLEAN,
  record_exists BOOLEAN
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

  IF v_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_expected_version IS NULL OR p_expected_version < 0 THEN
    RAISE EXCEPTION 'expected_version must be a non-negative integer' USING ERRCODE = '22023';
  END IF;

  IF p_chapter_id IS NULL
     OR p_chapter_id !~ '^[1-9][0-9]{0,3}$'
     OR p_chapter_number IS NULL
     OR p_chapter_number < 1
     OR p_chapter_number > 2334
     OR p_chapter_id::INTEGER IS DISTINCT FROM p_chapter_number
     OR p_chapter_title IS NULL
     OR length(p_chapter_title) < 1
     OR length(p_chapter_title) > 300 THEN
    RAISE EXCEPTION 'Invalid chapter metadata' USING ERRCODE = '22023';
  END IF;

  IF p_scroll_position IS NULL
     OR p_scroll_position < 0.0
     OR p_scroll_position > 1.0 THEN
    RAISE EXCEPTION 'scroll_position must be between 0.0 and 1.0' USING ERRCODE = '22003';
  END IF;

  -- A 64-bit transaction lock serializes this user's writes even before the
  -- user's first row exists. Each call takes only one lock, so users do not
  -- create lock-order cycles; hash collisions can only add brief contention.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('reverend_reader_progress:' || v_user_id::TEXT, 0)
  );

  SELECT *
    INTO v_current_record
    FROM public.reading_progress AS rp
   WHERE rp.user_id = v_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    IF p_expected_version <> 0 THEN
      RETURN QUERY SELECT
        NULL::UUID,
        v_user_id,
        NULL::TEXT,
        NULL::INTEGER,
        NULL::TEXT,
        NULL::DOUBLE PRECISION,
        NULL::TIMESTAMPTZ,
        0,
        FALSE,
        FALSE;
      RETURN;
    END IF;

    INSERT INTO public.reading_progress (
      user_id,
      chapter_id,
      chapter_number,
      chapter_title,
      scroll_position,
      progress_updated_at,
      version
    )
    VALUES (
      v_user_id,
      p_chapter_id,
      p_chapter_number,
      p_chapter_title,
      p_scroll_position,
      pg_catalog.now(),
      1
    )
    RETURNING * INTO v_current_record;

    RETURN QUERY SELECT
      v_current_record.id,
      v_current_record.user_id,
      v_current_record.chapter_id,
      v_current_record.chapter_number,
      v_current_record.chapter_title,
      v_current_record.scroll_position,
      v_current_record.progress_updated_at,
      v_current_record.version,
      TRUE,
      TRUE;
    RETURN;
  END IF;

  IF p_expected_version <> v_current_record.version THEN
    RETURN QUERY SELECT
      v_current_record.id,
      v_current_record.user_id,
      v_current_record.chapter_id,
      v_current_record.chapter_number,
      v_current_record.chapter_title,
      v_current_record.scroll_position,
      v_current_record.progress_updated_at,
      v_current_record.version,
      FALSE,
      TRUE;
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
   RETURNING rp.* INTO v_current_record;

  RETURN QUERY SELECT
    v_current_record.id,
    v_current_record.user_id,
    v_current_record.chapter_id,
    v_current_record.chapter_number,
    v_current_record.chapter_title,
    v_current_record.scroll_position,
    v_current_record.progress_updated_at,
    v_current_record.version,
    TRUE,
    TRUE;
END;
$$;

-- Reset privileges only on this application's user-data tables. The progress
-- table is read-only to clients; every write must pass through the CAS RPC.
DROP POLICY IF EXISTS "Users can insert own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can update own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can delete own reading progress" ON public.reading_progress;

REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.reading_progress FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.bookmarks FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.reading_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;

-- Restrict this application RPC and its signup trigger without revoking
-- privileges from unrelated routines in the public schema.
REVOKE ALL PRIVILEGES ON FUNCTION public.sync_reading_progress(
  UUID, INTEGER, TEXT, INTEGER, TEXT, DOUBLE PRECISION
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_reading_progress(
  UUID, INTEGER, TEXT, INTEGER, TEXT, DOUBLE PRECISION
) TO authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.reverend_reader_handle_new_user() FROM PUBLIC, anon, authenticated;
