export { useTranslations } from "./use-translations";
export { useLocale } from "./use-locale";
export { LocaleProvider } from "./context";
export type { Locale } from "./types";
export { locales, defaultLocale } from "./types";

// Server-only exports - import directly from "./server" in server components
// export { getLocale, getTranslations } from "./server";
