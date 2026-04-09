import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DailyLogForm from "@/components/DailyLogForm";
import { DailyLog, getAllLogs, todayString } from "@/lib/healthStore";
import {
  Activity,
  CalendarPlus,
  Check,
  Dumbbell,
  Footprints,
  MessageSquare,
  Moon,
  Pencil,
  Armchair,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
} from "lucide-react";

function painBadgeVariant(value: number, max: number) {
  const ratio = value / max;
  if (ratio <= 0.3) return "default" as const;
  if (ratio <= 0.6) return "secondary" as const;
  return "destructive" as const;
}


function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const sleepEmoji = ["😫", "😩", "😕", "😟", "😐", "🙂", "😊", "😌", "😴", "🌟"];

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function HistoryView({
  refreshKey,
  onLogSaved,
}: {
  refreshKey: number;
  onLogSaved?: () => void;
}) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState(yesterday);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLogs(await getAllLogs());
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  function openAddDate() {
    setPendingDate(yesterday());
    setShowDatePicker(true);
  }

  function confirmAddDate() {
    if (!pendingDate) return;
    setShowDatePicker(false);
    setEditingDate(pendingDate);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
        <div className="flex flex-col items-center">
          <Activity className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-lg font-medium">No logs yet</p>
          <p className="text-sm">Start by filling in today's log!</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={openAddDate}>
          <CalendarPlus className="h-4 w-4" />
          Add a past date
        </Button>
        <Sheet open={editingDate !== null} onOpenChange={(open) => !open && setEditingDate(null)}>
          <SheetContent
            side="bottom"
            className="max-h-[92vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-6 sm:max-w-lg sm:mx-auto"
          >
            <SheetHeader className="text-left space-y-1 pr-10">
              <SheetTitle className="font-heading">Log a past day</SheetTitle>
              {editingDate && (
                <SheetDescription>
                  {formatDate(editingDate)} · {editingDate}
                </SheetDescription>
              )}
            </SheetHeader>
            <div className="mt-4">
              {editingDate && (
                <DailyLogForm
                  key={editingDate}
                  forDate={editingDate}
                  onSaved={() => {
                    onLogSaved?.();
                    setEditingDate(null);
                  }}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
        {showDatePicker && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setShowDatePicker(false)}>
            <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <p className="font-heading font-semibold text-base">Add a past date</p>
              <Input
                type="date"
                value={pendingDate}
                max={yesterday()}
                onChange={(e) => setPendingDate(e.target.value)}
                className="bg-background"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setShowDatePicker(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button className="flex-1 gap-1.5" onClick={confirmAddDate} disabled={!pendingDate || pendingDate >= todayString()}>
                  <Check className="h-4 w-4" />
                  Log this day
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={openAddDate}>
          <CalendarPlus className="h-4 w-4" />
          Add a past date
        </Button>
      </div>

      {showDatePicker && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setShowDatePicker(false)}>
          <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-heading font-semibold text-base">Add a past date</p>
            <Input
              type="date"
              value={pendingDate}
              max={yesterday()}
              onChange={(e) => setPendingDate(e.target.value)}
              className="bg-background"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setShowDatePicker(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button className="flex-1 gap-1.5" onClick={confirmAddDate} disabled={!pendingDate || pendingDate >= todayString()}>
                <Check className="h-4 w-4" />
                Log this day
              </Button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={editingDate !== null} onOpenChange={(open) => !open && setEditingDate(null)}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-6 sm:max-w-lg sm:mx-auto"
        >
          <SheetHeader className="text-left space-y-1 pr-10">
            <SheetTitle className="font-heading">
              {editingDate && logs.some((l) => l.date === editingDate) ? "Edit log" : "Log a past day"}
            </SheetTitle>
            {editingDate && (
              <SheetDescription>
                {formatDate(editingDate)} · {editingDate}
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="mt-4">
            {editingDate && (
              <DailyLogForm
                key={editingDate}
                forDate={editingDate}
                onSaved={() => {
                  onLogSaved?.();
                  setEditingDate(null);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {logs.map((log) => (
        <Card key={log.date} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <span className="font-heading font-semibold text-base block">{formatDate(log.date)}</span>
                <span className="text-xs text-muted-foreground">{log.date}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setEditingDate(log.date)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>

            {/* Pain */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2.5 gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-pain-high" />
                <p className="text-xs text-muted-foreground">Max</p>
                <Badge variant={painBadgeVariant(log.maxPain, 10)} className="text-xs">{log.maxPain}/10</Badge>
              </div>
              <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2.5 gap-1">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Avg</p>
                <Badge variant={painBadgeVariant(log.averagePain, 10)} className="text-xs">{log.averagePain}/10</Badge>
              </div>
              <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2.5 gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-pain-low" />
                <p className="text-xs text-muted-foreground">Least</p>
                <Badge variant={painBadgeVariant(log.leastPain, 10)} className="text-xs">{log.leastPain}/10</Badge>
              </div>
            </div>

            {/* Intensity & sleep */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2.5 gap-1">
                <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Sleep</p>
                <span className="text-xs font-semibold">{sleepEmoji[log.sleepQuality - 1] ?? "😐"} {log.sleepQuality}/10</span>
              </div>
              <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2.5 gap-1">
                <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Exercise</p>
                <span className="text-xs font-semibold">{log.exerciseIntensity}/10</span>
              </div>
              <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2.5 gap-1">
                <Armchair className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Sitting</p>
                <span className="text-xs font-semibold">{log.sittingIntensity}/10</span>
              </div>
            </div>

            {/* Activity */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Footprints className="h-3.5 w-3.5" />
                {log.walkingMinutes} min walk
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Armchair className="h-3.5 w-3.5" />
                {log.maxSittingMinutes} min max sit
              </span>
            </div>

            {/* Exercises */}
            {log.exercises.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {log.exercises.map((ex) => (
                  <Badge key={ex} variant="outline" className="text-xs font-normal">
                    {ex}
                  </Badge>
                ))}
              </div>
            )}

            {/* Notes */}
            {log.notes.trim() !== "" && (
              <div className="flex gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{log.notes.trim()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
