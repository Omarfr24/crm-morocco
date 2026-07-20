import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "./config";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

const messages: Record<Locale, typeof fr> = { fr, en, ar };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;
  if (isValidLocale(raw)) return raw;
  return defaultLocale;
}

export async function getTranslations<N extends string = never>(
  namespace?: N
) {
  const locale = await getLocale();
  const msgs = messages[locale] ?? messages[defaultLocale];

  function resolve(obj: unknown, path: string): string | undefined {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === "string" ? current : undefined;
  }

  function t(key: string, params?: Record<string, string | number>): string {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let value = resolve(msgs, fullKey);
    if (value === undefined) {
      value = resolve(messages[defaultLocale], fullKey);
    }
    if (value === undefined) return key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return value;
  }

  return { t, locale };
}

export async function getAllMessages() {
  const locale = await getLocale();
  return { messages: messages[locale] ?? messages[defaultLocale], locale };
}
