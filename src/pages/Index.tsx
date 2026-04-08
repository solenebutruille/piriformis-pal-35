import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardList, History, Heart, LineChart, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import AuthScreen from "@/components/AuthScreen";
import DailyLogForm from "@/components/DailyLogForm";
import HistoryView from "@/components/HistoryView";
import InsightsView from "@/components/InsightsView";
import { useAuth } from "@/contexts/auth-context";

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not sign out";
      toast.error(message);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Heart className="h-6 w-6 text-primary fill-primary shrink-0" />
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground truncate">
              Piriformis Tracker
            </h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-muted-foreground"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto min-h-10 gap-1 p-1">
            <TabsTrigger value="today" className="gap-1 px-2 text-xs sm:text-sm">
              <ClipboardList className="h-4 w-4 shrink-0" />
              Today
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 px-2 text-xs sm:text-sm">
              <History className="h-4 w-4 shrink-0" />
              History
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-1 px-2 text-xs sm:text-sm">
              <LineChart className="h-4 w-4 shrink-0" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <DailyLogForm
              reloadToken={refreshKey}
              onSaved={() => setRefreshKey((k) => k + 1)}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryView refreshKey={refreshKey} onLogSaved={() => setRefreshKey((k) => k + 1)} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsView refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
