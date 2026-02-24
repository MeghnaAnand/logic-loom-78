-- Session history table for tracking learning path
CREATE TABLE public.session_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_learning_tips JSONB
);

-- Enable RLS
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- Users can only read their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.session_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON public.session_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient user queries
CREATE INDEX idx_session_history_user_id ON public.session_history(user_id);
CREATE INDEX idx_session_history_completed_at ON public.session_history(completed_at DESC);