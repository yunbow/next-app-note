import Link from "next/link";
import { redirect } from "next/navigation";
import { Folder } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCategoriesWithCount } from "@/features/category/server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FoldersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getCategoriesWithCount();
  const folders = result.success && result.data ? result.data : [];

  return (
    <div className="container max-w-5xl mx-auto space-y-6">
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
              ({folders.length})
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
    </div>
  );
}
