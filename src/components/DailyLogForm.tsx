import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";
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
  const [averagePain, setAveragePain] = useState(0);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [newExercise, setNewExercise] = useState("");
  const [walkingMinutes, setWalkingMinutes] = useState(0);
  const [maxSittingMinutes, setMaxSittingMinutes] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [exerciseIntensity, setExerciseIntensity] = useState(0);
  const [sittingIntensity, setSittingIntensity] = useState(0);
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
        setAveragePain(existing.averagePain);
        setSelectedExercises(existing.exercises);
        setWalkingMinutes(existing.walkingMinutes);
        setMaxSittingMinutes(existing.maxSittingMinutes);
        setSleepQuality(existing.sleepQuality);
        setExerciseIntensity(existing.exerciseIntensity);
        setSittingIntensity(existing.sittingIntensity);
        setNotes(existing.notes);
      } else {
        setMaxPain(0);
        setLeastPain(0);
        setAveragePain(0);
        setSelectedExercises([]);
        setWalkingMinutes(0);
        setMaxSittingMinutes(0);
        setSleepQuality(0);
        setExerciseIntensity(0);
        setSittingIntensity(0);
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
      averagePain,
      exercises: selectedExercises,
      walkingMinutes,
      maxSittingMinutes,
      sleepQuality,
      exerciseIntensity,
      sittingIntensity,
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

  const sleepEmoji = ["😫", "😩", "😕", "😟", "😐", "🙂", "😊", "😌", "😴", "🌟"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  const formattedDate = new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      {isToday && (
        <p className="text-sm text-muted-foreground text-center">{formattedDate}</p>
      )}
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
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Average pain</span>
              <span className={`text-lg font-bold ${painColor(averagePain, 10)}`}>{averagePain}/10</span>
            </div>
            <Slider value={[averagePain]} onValueChange={([v]) => setAveragePain(v)} max={10} step={1} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Sleep quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Last night</span>
            <span className="text-lg font-bold text-foreground">{sleepQuality}/10 · {sleepEmoji[sleepQuality - 1] ?? "😐"}</span>
          </div>
          <Slider value={[sleepQuality]} onValueChange={([v]) => setSleepQuality(v)} min={0} max={10} step={1} className="w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Exercise intensity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Overall intensity</span>
            <span className={`text-lg font-bold ${painColor(exerciseIntensity, 10)}`}>{exerciseIntensity}/10</span>
          </div>
          <Slider value={[exerciseIntensity]} onValueChange={([v]) => setExerciseIntensity(v)} min={0} max={10} step={1} className="w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Sitting intensity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Overall sitting load</span>
            <span className={`text-lg font-bold ${painColor(sittingIntensity, 10)}`}>{sittingIntensity}/10</span>
          </div>
          <Slider value={[sittingIntensity]} onValueChange={([v]) => setSittingIntensity(v)} min={0} max={10} step={1} className="w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Exercises & Activity</CardTitle>
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
          <CardTitle className="text-lg font-heading">Time walking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Duration</span>
            <span className="text-lg font-bold text-foreground">{walkingMinutes} min</span>
          </div>
          <Slider value={[walkingMinutes]} onValueChange={([v]) => setWalkingMinutes(v)} max={180} step={5} className="w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">Max sitting time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Longest sitting stretch</span>
            <span className="text-lg font-bold text-foreground">{maxSittingMinutes} min</span>
          </div>
          <Slider value={[maxSittingMinutes]} onValueChange={([v]) => setMaxSittingMinutes(v)} min={0} max={480} step={5} className="w-full" />
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
