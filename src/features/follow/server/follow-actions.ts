"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type FollowStats = { followers: number; following: number };
type ActionResult = { success: boolean; error?: string };
type StatsResult = { success: boolean; data: FollowStats };

export async function followUser(targetUserId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "認証が必要です" };
  if (session.user.id === targetUserId) return { success: false, error: "自分自身はフォローできません" };

  try {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    });
    revalidatePath(`/users/${targetUserId}`);
    return { success: true };
  } catch {
    return { success: false, error: "フォローに失敗しました" };
  }
}

export async function unfollowUser(targetUserId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "認証が必要です" };

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: targetUserId },
      },
    });
    revalidatePath(`/users/${targetUserId}`);
    return { success: true };
  } catch {
    return { success: false, error: "フォロー解除に失敗しました" };
  }
}

export async function getFollowStats(userId: string): Promise<StatsResult> {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { success: true, data: { followers, following } };
}

export async function getMyFollowStats(): Promise<StatsResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: true, data: { followers: 0, following: 0 } };
  return getFollowStats(session.user.id);
}
