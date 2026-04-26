import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, FileText, Tag as TagIcon, Folder, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getNotes } from "@/features/note/server/actions";
import { getTagsWithCount } from "@/features/tag/server/actions";
import { getCategoriesWithCount } from "@/features/category/server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [notesResult, tagsResult, foldersResult] = await Promise.all([
    getNotes(),
    getTagsWithCount(),
    getCategoriesWithCount(),
  ]);

  const notesData = notesResult.success && notesResult.data ? notesResult.data : { notes: [], total: 0 };
  const tagsData = tagsResult.success && tagsResult.data ? tagsResult.data : { items: [], total: 0 };
  const foldersData = foldersResult.success && foldersResult.data ? foldersResult.data : { items: [], total: 0 };
  const recentNotes = notesData.notes.slice(0, 5);
  const displayName = session.user.name ?? session.user.email ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">こんにちは、{displayName}さん</h1>
          <p className="text-sm text-muted-foreground mt-1">
            今日もメモを整理しましょう
          </p>
        </div>
        <Link href="/notes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規ノート
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ノート数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notesData.total}</div>
            <Link
              href="/notes"
              className="text-xs text-muted-foreground hover:underline"
            >
              すべてのノートを見る
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">フォルダ数</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{foldersData.total}</div>
            <Link
              href="/folders"
              className="text-xs text-muted-foreground hover:underline"
            >
              すべてのフォルダを見る
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">タグ数</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tagsData.total}</div>
            <Link
              href="/tags"
              className="text-xs text-muted-foreground hover:underline"
            >
              すべてのタグを見る
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近のノート
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              まだノートがありません。新規作成してみましょう。
            </p>
          ) : (
            <ul className="space-y-3">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className="block rounded-md border p-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {note.content.substring(0, 100)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </div>
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
