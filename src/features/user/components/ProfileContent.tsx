"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";

type Props = {
  user: { id: string; username: string | null; name: string | null; image: string | null; email: string; createdAt: Date };
  isOwnProfile: boolean;
};

function getImageUrl(src: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `/api/images${src.replace("/uploads/", "/")}`;
  return src;
}

export function ProfileContent({ user, isOwnProfile }: Props) {
  const { t } = useTranslations();

  return (
    <Card>
      <CardContent className="pt-6">
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
          {isOwnProfile && (
            <Link href={`/users/${user.id}/edit`}><Button variant="outline">{t("profile.editProfile")}</Button></Link>
          )}
        </div>
        <div className="space-y-3 pt-4 border-t">
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
