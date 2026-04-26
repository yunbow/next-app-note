"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/common/BackLink";
import {
  getSubscriptionAction,
  createCheckoutSessionAction,
  createPortalSessionAction,
  type SubscriptionData,
} from "@/features/billing/server/subscription-actions";
import { PLANS, type PlanType } from "@/lib/stripe/plans";
import { toast } from "sonner";
import { Check, CreditCard, X, Zap } from "lucide-react";

const PLAN_ORDER: PlanType[] = ["free", "basic", "premium"];

const PLAN_BADGE_STYLES: Record<PlanType, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  premium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export function BillingContent() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<PlanType | "portal" | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (pendingRedirect) {
      window.location.href = pendingRedirect;
    }
  }, [pendingRedirect]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      toast.success("サブスクリプションを開始しました");
      router.replace("/settings/billing");
    } else if (params.get("canceled") === "1") {
      toast.info("チェックアウトをキャンセルしました");
      router.replace("/settings/billing");
    }

    getSubscriptionAction().then((result) => {
      if (result.success) {
        setSubscription(result.data);
      }
      setLoading(false);
    });
  }, [router]);

  const handleUpgrade = async (planKey: PlanType) => {
    setActionLoading(planKey);
    const result = await createCheckoutSessionAction(planKey);
    if (result.success) {
      setPendingRedirect(result.data.url);
    } else {
      toast.error(result.error);
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading("portal");
    const result = await createPortalSessionAction();
    if (result.success) {
      setPendingRedirect(result.data.url);
    } else {
      toast.error(result.error);
      setActionLoading(null);
    }
  };

  const currentPlan = (subscription?.plan ?? "free") as PlanType;

  return (
    <div className="max-w-2xl py-8">
      <BackLink href="/settings" label="設定に戻る" />
      <h1 className="text-2xl font-bold mb-2">サブスクリプション</h1>
      <p className="text-muted-foreground mb-6">
        現在のプランを確認・変更できます。
      </p>

      {!loading && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">現在のプラン:</span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${PLAN_BADGE_STYLES[currentPlan]}`}
          >
            {currentPlan === "premium" && <Zap className="h-3 w-3" />}
            {PLANS[currentPlan].name}
          </span>
          {subscription?.cancelAtPeriodEnd && (
            <span className="text-xs text-destructive">
              (期間終了時にキャンセル予定)
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {PLAN_ORDER.map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = currentPlan === planKey;
          const isDowngrade =
            PLAN_ORDER.indexOf(planKey) < PLAN_ORDER.indexOf(currentPlan);

          return (
            <Card
              key={planKey}
              className={
                isCurrent
                  ? "border-primary ring-1 ring-primary"
                  : planKey === "premium"
                    ? "border-amber-200 dark:border-amber-800"
                    : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                      {planKey === "premium" && (
                        <Zap className="h-4 w-4 text-amber-500" />
                      )}
                      {plan.name}
                      {isCurrent && (
                        <span className="text-xs font-normal text-primary">
                          現在のプラン
                        </span>
                      )}
                      {planKey === "premium" && !isCurrent && (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                          おすすめ
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.description}
                    </p>
                    <CardDescription className="mt-1">
                      {plan.price === 0 ? (
                        "無料"
                      ) : (
                        <span>
                          <span className="text-xl font-bold text-foreground">
                            ¥{plan.price.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground"> / 月</span>
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="shrink-0 ml-4">
                    {isCurrent ? (
                      plan.price > 0 && subscription?.stripeCustomerId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePortal}
                          disabled={actionLoading !== null}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          {actionLoading === "portal" ? "読み込み中..." : "管理"}
                        </Button>
                      ) : null
                    ) : isDowngrade ? (
                      subscription?.stripeCustomerId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePortal}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === "portal" ? "読み込み中..." : "ダウングレード"}
                        </Button>
                      ) : null
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleUpgrade(planKey)}
                        disabled={actionLoading !== null || loading}
                        className={
                          planKey === "premium"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : ""
                        }
                      >
                        {actionLoading === planKey
                          ? "処理中..."
                          : "アップグレード"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li
                      key={limitation}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <X className="h-4 w-4 shrink-0" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subscription?.currentPeriodEnd && (
        <p className="mt-6 text-xs text-muted-foreground">
          次回請求日:{" "}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString("ja-JP")}
        </p>
      )}
    </div>
  );
}
