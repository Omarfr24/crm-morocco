export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const enabledLocales: Locale[] = ["fr", "en"];

export function isValidLocale(locale: string | undefined): locale is Locale {
  return locales.includes(locale as Locale);
}
