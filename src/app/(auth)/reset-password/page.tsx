"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? "" : "invalidResetLink");
  const [success, setSuccess] = useState(false);
  const t = useTranslations("auth");

  const displayError = error === "invalidResetLink" ? t("invalidResetLink") : error;

  function validatePassword(pw: string): string | null {
    if (pw.length < 12) return t("passwordMinLength");
    if (!/[A-Z]/.test(pw)) return t("passwordUppercase");
    if (!/[a-z]/.test(pw)) return t("passwordLowercase");
    if (!/[0-9]/.test(pw)) return t("passwordNumber");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) return t("passwordSpecial");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("invalidResetLink"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    const { error: resetError } = await resetPassword({
      newPassword,
      token,
    });

    if (resetError) {
      setError(resetError.message || t("resetFailed"));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20">
              Q
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("passwordResetSuccess")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("passwordResetSuccessDescription")}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <Link href="/login">
            <Button className="w-full inline-flex items-center gap-1.5">
              {t("signIn")}
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
          {t("resetPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("resetPasswordSubtitle")}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {displayError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {displayError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("newPassword")}</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder={t("enterPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading || !token}
            />
            <p className="text-xs text-muted-foreground">
              {t("passwordRequirements")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading || !token}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? (
              t("resetting")
            ) : (
              t("resetPassword")
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
