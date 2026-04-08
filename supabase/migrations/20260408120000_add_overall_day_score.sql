ALTER TABLE public.daily_logs
  ADD COLUMN overall_day_score INTEGER NOT NULL DEFAULT 5;

ALTER TABLE public.daily_logs
  ADD CONSTRAINT daily_logs_overall_day_score_range
  CHECK (overall_day_score >= 1 AND overall_day_score <= 10);
