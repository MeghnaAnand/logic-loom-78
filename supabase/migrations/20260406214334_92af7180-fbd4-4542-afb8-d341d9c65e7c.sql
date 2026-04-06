
CREATE TABLE public.speed_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  total_time_sec INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.speed_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
ON public.speed_leaderboard
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert own scores"
ON public.speed_leaderboard
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
