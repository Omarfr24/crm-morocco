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
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn.email(
      {
        email,
        password,
        callbackURL: "/",
      },
      {
        onError: (ctx: { error: { status?: number } }) => {
          if (ctx.error.status === 403) {
            setError(t("emailNotVerified"));
          } else {
            setError(t("invalidCredentials"));
          }
        },
      },
    );

    if (signInError) {
      log("warn", "Login failed", { email });
      setLoading(false);
      return;
    }

    log("info", "User logged in");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20">
            Q
          </span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcomeBack")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("signInSubtitle")}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("password")}</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("enterPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              t("signingIn")
            ) : (
              <>
                {t("signIn")}
                <ArrowRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/register" className="text-foreground hover:underline font-medium">
            {t("createAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
