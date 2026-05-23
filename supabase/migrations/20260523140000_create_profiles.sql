-- ZPATH user profile (TrialForm + RIASEC sync via lib/profile-db.ts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  school text NOT NULL DEFAULT '',
  grade text NOT NULL DEFAULT '',
  target_university text NOT NULL DEFAULT '',
  score_math double precision NOT NULL DEFAULT 0,
  score_literature double precision NOT NULL DEFAULT 0,
  elective_subject_1 text NOT NULL DEFAULT '',
  elective_score_1 double precision NOT NULL DEFAULT 0,
  elective_subject_2 text NOT NULL DEFAULT '',
  elective_score_2 double precision NOT NULL DEFAULT 0,
  ielts double precision NOT NULL DEFAULT 0,
  cultural_award text NOT NULL DEFAULT 'none',
  region text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles (updated_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

COMMENT ON TABLE public.profiles IS 'Hồ sơ học sinh ZPATH (điểm, RIASEC, nguyện vọng)';
