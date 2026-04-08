import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Save, Star } from "lucide-react";
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

export default function DailyLogForm({ onSaved }: { onSaved?: () => void }) {
  const today = todayString();
  const [maxPain, setMaxPain] = useState(0);
  const [leastPain, setLeastPain] = useState(0);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [newExercise, setNewExercise] = useState("");
  const [walkingMinutes, setWalkingMinutes] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allEx, existing] = await Promise.all([
        getAllExercises(),
        getLogForDate(today),
      ]);
      setExercises(allEx);
      if (existing) {
        setMaxPain(existing.maxPain);
        setLeastPain(existing.leastPain);
        setSelectedExercises(existing.exercises);
        setWalkingMinutes(existing.walkingMinutes);
        setSleepQuality(existing.sleepQuality);
      }
      setLoading(false);
    }
    load();
  }, [today]);

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const handleAddExercise = async () => {
    const trimmed = newExercise.trim();
    if (!trimmed) return;
    await addCustomExercise(trimmed);
    setExercises(await getAllExercises());
    setNewExercise("");
  };

  const handleSave = async () => {
    const log: DailyLog = {
      date: today,
      maxPain,
      leastPain,
      exercises: selectedExercises,
      walkingMinutes,
      sleepQuality,
    };
    await saveLog(log);
    toast.success("Today's log saved!");
    onSaved?.();
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
              <span className={`text-lg font-bold ${painColor(leastPain, 20)}`}>{leastPain}/20</span>
            </div>
            <Slider value={[leastPain]} onValueChange={([v]) => setLeastPain(v)} max={20} step={1} className="w-full" />
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

      <Button onClick={handleSave} className="w-full h-12 text-base font-semibold gap-2">
        <Save className="h-5 w-5" />
        Save Today's Log
      </Button>
    </div>
  );
}
