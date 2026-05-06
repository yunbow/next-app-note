import { cookies } from "next/headers";
import type { Locale } from "./types";
import { defaultLocale, locales } from "./types";
import { translations } from "./locales";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  return (locales as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  return translations[locale];
}
