import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";

const COOKIE_NAME = "locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (isValidLocale(raw)) return raw;
  return defaultLocale;
}

export function getLocaleMap(locale: Locale): string {
  const map: Record<Locale, string> = {
    fr: "fr-FR",
    en: "en-US",
    ar: "ar-MA",
  };
  return map[locale] ?? map[defaultLocale];
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
