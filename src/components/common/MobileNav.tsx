"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  FileTextIcon,
  FolderIcon,
  TagIcon,
  UserIcon,
  SettingsIcon,
} from "./icons";
import { useTranslations } from "@/lib/i18n";

type NavItem = {
  labelKey: "dashboard" | "notes" | "folders" | "tags" | "profile" | "settings";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const getNavItems = (userId?: string): NavItem[] => [
  { labelKey: "dashboard", href: "/dashboard", icon: <HomeIcon /> },
  { labelKey: "notes", href: "/notes", icon: <FileTextIcon />, authRequired: true },
  { labelKey: "folders", href: "/folders", icon: <FolderIcon />, authRequired: true },
  { labelKey: "tags", href: "/tags", icon: <TagIcon />, authRequired: true },
  { labelKey: "profile", href: userId ? `/users/${userId}` : "/dashboard", icon: <UserIcon />, authRequired: true },
  { labelKey: "settings", href: "/settings", icon: <SettingsIcon />, authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();

  const filteredNavItems = getNavItems(session?.user?.id).filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t(`nav.${item.labelKey}`)}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="text-xs">{t(`nav.${item.labelKey}`)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
