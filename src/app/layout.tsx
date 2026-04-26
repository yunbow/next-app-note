import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";
import { CookieConsent } from "@/components/common/CookieConsent";
import { AppShell } from "@/components/common/AppShell";
import { getLocale, getTranslations } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t.metadata.siteTitle,
    description: t.metadata.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} font-sans antialiased`}
      >
        <Providers locale={locale}>
          <AppShell>{children}</AppShell>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
