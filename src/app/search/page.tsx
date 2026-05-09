import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPublicNotes } from "@/features/note/server/actions";
import { Pagination } from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const q = params.q ?? "";

  const result = await getPublicNotes({ page, q });
  const { notes, currentPage, totalPages } = result.success && result.data
    ? { notes: result.data.notes, currentPage: result.data.page, totalPages: result.data.totalPages }
    : { notes: [], currentPage: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">検索</h1>
        {result.success && result.data && (
          <span className="text-sm text-muted-foreground">
            {result.data.total} 件の公開ノート
          </span>
        )}
      </div>

      {/* Search */}
      <form method="get" action="/search" className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="タイトル・内容で検索..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          検索
        </button>
        {q && (
          <Link
            href="/search"
            className="h-9 inline-flex items-center rounded-md border px-3 text-sm hover:bg-accent"
          >
            クリア
          </Link>
        )}
      </form>

      {notes.length === 0 ? (
        <div className="rounded-lg border py-16 text-center text-muted-foreground">
          {q ? `「${q}」に一致する公開ノートはありません` : "公開ノートはまだありません"}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="group block rounded-lg border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <h2 className="mb-1 line-clamp-2 font-semibold group-hover:text-primary">
                {note.title}
              </h2>

              <p className="mb-3 text-xs text-muted-foreground">
                {note.author?.name || note.author?.email || "匿名"} ·{" "}
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>

              {note.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {note.tags.slice(0, 4).map((t) => (
                    <span
                      key={t.tag.name}
                      className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {t.tag.name}
                    </span>
                  ))}
                  {note.tags.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{note.tags.length - 4}
                    </span>
                  )}
                </div>
              )}

              <p className="line-clamp-3 text-sm text-muted-foreground">
                {note.content || "（内容なし）"}
              </p>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          createHref={(p) =>
            `/search?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`
          }
        />
      )}
    </div>
  );
}
