"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "@/lib/i18n";
import { Moon, Sun, Globe, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function LPHeader() {
  const { t } = useTranslations();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold hover:opacity-80 transition-opacity"
          aria-label={t("accessibility.homeLink")}
        >
          {t("common.appName")}
        </Link>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("accessibility.selectLanguage")}
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span>{t(`language.${locale}`)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale("ja")}>
                {locale === "ja" && <Check className="h-4 w-4 mr-2" aria-hidden="true" />}
                <span className={locale !== "ja" ? "ml-6" : ""}>{t("language.ja")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("en")}>
                {locale === "en" && <Check className="h-4 w-4 mr-2" aria-hidden="true" />}
                <span className={locale !== "en" ? "ml-6" : ""}>{t("language.en")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("accessibility.selectTheme")}
                >
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  ) : theme === "light" ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Monitor className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>
                    {theme === "dark"
                      ? t("theme.dark")
                      : theme === "light"
                        ? t("theme.light")
                        : t("theme.system")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {theme === "light" && <Check className="h-4 w-4 mr-2" aria-hidden="true" />}
                  <Sun className={`h-4 w-4 ${theme !== "light" ? "ml-6" : ""}`} aria-hidden="true" />
                  <span>{t("theme.light")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  {theme === "dark" && <Check className="h-4 w-4 mr-2" aria-hidden="true" />}
                  <Moon className={`h-4 w-4 ${theme !== "dark" ? "ml-6" : ""}`} aria-hidden="true" />
                  <span>{t("theme.dark")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  {theme === "system" && <Check className="h-4 w-4 mr-2" aria-hidden="true" />}
                  <Monitor className={`h-4 w-4 ${theme !== "system" ? "ml-6" : ""}`} aria-hidden="true" />
                  <span>{t("theme.system")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button asChild variant="ghost">
            <Link href="/login">{t("common.login")}</Link>
          </Button>

          <Button asChild>
            <Link href="/register">{t("common.register")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
