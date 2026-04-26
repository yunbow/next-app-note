import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileContent } from "@/features/user/components/ProfileContent";

export const metadata = { title: "プロフィール" };

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, image: true, email: true, createdAt: true },
  });
  if (!user) notFound();

  return (
    <div className="container max-w-2xl py-8">
      <ProfileContent user={user} isOwnProfile={session.user.id === user.id} />
    </div>
  );
}
