import Link from "next/link";
import { redirect } from "next/navigation";
import { Folder } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCategoriesWithCount } from "@/features/category/server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function FoldersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const result = await getCategoriesWithCount({ page });
  const { items: folders, total, totalPages, page: currentPage } = result.success && result.data
    ? result.data
    : { items: [], total: 0, totalPages: 1, page: 1 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">フォルダ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ノートを分類しているフォルダの一覧
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="h-5 w-5" />
            すべてのフォルダ
            <span className="text-sm font-normal text-muted-foreground">
              ({total})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {folders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              まだフォルダがありません。ノートにカテゴリを設定してみましょう。
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <li key={folder.id}>
                  <Link
                    href={`/notes?category=${encodeURIComponent(folder.name)}`}
                    className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-accent transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        {folder.name}
                      </span>
                    </span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground shrink-0">
                      {folder.noteCount}
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
        createHref={(p) => `/folders${p > 1 ? `?page=${p}` : ""}`}
      />
    </div>
  );
}
