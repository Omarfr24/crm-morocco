"use client";

import { useTranslations as useNextTranslations } from "next-intl";

export function useTranslations(namespace?: string) {
  return useNextTranslations(namespace);
}
