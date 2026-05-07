import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsContent } from "@/features/settings/components/SettingsContent";
import type { PlanType } from "@/lib/stripe/plans";

export default async function SettingsPage() {
  const session = await auth();

  let currentPlan: PlanType = "free";

  if (session?.user?.id) {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    if (sub?.plan) {
      currentPlan = sub.plan as PlanType;
    }
  }

  return <SettingsContent currentPlan={currentPlan} />;
}
