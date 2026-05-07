"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Key, Clock, Shield, CreditCard } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { PLANS, type PlanType } from "@/lib/stripe/plans";

const PLAN_BADGE_STYLES: Record<PlanType, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  premium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

interface SettingsContentProps {
  currentPlan?: PlanType;
}

export function SettingsContent({ currentPlan = "free" }: SettingsContentProps) {
  const { t } = useTranslations();

  return (
    <div className="max-w-2xl py-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <div className="space-y-4">
        <Link href="/settings/billing" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                サブスクリプション
                <span
                  className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_BADGE_STYLES[currentPlan]}`}
                >
                  {PLANS[currentPlan].name}
                </span>
              </CardTitle>
              <CardDescription>現在のプランを確認・変更します</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/appearance" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.appearance")}
              </CardTitle>
              <CardDescription>{t("settings.appearanceDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/account" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("settings.account")}
              </CardTitle>
              <CardDescription>{t("settings.accountDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/password" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                パスワード変更
              </CardTitle>
              <CardDescription>パスワードを変更します</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/login-history" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ログイン履歴
              </CardTitle>
              <CardDescription>ログイン履歴を確認します</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
