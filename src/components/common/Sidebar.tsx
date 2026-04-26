"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Search,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/common/BrandLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileTextIcon,
  FolderIcon,
  TagIcon,
  UserIcon,
  SettingsIcon,
} from "./icons";
import { useTranslations } from "@/lib/i18n";
import { getMyFollowStats } from "@/features/follow/server/follow-actions";
import { getSubscriptionAction } from "@/features/billing/server/subscription-actions";
import { PLANS, type PlanType } from "@/lib/stripe/plans";

const PLAN_BADGE_CLASS: Record<PlanType, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  premium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const PLAN_DOT_CLASS: Record<PlanType, string> = {
  free: "bg-muted-foreground",
  basic: "bg-blue-500",
  premium: "bg-amber-500",
};

type NavItem = {
  labelKey: "dashboard" | "notes" | "folders" | "tags" | "profile" | "settings" | "explore";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const getNavItems = (userId?: string): NavItem[] => [
  {
    labelKey: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    labelKey: "explore",
    href: "/search",
    icon: <Search className="h-5 w-5" />,
    authRequired: true,
  },
  {
    labelKey: "notes",
    href: "/notes",
    icon: <FileTextIcon />,
    authRequired: true,
  },
  {
    labelKey: "folders",
    href: "/folders",
    icon: <FolderIcon />,
    authRequired: true,
  },
  { labelKey: "tags", href: "/tags", icon: <TagIcon />, authRequired: true },
  {
    labelKey: "profile",
    href: userId ? `/users/${userId}` : "/dashboard",
    icon: <UserIcon />,
    authRequired: true,
  },
  {
    labelKey: "settings",
    href: "/settings",
    icon: <SettingsIcon />,
    authRequired: true,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [plan, setPlan] = useState<PlanType>("free");
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();

  useEffect(() => {
    if (!session?.user?.id) return;
    getMyFollowStats().then((result) => {
      if (result.success) setFollowStats(result.data);
    });
    getSubscriptionAction().then((result) => {
      if (result.success) setPlan(result.data.plan);
    });
  }, [session?.user?.id]);

  const filteredNavItems = getNavItems(session?.user?.id).filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setShowLogoutDialog(false);
  };

  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <aside
        className={cn(
          "bg-background hidden flex-col border-r transition-all duration-300 md:flex",
          isCollapsed ? "w-16" : "w-64",
        )}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b p-4",
            isCollapsed && "flex-col gap-2 p-2",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "min-w-0 transition-opacity hover:opacity-80",
              isCollapsed && "flex justify-center",
            )}
            aria-label={t("accessibility.homeLink")}
          >
            <BrandLogo
              label={t("common.appName")}
              showText={!isCollapsed}
              imageSize={32}
              className="text-lg"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")
            }
            className={cn(isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center",
              )}
              aria-label={t(`nav.${item.labelKey}`)}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {!isCollapsed && <span>{t(`nav.${item.labelKey}`)}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {session && (
          <div className="space-y-2 border-t p-4">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className={cn(
                "hover:bg-accent flex w-full items-center gap-3 rounded-md p-2 transition-colors",
                isCollapsed && "justify-center",
              )}
              aria-label={t("accessibility.userMenu")}
            >
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getUserInitial()}</AvatarFallback>
                </Avatar>
                {isCollapsed && (
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                      PLAN_DOT_CLASS[plan],
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium">
                      {session.user?.name || t("common.nameNotSet")}
                    </p>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                        PLAN_BADGE_CLASS[plan],
                      )}
                    >
                      {plan === "premium" && (
                        <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                      )}
                      {PLANS[plan].name}
                    </span>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {session.user?.email}
                  </p>
                </div>
              )}
            </button>

            {/* Follow stats */}
            {!isCollapsed && (
              <div className="flex gap-4 px-2">
                <div className="text-xs">
                  <span className="font-semibold">{followStats.followers}</span>
                  <span className="text-muted-foreground ml-1">フォロワー</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold">{followStats.following}</span>
                  <span className="text-muted-foreground ml-1">フォロー中</span>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sidebar.logoutConfirm")}</DialogTitle>
            <DialogDescription>
              {t("sidebar.logoutDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t("sidebar.logout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
