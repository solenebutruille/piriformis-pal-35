-- Fixes PGRST204 when `notes` was never applied (e.g. migration 20260408123000 skipped).
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS notes TEXT;
