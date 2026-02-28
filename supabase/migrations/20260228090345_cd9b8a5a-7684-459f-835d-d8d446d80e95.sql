
-- Drop ALL existing policies and recreate as explicitly PERMISSIVE
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users can insert own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can view own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can update own skills" ON public.user_skills;

-- session_history: permissive INSERT + SELECT
CREATE POLICY "Users insert own sessions"
  ON public.session_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own sessions"
  ON public.session_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- user_skills: permissive INSERT + SELECT + UPDATE
CREATE POLICY "Users insert own skills"
  ON public.user_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own skills"
  ON public.user_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own skills"
  ON public.user_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
