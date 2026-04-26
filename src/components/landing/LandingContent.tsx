"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";
import { FileText, Users, FolderOpen, Share2 } from "lucide-react";

export function LandingContent() {
  const { t } = useTranslations();

  return (
    <>
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
          {t("landing.hero.title")}
        </h1>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          {t("landing.hero.subtitle")}
        </p>
        <Button asChild size="lg">
          <Link href="/register">{t("landing.hero.cta")}</Link>
        </Button>
      </section>

      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t("landing.features.title")}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("landing.features.markdown.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.features.markdown.description")}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("landing.features.realtime.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.features.realtime.description")}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("landing.features.organize.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.features.organize.description")}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Share2 className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("landing.features.share.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.features.share.description")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
