import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyLog, getAllLogs } from "@/lib/healthStore";
import { Activity, Footprints, Moon, TrendingDown, TrendingUp } from "lucide-react";

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

const sleepEmoji = ["😫", "😕", "😐", "😊", "😴"];

export default function HistoryView({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    setLogs(getAllLogs());
  }, [refreshKey]);

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
      {logs.map((log) => (
        <Card key={log.date} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-semibold text-base">{formatDate(log.date)}</span>
              <span className="text-xs text-muted-foreground">{log.date}</span>
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
                  <Badge variant={painBadgeVariant(log.leastPain, 20)} className="text-xs">
                    {log.leastPain}/20
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
