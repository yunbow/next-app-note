import Link from "next/link";
import { redirect } from "next/navigation";
import { Tag as TagIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTagsWithCount } from "@/features/tag/server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TagsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const result = await getTagsWithCount({ page });
  const { items: tags, total, totalPages, page: currentPage } = result.success && result.data
    ? result.data
    : { items: [], total: 0, totalPages: 1, page: 1 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">タグ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ノートを分類しているタグの一覧
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            すべてのタグ
            <span className="text-sm font-normal text-muted-foreground">
              ({total})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              まだタグがありません。ノートにタグを追加してみましょう。
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/notes?tag=${encodeURIComponent(tag.name)}`}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                  >
                    <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{tag.name}</span>
                    <span className="ml-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {tag.noteCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        createHref={(p) => `/tags${p > 1 ? `?page=${p}` : ""}`}
      />
    </div>
  );
}
