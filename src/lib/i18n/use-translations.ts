"use client";

import { useLocale } from "./context";

export function useTranslations() {
  const { t: translations } = useLocale();
  
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (typeof value !== "object" || value === null || !(k in value)) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      value = (value as Record<string, unknown>)[k];
    }

    if (typeof value === "string" && params) {
      return Object.entries(params).reduce(
        (str, [k, val]) => str.replace(`{${k}}`, val),
        value,
      );
    }

    return typeof value === "string" ? value : key;
  };
  
  return { t };
}
