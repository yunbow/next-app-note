"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { PLANS, type PlanType } from "@/lib/stripe/plans";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";

export type SubscriptionData = {
  plan: PlanType;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
};

export async function getSubscriptionAction(): Promise<
  ActionResult<SubscriptionData>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    return {
      success: true,
      data: {
        plan: (sub?.plan ?? "free") as PlanType,
        status: sub?.status ?? "active",
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
        stripeCustomerId: sub?.stripeCustomerId ?? null,
      },
    };
  } catch (error) {
    logger.error({ error }, "Get subscription error");
    return { success: false, error: "サブスクリプション情報の取得に失敗しました" };
  }
}

export async function createCheckoutSessionAction(
  planKey: PlanType,
): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return { success: false, error: "認証が必要です" };
    }

    const plan = PLANS[planKey];
    if (!plan.priceId) {
      return { success: false, error: "このプランは決済不要です" };
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = sub?.stripeCustomerId ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          plan: "free",
          status: "active",
        },
        update: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=1`,
      cancel_url: `${appUrl}/settings/billing?canceled=1`,
      metadata: { userId: session.user.id, plan: planKey },
    });

    if (!checkoutSession.url) {
      return { success: false, error: "チェックアウトURLの生成に失敗しました" };
    }

    return { success: true, data: { url: checkoutSession.url } };
  } catch (error) {
    logger.error({ error }, "Create checkout session error");
    return { success: false, error: "チェックアウトセッションの作成に失敗しました" };
  }
}

export async function createPortalSessionAction(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!sub?.stripeCustomerId) {
      return { success: false, error: "Stripeカスタマー情報が見つかりません" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/settings/billing`,
    });

    return { success: true, data: { url: portalSession.url } };
  } catch (error) {
    logger.error({ error }, "Create portal session error");
    return { success: false, error: "ポータルセッションの作成に失敗しました" };
  }
}
