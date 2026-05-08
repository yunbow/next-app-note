"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { FontSizeProvider } from "@/lib/font-size";
import { ColorVisionProvider } from "@/lib/color-vision";

export function Providers({
  children,
  locale,
  nonce,
}: {
  children: React.ReactNode;
  locale?: Locale;
  nonce?: string;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
        <LocaleProvider initialLocale={locale}>
          <FontSizeProvider>
            <ColorVisionProvider>
              {children}
              <Toaster />
            </ColorVisionProvider>
          </FontSizeProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
