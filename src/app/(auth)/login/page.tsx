"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { log } from "@/lib/logger";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (signInError) {
      log("warn", "Login failed", { email });
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    log("info", "User logged in");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            Q
          </span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your QuoteFlow account
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In
                <ArrowRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
