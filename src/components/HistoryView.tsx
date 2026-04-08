import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DailyLogForm from "@/components/DailyLogForm";
import { DailyLog, getAllLogs } from "@/lib/healthStore";
import {
  Activity,
  Footprints,
  MessageSquare,
  Moon,
  Pencil,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

function painBadgeVariant(value: number, max: number) {
  const ratio = value / max;
  if (ratio <= 0.3) return "default" as const;
  if (ratio <= 0.6) return "secondary" as const;
  return "destructive" as const;
}

function dayScoreBadgeVariant(score: number) {
  if (score >= 8) return "default" as const;
  if (score >= 5) return "secondary" as const;
  return "destructive" as const;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const sleepEmoji = ["😫", "😕", "😐", "😊", "😴"];

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLogs(await getAllLogs());
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Activity className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-lg font-medium">No logs yet</p>
        <p className="text-sm">Start by filling in today's log!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Sheet open={editingDate !== null} onOpenChange={(open) => !open && setEditingDate(null)}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-6 sm:max-w-lg sm:mx-auto"
        >
          <SheetHeader className="text-left space-y-1 pr-10">
            <SheetTitle className="font-heading">Edit log</SheetTitle>
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

            <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-2.5 mb-3">
              <Trophy className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Overall day</p>
                <Badge variant={dayScoreBadgeVariant(log.overallDayScore)} className="text-xs mt-0.5">
                  {log.overallDayScore}/10
                </Badge>
              </div>
            </div>

            <div className="flex gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-3 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">Comment</p>
                {log.notes.trim() !== "" ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">{log.notes.trim()}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No comment for this day.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5">
                <TrendingUp className="h-4 w-4 text-pain-high shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Max pain</p>
                  <Badge variant={painBadgeVariant(log.maxPain, 10)} className="text-xs">
                    {log.maxPain}/10
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5">
                <TrendingDown className="h-4 w-4 text-pain-low shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Least pain</p>
                  <Badge variant={painBadgeVariant(log.leastPain, 10)} className="text-xs">
                    {log.leastPain}/10
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Footprints className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{log.walkingMinutes} min walk</span>
              <span className="text-muted-foreground">·</span>
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{sleepEmoji[log.sleepQuality - 1]} Sleep</span>
            </div>

            {log.exercises.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {log.exercises.map((ex) => (
                  <Badge key={ex} variant="outline" className="text-xs font-normal">
                    {ex}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
