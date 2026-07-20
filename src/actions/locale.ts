"use server";

import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale, enabledLocales } from "@/i18n/config";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/locale";

export async function setLocale(locale: string): Promise<{ success: boolean; locale: string }> {
  if (!isValidLocale(locale) || !enabledLocales.includes(locale as Locale)) {
    return { success: false, locale: defaultLocale };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  return { success: true, locale };
}

export async function getLocaleAction(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (isValidLocale(raw) && enabledLocales.includes(raw)) return raw;
  return defaultLocale;
}
