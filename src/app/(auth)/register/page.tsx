"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { log } from "@/lib/logger";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formLoadTime = useRef<number | null>(null);

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

    if (!formLoadTime.current) {
      formLoadTime.current = Date.now();
    }

    if (honeypotRef.current?.value) {
      return;
    }

    const elapsed = Date.now() - formLoadTime.current;
    if (elapsed < 2000) {
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
      companyName,
    } as Parameters<typeof signUp.email>[0]);

    if (signUpError) {
      log("warn", "Registration failed", { email, error: signUpError.message });
      setError(signUpError.message || t("registrationFailed"));
      setLoading(false);
      return;
    }

    log("info", "User registered", { email });
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
            {t("verificationEmailSent")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("verificationEmailDescription")}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <Link href="/login">
            <Button variant="outline" className="w-full">
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
          {t("createAccount")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("registerSubtitle")}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />
          <div className="space-y-2">
            <Label htmlFor="companyName">{t("companyName")}</Label>
            <Input
              id="companyName"
              type="text"
              placeholder={t("companyNamePlaceholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t("fullName")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("fullNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>
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
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("enterPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              t("creatingAccount")
            ) : (
              <>
                {t("signUp")}
                <ArrowRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-foreground hover:underline font-medium">
            {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
