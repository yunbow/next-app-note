import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";
import { CookieConsent } from "@/components/common/CookieConsent";
import { AppShell } from "@/components/common/AppShell";
import { getLocale, getTranslations } from "@/lib/i18n/server";
import { env } from "@/lib/config/env";

const APP_URL = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SITE_NAME = "next-app-note";

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
    metadataBase: new URL(APP_URL),
    title: { default: t.metadata.siteTitle, template: `%s | ${SITE_NAME}` },
    description: t.metadata.siteDescription,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: APP_URL,
    },
    twitter: {
      card: "summary_large_image",
    },
    alternates: { canonical: "/" },
    robots:
      process.env.VERCEL_ENV === "production"
        ? { index: true, follow: true }
        : { index: false, follow: false },
    icons: {
      icon: [
        { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
        {
          url: "/brand/note-icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
      apple: "/brand/apple-icon.png",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

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
