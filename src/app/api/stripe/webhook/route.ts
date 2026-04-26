import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { PLANS, type PlanType } from "@/lib/stripe/plans";
import type Stripe from "stripe";

const PRICE_TO_PLAN: Record<string, PlanType> = Object.fromEntries(
  (Object.entries(PLANS) as [PlanType, (typeof PLANS)[PlanType]][])
    .filter(([, p]) => p.priceId)
    .map(([key, p]) => [p.priceId as string, key]),
);

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  const planKey = session.metadata?.plan as PlanType | undefined;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !planKey || !subscriptionId) return;

  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : undefined,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSub.items.data[0]?.price.id,
      plan: planKey,
      status: stripeSub.status,
      currentPeriodEnd: new Date((stripeSub.items.data[0]?.current_period_end ?? stripeSub.billing_cycle_anchor) * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSub.items.data[0]?.price.id,
      plan: planKey,
      status: stripeSub.status,
      currentPeriodEnd: new Date((stripeSub.items.data[0]?.current_period_end ?? stripeSub.billing_cycle_anchor) * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionUpsert(
  stripeSub: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  const sub = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  const priceId = stripeSub.items.data[0]?.price.id ?? null;
  const plan: PlanType = priceId
    ? (PRICE_TO_PLAN[priceId] ?? "free")
    : "free";

  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      plan,
      status: stripeSub.status,
      currentPeriodEnd: new Date((stripeSub.items.data[0]?.current_period_end ?? stripeSub.billing_cycle_anchor) * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(
  stripeSub: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: "free",
      status: "canceled",
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch (err) {
    logger.error({ err }, "Webhook signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, "Webhook handler error");
    return new Response("Handler error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
