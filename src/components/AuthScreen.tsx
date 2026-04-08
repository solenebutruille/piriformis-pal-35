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
import { Separator } from "@/components/ui/separator";
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
    blob.includes("not enabled") ||
    blob.includes("validation_failed") ||
    blob.includes("unsupported provider")
  ) {
    return "Google sign-in is turned off in your Supabase project. Enable it under Authentication → Providers → Google, then add your Google OAuth Client ID and Client Secret.";
  }
  if (
    blob.includes("email signups are disabled") ||
    blob.includes("signup_disabled") ||
    blob.includes("signups not allowed")
  ) {
    return "Email sign-up is disabled in Supabase. Enable it under Authentication → Providers → Email.";
  }
  return raw || "Something went wrong";
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogle = async () => {
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      toast.error(authErrorMessage(e), { duration: 10_000 });
      setGoogleBusy(false);
    }
  };

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

  const anyBusy = googleBusy || emailBusy;

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
            <CardDescription>Continue with Google or email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2 font-medium"
              onClick={handleGoogle}
              disabled={anyBusy}
            >
              <GoogleIcon className="h-5 w-5" />
              {googleBusy ? "Redirecting…" : "Continue with Google"}
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>

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
