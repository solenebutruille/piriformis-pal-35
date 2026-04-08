
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  max_pain INTEGER NOT NULL DEFAULT 0,
  least_pain INTEGER NOT NULL DEFAULT 0,
  exercises TEXT[] NOT NULL DEFAULT '{}',
  walking_minutes INTEGER NOT NULL DEFAULT 0,
  sleep_quality INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily logs"
  ON public.daily_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert daily logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update daily logs"
  ON public.daily_logs FOR UPDATE
  USING (true);

CREATE TABLE public.custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises"
  ON public.custom_exercises FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add exercises"
  ON public.custom_exercises FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
