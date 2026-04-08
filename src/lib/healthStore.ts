import { supabase } from "@/integrations/supabase/client";

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sign in required");
  return user.id;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  maxPain: number; // 0-10
  leastPain: number; // 0-10
  exercises: string[];
  walkingMinutes: number;
  sleepQuality: number; // 1-5
  overallDayScore: number; // 1-10 — how the day felt overall
  notes: string; // optional free-text; stored as null when empty
}

export const DEFAULT_EXERCISES = ["Swimming", "Abductor"];

export async function getCustomExercises(): Promise<string[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

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
  const userId = await requireUserId();
  const { error } = await supabase
    .from("custom_exercises")
    .upsert({ user_id: userId, name }, { onConflict: "user_id,name" });
  if (error) throw error;
}

export async function getAllLogs(): Promise<DailyLog[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .order("date", { ascending: false });
  return (
    data?.map((row) => ({
      date: row.date,
      maxPain: row.max_pain,
      leastPain: Math.min(10, Math.max(0, row.least_pain)),
      exercises: row.exercises,
      walkingMinutes: row.walking_minutes,
      sleepQuality: row.sleep_quality,
      overallDayScore: row.overall_day_score ?? 5,
      notes: row.notes ?? "",
    })) ?? []
  );
}

export async function getLogForDate(
  date: string,
): Promise<DailyLog | undefined> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return undefined;

  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (!data) return undefined;
  return {
    date: data.date,
    maxPain: data.max_pain,
    leastPain: Math.min(10, Math.max(0, data.least_pain)),
    exercises: data.exercises,
    walkingMinutes: data.walking_minutes,
    sleepQuality: data.sleep_quality,
    overallDayScore: data.overall_day_score ?? 5,
    notes: data.notes ?? "",
  };
}

export async function saveLog(log: DailyLog): Promise<void> {
  const userId = await requireUserId();
  const notesValue = log.notes.trim() === "" ? null : log.notes.trim();

  const fields = {
    max_pain: log.maxPain,
    least_pain: Math.min(10, Math.max(0, log.leastPain)),
    exercises: log.exercises,
    walking_minutes: log.walkingMinutes,
    sleep_quality: log.sleepQuality,
    overall_day_score: log.overallDayScore,
    notes: notesValue,
  };

  const { data: updatedRows, error: updateError } = await supabase
    .from("daily_logs")
    .update(fields)
    .eq("user_id", userId)
    .eq("date", log.date)
    .select("id");

  if (updateError) throw updateError;

  if (updatedRows && updatedRows.length > 0) return;

  const { error: insertError } = await supabase.from("daily_logs").insert({
    user_id: userId,
    date: log.date,
    ...fields,
  });

  if (!insertError) return;

  if (insertError.code === "23505") {
    const { error: retryErr } = await supabase
      .from("daily_logs")
      .update(fields)
      .eq("user_id", userId)
      .eq("date", log.date);
    if (retryErr) throw retryErr;
    return;
  }

  throw insertError;
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
