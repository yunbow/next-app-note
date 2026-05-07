import "server-only";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, type PlanType } from "./plans";

export async function getUserPlan(userId: string): Promise<PlanType> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    return sub.plan as PlanType;
  }
  return "free";
}

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}
