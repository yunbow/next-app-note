"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";
import { followUser, unfollowUser } from "@/features/follow/server/follow-actions";

type Props = {
  user: { id: string; username: string | null; name: string | null; image: string | null; email: string; createdAt: Date };
  isOwnProfile: boolean;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

function getImageUrl(src: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `/api/images${src.replace("/uploads/", "/")}`;
  return src;
}

export function ProfileContent({ user, isOwnProfile, followerCount, followingCount, isFollowing: initialIsFollowing }: Props) {
  const { t } = useTranslations();
  const [following, setFollowing] = useState(initialIsFollowing);
  const [followers, setFollowers] = useState(followerCount);
  const [pending, setPending] = useState(false);

  const handleFollowToggle = async () => {
    setPending(true);
    try {
      if (following) {
        const result = await unfollowUser(user.id);
        if (result.success) {
          setFollowing(false);
          setFollowers((n) => n - 1);
        }
      } else {
        const result = await followUser(user.id);
        if (result.success) {
          setFollowing(true);
          setFollowers((n) => n + 1);
        }
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={getImageUrl(user.image)} />
            <AvatarFallback className="text-2xl">{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{user.name || t("common.nameNotSet")}</h1>
            {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
            <p className="text-sm text-muted-foreground mt-1">{t("profile.registeredAt")}{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          {isOwnProfile ? (
            <Link href={`/users/${user.id}/edit`}>
              <Button variant="outline">{t("profile.editProfile")}</Button>
            </Link>
          ) : (
            <Button
              variant={following ? "outline" : "default"}
              onClick={handleFollowToggle}
              disabled={pending}
            >
              {following ? "フォロー中" : "フォローする"}
            </Button>
          )}
        </div>

        {/* Follow stats */}
        <div className="flex gap-6 py-3 border-y">
          <div className="text-sm">
            <span className="font-bold">{followers}</span>
            <span className="text-muted-foreground ml-1">フォロワー</span>
          </div>
          <div className="text-sm">
            <span className="font-bold">{followingCount}</span>
            <span className="text-muted-foreground ml-1">フォロー中</span>
          </div>
        </div>

        {/* Profile details */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-32">{t("profile.email")}</span>
            <span className="text-sm">{user.email}</span>
          </div>
          {user.username && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-32">{t("profile.userId")}</span>
              <span className="text-sm">{user.username}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
