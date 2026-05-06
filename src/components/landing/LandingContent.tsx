"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderOpen,
  Link2,
  Share2,
  ShieldCheck,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";

export function LandingContent() {
  const { t } = useTranslations();

  const features = [
    {
      icon: FileText,
      title: t("landing.features.markdown.title"),
      description: t("landing.features.markdown.description"),
    },
    {
      icon: FolderOpen,
      title: t("landing.features.organize.title"),
      description: t("landing.features.organize.description"),
    },
    {
      icon: Link2,
      title: t("landing.features.links.title"),
      description: t("landing.features.links.description"),
    },
    {
      icon: Share2,
      title: t("landing.features.share.title"),
      description: t("landing.features.share.description"),
    },
  ];

  const workflow = [
    {
      icon: Sparkles,
      title: t("landing.workflow.capture.title"),
      description: t("landing.workflow.capture.description"),
    },
    {
      icon: Tags,
      title: t("landing.workflow.organize.title"),
      description: t("landing.workflow.organize.description"),
    },
    {
      icon: Users,
      title: t("landing.workflow.share.title"),
      description: t("landing.workflow.share.description"),
    },
  ];

  const proofPoints = [
    t("landing.proof.markdown"),
    t("landing.proof.links"),
    t("landing.proof.sharing"),
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <Image
          src="/brand/landing-hero.png"
          alt={t("landing.hero.imageAlt")}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.975_0.005_80)_0%,oklch(0.975_0.005_80_/_0.92)_34%,oklch(0.975_0.005_80_/_0.60)_68%,oklch(0.975_0.005_80)_100%)]" />
        <div className="container mx-auto flex min-h-[calc(100svh-9rem)] max-w-6xl flex-col justify-center px-4 py-14 text-center md:min-h-[calc(100svh-11rem)] md:py-20">
          <p className="bg-background/85 text-muted-foreground mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium shadow-sm backdrop-blur">
            <Sparkles className="text-primary h-4 w-4" aria-hidden="true" />
            {t("landing.hero.eyebrow")}
          </p>
          <h1 className="text-foreground mx-auto max-w-4xl text-4xl leading-tight font-bold md:text-6xl lg:text-7xl">
            {t("landing.hero.title")}
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-8 md:text-xl">
            {t("landing.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-44 gap-2">
              <Link href="/register">
                {t("landing.hero.cta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/80 min-w-44 backdrop-blur"
            >
              <Link href="/login">{t("landing.hero.secondaryCta")}</Link>
            </Button>
          </div>
          <div className="text-muted-foreground mx-auto mt-10 grid max-w-3xl gap-3 text-left text-sm sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="bg-background/80 flex items-center gap-2 rounded-md border px-3 py-2 shadow-sm backdrop-blur"
              >
                <CheckCircle2
                  className="text-primary h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-sm font-semibold">
              {t("landing.features.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="text-muted-foreground mt-4">
              {t("landing.features.subtitle")}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="bg-card rounded-lg border p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="bg-primary/10 mb-4 flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="text-primary h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/45 border-y py-16 md:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-primary text-sm font-semibold">
              {t("landing.workflow.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              {t("landing.workflow.title")}
            </h2>
            <p className="text-muted-foreground mt-4 leading-8">
              {t("landing.workflow.subtitle")}
            </p>
          </div>
          <div className="grid gap-3">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="bg-card grid grid-cols-[auto_1fr] gap-4 rounded-lg border p-5 shadow-sm"
                >
                  <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-md">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs font-semibold">
                        0{index + 1}
                      </span>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {step.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-card grid gap-8 rounded-lg border p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div className="max-w-3xl">
              <div className="bg-primary/10 mb-4 flex h-11 w-11 items-center justify-center rounded-md">
                <ShieldCheck
                  className="text-primary h-5 w-5"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {t("landing.cta.title")}
              </h2>
              <p className="text-muted-foreground mt-3 leading-7">
                {t("landing.cta.description")}
              </p>
            </div>
            <Button asChild size="lg" className="gap-2 md:justify-self-end">
              <Link href="/register">
                {t("landing.hero.cta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
