import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, History, Heart } from "lucide-react";
import DailyLogForm from "@/components/DailyLogForm";
import HistoryView from "@/components/HistoryView";

export default function Index() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-2.5">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Piriformis Tracker
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="today" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <DailyLogForm onSaved={() => setRefreshKey((k) => k + 1)} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryView refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
