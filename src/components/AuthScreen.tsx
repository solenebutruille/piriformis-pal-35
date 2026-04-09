import { useState } from "react";
import { Heart, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

function authErrorMessage(error: unknown): string {
  const raw =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : error instanceof Error
        ? error.message
        : "";

  const blob = raw.toLowerCase();
  if (
    blob.includes("email signups are disabled") ||
    blob.includes("signup_disabled") ||
    blob.includes("signups not allowed")
  ) {
    return "Email sign-up is disabled in Supabase. Enable it under Authentication → Providers → Email.";
  }
  return raw || "Something went wrong";
}


export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setEmailBusy(true);
    try {
      if (emailMode === "signin") {
        await signInWithEmail(trimmed, password);
      } else {
        const { needsEmailConfirmation } = await signUpWithEmail(
          trimmed,
          password,
        );
        if (needsEmailConfirmation) {
          toast.success(
            "Check your email for a confirmation link to finish signing up.",
            {
              duration: 12_000,
            },
          );
          setPassword("");
        } else {
          toast.success("Account created — you’re signed in.");
          setPassword("");
        }
      }
    } catch (err) {
      toast.error(authErrorMessage(err), { duration: 8_000 });
    } finally {
      setEmailBusy(false);
    }
  };

  const anyBusy = emailBusy;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2.5">
            <Heart className="h-10 w-10 text-primary fill-primary" />
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Piriformis Tracker
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Sign in to save your daily logs and custom exercises. Your data
            stays private to your account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Sign in</CardTitle>
            <CardDescription>Continue with your email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex rounded-lg border border-border p-0.5 bg-muted/40">
                <button
                  type="button"
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    emailMode === "signin"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setEmailMode("signin")}
                  disabled={anyBusy}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    emailMode === "signup"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setEmailMode("signup")}
                  disabled={anyBusy}
                >
                  Create account
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  disabled={anyBusy}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    emailMode === "signin" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={anyBusy}
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2 font-medium"
                disabled={anyBusy}
              >
                {emailBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {emailMode === "signin"
                  ? "Sign in with email"
                  : "Create account with email"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
