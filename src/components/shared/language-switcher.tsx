"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { setLocale } from "@/actions/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français", enabled: true },
  { value: "en", label: "English", enabled: true },
  { value: "ar", label: "العربية", enabled: false },
] as const;

export function LanguageSwitcher({ className, compact }: { className?: string; compact?: boolean }) {
  const t = useTranslations("language");
  const currentLocale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLanguageChange(locale: string) {
    if (locale === currentLocale) return;
    setLoading(true);
    await setLocale(locale);
    setLoading(false);
    router.refresh();
  }

  const currentLabel =
    LANGUAGE_OPTIONS.find((l) => l.value === currentLocale)?.label ?? "Français";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={loading} className={className} aria-label={t("label")}>
            <Globe className="size-4" />
            {!compact && <span className="ml-1.5">{currentLabel}</span>}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => lang.enabled && handleLanguageChange(lang.value)}
            disabled={!lang.enabled || loading}
            className={!lang.enabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            <span className="flex-1">
              {lang.enabled ? t(lang.value) : t(`${lang.value}ComingSoon`)}
            </span>
            {lang.value === currentLocale && (
              <span className="ml-2 text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
