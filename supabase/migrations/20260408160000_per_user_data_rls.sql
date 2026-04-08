-- Per-user data: wipe shared rows, add user_id, tighten RLS.
-- After this migration, enable the Google provider in Supabase Dashboard → Authentication → Providers.

DROP POLICY IF EXISTS "Anyone can read daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Anyone can insert daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Anyone can update daily logs" ON public.daily_logs;

DROP POLICY IF EXISTS "Anyone can read exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Anyone can add exercises" ON public.custom_exercises;

TRUNCATE TABLE public.daily_logs;
TRUNCATE TABLE public.custom_exercises;

ALTER TABLE public.daily_logs DROP CONSTRAINT IF EXISTS daily_logs_date_key;

ALTER TABLE public.daily_logs
  ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE DEFAULT (auth.uid());

ALTER TABLE public.daily_logs
  ADD CONSTRAINT daily_logs_user_id_date_key UNIQUE (user_id, date);

ALTER TABLE public.custom_exercises DROP CONSTRAINT IF EXISTS custom_exercises_name_key;

ALTER TABLE public.custom_exercises
  ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE DEFAULT (auth.uid());

ALTER TABLE public.custom_exercises
  ADD CONSTRAINT custom_exercises_user_id_name_key UNIQUE (user_id, name);

CREATE POLICY "Users select own daily_logs"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily_logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily_logs"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own daily_logs"
  ON public.daily_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users select own custom_exercises"
  ON public.custom_exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own custom_exercises"
  ON public.custom_exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own custom_exercises"
  ON public.custom_exercises FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own custom_exercises"
  ON public.custom_exercises FOR DELETE
  USING (auth.uid() = user_id);
