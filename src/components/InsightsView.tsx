import { useEffect, useMemo, useState } from "react";
import { Activity, LineChart as LineChartIcon } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DailyLog, getAllLogs } from "@/lib/healthStore";

export type InsightsRange = "7d" | "30d" | "all";

function utcDateDaysAgo(daysBackFromToday: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysBackFromToday);
  return d.toISOString().slice(0, 10);
}

function filterLogs(logs: DailyLog[], range: InsightsRange): DailyLog[] {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  if (range === "all") return sorted;
  const span = range === "7d" ? 7 : 30;
  const start = utcDateDaysAgo(span - 1);
  return sorted.filter((l) => l.date >= start);
}

function shortLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00.000Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Point = {
  date: string;
  label: string;
  maxPain: number;
  leastPain: number;
  overallDayScore: number;
  walkingMinutes: number;
  sleepQuality: number;
  exerciseCount: number;
};

function toChartData(logs: DailyLog[]): Point[] {
  return logs.map((l) => ({
    date: l.date,
    label: shortLabel(l.date),
    maxPain: l.maxPain,
    leastPain: l.leastPain,
    overallDayScore: l.overallDayScore,
    walkingMinutes: l.walkingMinutes,
    sleepQuality: l.sleepQuality,
    exerciseCount: l.exercises.length,
  }));
}

const painChartConfig = {
  maxPain: { label: "Max pain", color: "hsl(var(--pain-high))" },
  leastPain: { label: "Least pain", color: "hsl(var(--pain-low))" },
};

const scoreChartConfig = {
  overallDayScore: { label: "Day score", color: "hsl(var(--primary))" },
};

const walkChartConfig = {
  walkingMinutes: { label: "Walking (min)", color: "hsl(var(--sage-medium))" },
};

const sleepExerciseChartConfig = {
  sleepQuality: { label: "Sleep (1–5)", color: "hsl(var(--accent))" },
  exerciseCount: { label: "Exercises logged", color: "hsl(var(--sage-deep))" },
};

export default function InsightsView({ refreshKey }: { refreshKey: number }) {
  const [range, setRange] = useState<InsightsRange>("7d");
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all = await getAllLogs();
      if (!cancelled) {
        setLogs(all);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filtered = useMemo(() => filterLogs(logs, range), [logs, range]);
  const data = useMemo(() => toChartData(filtered), [filtered]);

  const rangeDescription =
    range === "7d"
      ? "Last 7 days (UTC)"
      : range === "30d"
        ? "Last 30 days (UTC)"
        : "All logged days";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">Loading charts…</div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center px-2">
        <LineChartIcon className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-lg font-medium text-foreground">No data yet</p>
        <p className="text-sm">Save a few daily logs to see trends here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Time range</p>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(v) => v && setRange(v as InsightsRange)}
          className="w-full justify-stretch grid grid-cols-3 gap-1.5"
          variant="outline"
        >
          <ToggleGroupItem value="7d" className="flex-1 text-xs sm:text-sm px-1">
            7 days
          </ToggleGroupItem>
          <ToggleGroupItem value="30d" className="flex-1 text-xs sm:text-sm px-1">
            Month
          </ToggleGroupItem>
          <ToggleGroupItem value="all" className="flex-1 text-xs sm:text-sm px-1">
            All time
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">{rangeDescription}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
          <Activity className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">No entries in this range.</p>
          <p className="text-xs mt-1">Try &quot;All time&quot; or log more days.</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Pain</CardTitle>
              <CardDescription>Max and least pain per day (0–10).</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={painChartConfig} className="h-[220px] w-full aspect-auto">
                <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis domain={[0, 10]} width={28} tickLine={false} axisLine={false} tickMargin={4} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="maxPain"
                    stroke="var(--color-maxPain)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="leastPain"
                    stroke="var(--color-leastPain)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Overall day score</CardTitle>
              <CardDescription>How each day felt overall (1–10).</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={scoreChartConfig} className="h-[200px] w-full aspect-auto">
                <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis domain={[1, 10]} width={28} tickLine={false} axisLine={false} tickMargin={4} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="overallDayScore"
                    stroke="var(--color-overallDayScore)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Walking</CardTitle>
              <CardDescription>Minutes walked per day.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={walkChartConfig} className="h-[200px] w-full aspect-auto">
                <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis width={36} tickLine={false} axisLine={false} tickMargin={4} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="walkingMinutes"
                    stroke="var(--color-walkingMinutes)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Sleep &amp; exercises</CardTitle>
              <CardDescription>Sleep quality (stars 1–5) and number of exercises checked.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={sleepExerciseChartConfig} className="h-[220px] w-full aspect-auto">
                <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis yAxisId="sleep" domain={[1, 5]} width={28} tickLine={false} axisLine={false} tickMargin={4} />
                  <YAxis
                    yAxisId="ex"
                    orientation="right"
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="sleep"
                    type="monotone"
                    dataKey="sleepQuality"
                    stroke="var(--color-sleepQuality)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="ex"
                    type="monotone"
                    dataKey="exerciseCount"
                    stroke="var(--color-exerciseCount)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
