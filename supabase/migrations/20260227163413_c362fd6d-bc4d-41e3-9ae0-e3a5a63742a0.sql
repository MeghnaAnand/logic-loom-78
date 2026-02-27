
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.session_history;

CREATE POLICY "Users can insert own sessions"
  ON public.session_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions"
  ON public.session_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_skills too
DROP POLICY IF EXISTS "Users can insert own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can view own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can update own skills" ON public.user_skills;

CREATE POLICY "Users can insert own skills"
  ON public.user_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own skills"
  ON public.user_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON public.user_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
