import { supabase } from "@/integrations/supabase/client";

export interface DailyLog {
  date: string; // YYYY-MM-DD
  maxPain: number; // 0-10
  leastPain: number; // 0-20
  exercises: string[];
  walkingMinutes: number;
  sleepQuality: number; // 1-5
}

export const DEFAULT_EXERCISES = ["Swimming", "Gym"];

export async function getCustomExercises(): Promise<string[]> {
  const { data } = await supabase
    .from("custom_exercises")
    .select("name")
    .order("created_at");
  return data?.map((e) => e.name) ?? [];
}

export async function getAllExercises(): Promise<string[]> {
  const custom = await getCustomExercises();
  return [...DEFAULT_EXERCISES, ...custom];
}

export async function addCustomExercise(name: string): Promise<void> {
  if (DEFAULT_EXERCISES.includes(name)) return;
  await supabase.from("custom_exercises").upsert({ name }, { onConflict: "name" });
}

export async function getAllLogs(): Promise<DailyLog[]> {
  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .order("date", { ascending: false });
  return (
    data?.map((row) => ({
      date: row.date,
      maxPain: row.max_pain,
      leastPain: row.least_pain,
      exercises: row.exercises,
      walkingMinutes: row.walking_minutes,
      sleepQuality: row.sleep_quality,
    })) ?? []
  );
}

export async function getLogForDate(date: string): Promise<DailyLog | undefined> {
  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (!data) return undefined;
  return {
    date: data.date,
    maxPain: data.max_pain,
    leastPain: data.least_pain,
    exercises: data.exercises,
    walkingMinutes: data.walking_minutes,
    sleepQuality: data.sleep_quality,
  };
}

export async function saveLog(log: DailyLog): Promise<void> {
  await supabase.from("daily_logs").upsert(
    {
      date: log.date,
      max_pain: log.maxPain,
      least_pain: log.leastPain,
      exercises: log.exercises,
      walking_minutes: log.walkingMinutes,
      sleep_quality: log.sleepQuality,
    },
    { onConflict: "date" }
  );
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
