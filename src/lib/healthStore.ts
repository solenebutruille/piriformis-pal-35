export interface DailyLog {
  date: string; // YYYY-MM-DD
  maxPain: number; // 0-10
  leastPain: number; // 0-20
  exercises: string[];
  walkingMinutes: number;
  sleepQuality: number; // 1-5
}

const STORAGE_KEY = "piriformis-health-logs";
const EXERCISES_KEY = "piriformis-exercises";

export const DEFAULT_EXERCISES = ["Swimming", "Gym"];

export function getCustomExercises(): string[] {
  const stored = localStorage.getItem(EXERCISES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getAllExercises(): string[] {
  return [...DEFAULT_EXERCISES, ...getCustomExercises()];
}

export function addCustomExercise(name: string) {
  const custom = getCustomExercises();
  if (!custom.includes(name) && !DEFAULT_EXERCISES.includes(name)) {
    custom.push(name);
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(custom));
  }
}

export function getAllLogs(): DailyLog[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getLogForDate(date: string): DailyLog | undefined {
  return getAllLogs().find((l) => l.date === date);
}

export function saveLog(log: DailyLog) {
  const logs = getAllLogs().filter((l) => l.date !== log.date);
  logs.push(log);
  logs.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
