"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("auth");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(t("resetRequestFailed"));
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20">
              Q
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("resetEmailSent")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("resetEmailDescription")}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <Link href="/login">
            <Button variant="outline" className="w-full inline-flex items-center gap-1.5">
              <ArrowLeft className="size-4" />
              {t("backToSignIn")}
            </Button>
          </Link>
        </div>
      </div>
    );
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
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("forgotPasswordSubtitle")}
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              t("sending")
            ) : (
              <>
                <Mail className="size-4 mr-1" />
                {t("sendResetLink")}
              </>
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline font-medium inline-flex items-center gap-1">
            <ArrowLeft className="size-3" />
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
