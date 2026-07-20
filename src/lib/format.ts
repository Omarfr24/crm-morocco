import { getLocale, getLocaleMap } from "./locale";
import type { Locale } from "@/i18n/config";

function getCurrencyForLocale(locale: Locale): string {
  return "MAD";
}

export async function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): Promise<string> {
  const locale = await getLocale();
  const localeStr = getLocaleMap(locale);
  return new Date(date).toLocaleDateString(localeStr, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export async function formatDateLong(
  date: Date | string
): Promise<string> {
  return formatDate(date, { day: "2-digit", month: "long", year: "numeric" });
}

export async function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): Promise<string> {
  const locale = await getLocale();
  const localeStr = getLocaleMap(locale);
  return new Intl.NumberFormat(localeStr, options).format(value);
}

export async function formatCurrency(
  value: number,
  currency?: string
): Promise<string> {
  const locale = await getLocale();
  const localeStr = getLocaleMap(locale);
  const curr = currency ?? getCurrencyForLocale(locale);
  return new Intl.NumberFormat(localeStr, {
    style: "currency",
    currency: curr,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateSync(
  date: Date | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const localeStr = getLocaleMap(locale);
  return new Date(date).toLocaleDateString(localeStr, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatNumberSync(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const localeStr = getLocaleMap(locale);
  return new Intl.NumberFormat(localeStr, options).format(value);
}
