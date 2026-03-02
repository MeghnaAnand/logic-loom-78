
-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Users insert own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users view own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users insert own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users view own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users update own skills" ON public.user_skills;

-- Also drop any older names
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.session_history;
DROP POLICY IF EXISTS "Users can insert own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can view own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can update own skills" ON public.user_skills;

-- Recreate as PERMISSIVE (explicit keyword)
CREATE POLICY "allow_insert_own_sessions" ON public.session_history
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_select_own_sessions" ON public.session_history
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_skills" ON public.user_skills
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_select_own_skills" ON public.user_skills
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "allow_update_own_skills" ON public.user_skills
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
