"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return localStorage.getItem("cookie-consent");
}

function setConsent(value: string) {
  localStorage.setItem("cookie-consent", value);
  listeners.forEach((l) => l());
}

export function CookieConsent() {
  const { t } = useTranslations();
  // Server snapshot is non-null → renders null on SSR (no banner).
  // Client snapshot is null when no cookie → shows banner.
  // React handles the server/client mismatch via useSyncExternalStore without hydration errors.
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => "ssr");

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {t("cookieConsent.message")}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setConsent("declined")} variant="outline" size="sm">
            {t("cookieConsent.decline")}
          </Button>
          <Button onClick={() => setConsent("accepted")} size="sm">
            {t("cookieConsent.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
