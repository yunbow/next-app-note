import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  createHref: (page: number) => string;
}

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({ currentPage, totalPages, createHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const navLinkClass = (enabled: boolean) =>
    cn(
      buttonVariants({ variant: "outline", size: "icon" }),
      "h-9 w-9",
      !enabled && "pointer-events-none opacity-50",
    );

  return (
    <nav role="navigation" aria-label="ページネーション" className="flex items-center justify-center gap-1">
      {hasPrev ? (
        <Link href={createHref(currentPage - 1)} aria-label="前のページ" className={navLinkClass(true)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-label="前のページ" aria-disabled className={navLinkClass(false)}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {getPageRange(currentPage, totalPages).map((page, i) =>
        page === "…" ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <Link
            key={page}
            href={createHref(page)}
            aria-label={`${page}ページ目`}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: page === currentPage ? "default" : "outline",
                size: "icon",
              }),
              "h-9 w-9",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link href={createHref(currentPage + 1)} aria-label="次のページ" className={navLinkClass(true)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-label="次のページ" aria-disabled className={navLinkClass(false)}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
