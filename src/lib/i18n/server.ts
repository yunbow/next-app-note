import { cookies } from "next/headers";
import type { Locale } from "./types";
import { defaultLocale } from "./types";
import { translations } from "./locales";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value as Locale | undefined;
  return locale || defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  return translations[locale];
}
