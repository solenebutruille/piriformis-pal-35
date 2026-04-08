import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Save, Star, Trophy } from "lucide-react";
import {
  DailyLog,
  getAllExercises,
  addCustomExercise,
  getLogForDate,
  saveLog,
  todayString,
} from "@/lib/healthStore";

function painColor(value: number, max: number) {
  const ratio = value / max;
  if (ratio <= 0.3) return "text-pain-low";
  if (ratio <= 0.6) return "text-pain-mid";
  return "text-pain-high";
}

/** 1–10 day score: higher is better (inverse of pain coloring). */
function overallDayColor(score: number) {
  const ratio = (score - 1) / 9;
  if (ratio >= 0.67) return "text-pain-low";
  if (ratio >= 0.33) return "text-pain-mid";
  return "text-pain-high";
}

type DailyLogFormProps = {
  onSaved?: () => void;
  /** YYYY-MM-DD; defaults to today (Today tab). */
  forDate?: string;
  /** When this changes (e.g. global save counter), the form reloads from the server. */
  reloadToken?: number;
};

export default function DailyLogForm({ onSaved, forDate, reloadToken }: DailyLogFormProps) {
  const today = todayString();
  const dateKey = forDate ?? today;
  const isToday = dateKey === today;
  const [maxPain, setMaxPain] = useState(0);
  const [leastPain, setLeastPain] = useState(0);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [newExercise, setNewExercise] = useState("");
  const [walkingMinutes, setWalkingMinutes] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [overallDayScore, setOverallDayScore] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allEx, existing] = await Promise.all([
        getAllExercises(),
        getLogForDate(dateKey),
      ]);
      setExercises(allEx);
      if (existing) {
        setMaxPain(existing.maxPain);
        setLeastPain(existing.leastPain);
        setSelectedExercises(existing.exercises);
        setWalkingMinutes(existing.walkingMinutes);
        setSleepQuality(existing.sleepQuality);
        setOverallDayScore(existing.overallDayScore);
        setNotes(existing.notes);
      } else {
        setMaxPain(0);
        setLeastPain(0);
        setSelectedExercises([]);
        setWalkingMinutes(0);
        setSleepQuality(3);
        setOverallDayScore(5);
        setNotes("");
      }
      setLoading(false);
    }
    load();
  }, [dateKey, reloadToken]);

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const handleAddExercise = async () => {
    const trimmed = newExercise.trim();
    if (!trimmed) return;
    try {
      await addCustomExercise(trimmed);
      setExercises(await getAllExercises());
      setNewExercise("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save exercise");
    }
  };

  const handleSave = async () => {
    const log: DailyLog = {
      date: dateKey,
      maxPain,
      leastPain,
      exercises: selectedExercises,
      walkingMinutes,
      sleepQuality,
      overallDayScore,
      notes,
    };
    try {
      await saveLog(log);
      toast.success(isToday ? "Today's log saved!" : "Log saved!");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save log");
    }
  };

  const sleepLabels = ["Very Poor", "Poor", "Okay", "Good", "Excellent"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Overall day score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isToday
              ? "How did today feel overall? (not only pain — mood, energy, life stuff.)"
              : "How did that day feel overall? (not only pain — mood, energy, life stuff.)"}
          </p>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Score</span>
            <span className={`text-lg font-bold ${overallDayColor(overallDayScore)}`}>
              {overallDayScore}/10
            </span>
          </div>
          <Slider
            value={[overallDayScore]}
            onValueChange={([v]) => setOverallDayScore(v)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Pain Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Max pain experienced</span>
              <span className={`text-lg font-bold ${painColor(maxPain, 10)}`}>{maxPain}/10</span>
            </div>
            <Slider value={[maxPain]} onValueChange={([v]) => setMaxPain(v)} max={10} step={1} className="w-full" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Least pain experienced</span>
              <span className={`text-lg font-bold ${painColor(leastPain, 10)}`}>{leastPain}/10</span>
            </div>
            <Slider value={[leastPain]} onValueChange={([v]) => setLeastPain(v)} max={10} step={1} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Exercises Done</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {exercises.map((ex) => (
              <label
                key={ex}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedExercises.includes(ex)}
                  onCheckedChange={() => toggleExercise(ex)}
                />
                <span className="text-sm font-medium">{ex}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              placeholder="Add exercise..."
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
              className="bg-background"
            />
            <Button size="icon" variant="outline" onClick={handleAddExercise}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Activity & Sleep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Time walking</span>
              <span className="text-lg font-bold text-foreground">{walkingMinutes} min</span>
            </div>
            <Slider value={[walkingMinutes]} onValueChange={([v]) => setWalkingMinutes(v)} max={180} step={5} className="w-full" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Sleep quality</span>
              <span className="text-sm font-semibold text-foreground">{sleepLabels[sleepQuality - 1]}</span>
            </div>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setSleepQuality(v)}
                  className="transition-all duration-150"
                >
                  <Star
                    className={`h-8 w-8 ${
                      v <= sleepQuality
                        ? "fill-primary text-primary"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={
              isToday
                ? "Anything you want to remember about today (optional)…"
                : "Anything you want to remember about this day (optional)…"
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-y bg-background"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-2">{notes.length}/2000</p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full h-12 text-base font-semibold gap-2">
        <Save className="h-5 w-5" />
        {isToday ? "Save Today's Log" : "Save changes"}
      </Button>
    </div>
  );
}
