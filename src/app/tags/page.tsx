import Link from "next/link";
import { redirect } from "next/navigation";
import { Tag as TagIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTagsWithCount } from "@/features/tag/server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TagsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getTagsWithCount();
  const tags = result.success && result.data ? result.data : [];

  return (
    <div className="container max-w-5xl mx-auto space-y-6">
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
              ({tags.length})
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
    </div>
  );
}
