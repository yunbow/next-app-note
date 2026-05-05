import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileContent } from "@/features/user/components/ProfileContent";

export const metadata = { title: "プロフィール" };

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, followerCount, followingCount, followRecord] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, name: true, image: true, email: true, createdAt: true },
    }),
    prisma.follow.count({ where: { followingId: id } }),
    prisma.follow.count({ where: { followerId: id } }),
    session.user.id !== id
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: id } },
          select: { followerId: true },
        })
      : null,
  ]);

  if (!user) notFound();

  return (
    <div className="max-w-2xl py-8">
      <ProfileContent
        user={user}
        isOwnProfile={session.user.id === user.id}
        followerCount={followerCount}
        followingCount={followingCount}
        isFollowing={!!followRecord}
      />
    </div>
  );
}
