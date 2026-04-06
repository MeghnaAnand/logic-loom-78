
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  certificate_number TEXT NOT NULL UNIQUE DEFAULT 'AM-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  holder_name TEXT NOT NULL DEFAULT 'Learner',
  holder_email TEXT,
  chapters_completed INTEGER NOT NULL DEFAULT 0,
  puzzles_completed INTEGER NOT NULL DEFAULT 0,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificates for verification"
ON public.certificates
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert their own certificate"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificate"
ON public.certificates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
