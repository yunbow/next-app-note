"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Trash2, Share2, History, ArrowLeft, RotateCcw, Eye, Link2, User, GitCompare } from "lucide-react";
import { deleteNote } from "../server/actions";
import { restoreNoteVersion } from "../server/version-actions";
import { NoteLinks } from "./NoteLinks";
import { VersionDiff } from "./VersionDiff";
import { NoteShareManager } from "./NoteShareManager";
import type { getNoteShares } from "../server/share-actions";
import { toast } from "sonner";
import Link from "next/link";

interface LinkedNote {
  id: string;
  title: string;
}

interface NoteLinkRow {
  id: string;
  sourceNote?: LinkedNote;
  targetNote?: LinkedNote;
}

interface NoteDetailNote {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  tags: Array<{ tag: { name: string } }>;
  links?: NoteLinkRow[];
  linkedFrom?: NoteLinkRow[];
  versions?: NoteVersion[];
}

type NoteShare = Awaited<ReturnType<typeof getNoteShares>>[number];

interface NoteDetailProps {
  note: NoteDetailNote;
  shares?: NoteShare[];
  isOwner?: boolean;
}

interface NoteVersion {
  id: string;
  content: string;
  createdAt: string | Date;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export function NoteDetail({ note, shares = [], isOwner = false }: NoteDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<NoteVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<NoteVersion | null>(null);
  const [diffVersion, setDiffVersion] = useState<NoteVersion | null>(null);
  const [showShare, setShowShare] = useState(false);

  const handleRestore = async (version: NoteVersion) => {
    setIsRestoring(version.id);
    const result = await restoreNoteVersion(version.id);
    setIsRestoring(null);
    setConfirmRestore(null);

    if (result.success) {
      toast.success("バージョンを復元しました");
      router.refresh();
    } else {
      toast.error(result.error || "復元に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    setIsDeleting(true);
    const result = await deleteNote(note.id);

    if (result.success) {
      toast.success("ノートを削除しました");
      router.push("/notes");
    } else {
      toast.error(result.error || "削除に失敗しました");
      setIsDeleting(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .split("\n")
      .map((line) => {
        if (line.startsWith("### ")) {
          return `<h3 class="text-lg font-semibold mt-4 mb-2">${line.slice(4)}</h3>`;
        }
        if (line.startsWith("## ")) {
          return `<h2 class="text-xl font-semibold mt-4 mb-2">${line.slice(3)}</h2>`;
        }
        if (line.startsWith("# ")) {
          return `<h1 class="text-2xl font-bold mt-4 mb-2">${line.slice(2)}</h1>`;
        }
        if (line.startsWith("- ")) {
          return `<li class="ml-4">${line.slice(2)}</li>`;
        }
        if (line.startsWith("```")) {
          return `<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded my-2"><code>${line.slice(3)}</code></pre>`;
        }
        return line ? `<p class="mb-2">${line}</p>` : "<br/>";
      })
      .join("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/notes">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/notes/${note.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Button>
          </Link>
          {isOwner && (
            <Button variant="outline" onClick={() => setShowShare(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              共有
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-8 dark:bg-gray-800">
        <h1 className="mb-4 text-3xl font-bold">{note.title}</h1>

        <div className="mb-6 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            作成:{" "}
            {formatDistanceToNow(new Date(note.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </span>
          <span>
            更新:{" "}
            {formatDistanceToNow(new Date(note.updatedAt), {
              addSuffix: true,
              locale: ja,
            })}
          </span>
        </div>

        {note.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {note.tags.map((t) => (
              <span
                key={t.tag.name}
                className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {t.tag.name}
              </span>
            ))}
          </div>
        )}

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">内容</TabsTrigger>
            <TabsTrigger value="links">
              <Link2 className="mr-2 h-4 w-4" />
              リンク ({(note.links?.length || 0) + (note.linkedFrom?.length || 0)})
            </TabsTrigger>
            <TabsTrigger value="versions">
              <History className="mr-2 h-4 w-4" />
              履歴 ({note.versions?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <ScrollArea className="h-[600px]">
              <NoteLinks
                noteId={note.id}
                links={note.links || []}
                linkedFrom={note.linkedFrom || []}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="content">
            <ScrollArea className="h-[600px]">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="versions">
            <ScrollArea className="h-[600px]">
              {(!note.versions || note.versions.length === 0) ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  バージョン履歴はまだありません
                </p>
              ) : (
                <div className="space-y-3">
                  {note.versions.map((version: NoteVersion) => (
                    <div
                      key={version.id}
                      className="rounded border p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="font-medium">
                            {format(new Date(version.createdAt), "yyyy/MM/dd HH:mm", {
                              locale: ja,
                            })}
                          </div>
                          <div className="text-xs">
                            {formatDistanceToNow(new Date(version.createdAt), {
                              addSuffix: true,
                              locale: ja,
                            })}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>
                              {version.user?.name || version.user?.email || "不明なユーザー"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDiffVersion(version)}
                          >
                            <GitCompare className="mr-1 h-4 w-4" />
                            差分
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewVersion(version)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            プレビュー
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmRestore(version)}
                            disabled={isRestoring !== null}
                          >
                            <RotateCcw className="mr-1 h-4 w-4" />
                            復元
                          </Button>
                        </div>
                      </div>
                      <div className="line-clamp-3 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {version.content.substring(0, 200)}
                        {version.content.length > 200 && "..."}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewVersion}
        onOpenChange={(open) => !open && setPreviewVersion(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>バージョンのプレビュー</DialogTitle>
            <DialogDescription>
              {previewVersion && (
                <>
                  {format(new Date(previewVersion.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                  {" 時点の内容"}
                  {previewVersion.user && (
                    <span className="ml-2 text-muted-foreground">
                      — {previewVersion.user.name || previewVersion.user.email}
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: previewVersion ? renderMarkdown(previewVersion.content) : "",
              }}
            />
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewVersion(null)}
            >
              閉じる
            </Button>
            <Button
              onClick={() => {
                if (previewVersion) {
                  setConfirmRestore(previewVersion);
                  setPreviewVersion(null);
                }
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              このバージョンを復元
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diff Dialog */}
      <Dialog
        open={!!diffVersion}
        onOpenChange={(open) => !open && setDiffVersion(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              差分表示
            </DialogTitle>
            <DialogDescription>
              {diffVersion && (
                <>
                  {format(new Date(diffVersion.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                  {" 時点 → 現在"}
                  {diffVersion.user && (
                    <span className="ml-2 text-muted-foreground">
                      — {diffVersion.user.name || diffVersion.user.email}
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            {diffVersion && (
              <VersionDiff
                oldContent={diffVersion.content}
                newContent={note.content}
                oldLabel={format(new Date(diffVersion.createdAt), "MM/dd HH:mm", { locale: ja })}
                newLabel="現在"
              />
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiffVersion(null)}>
              閉じる
            </Button>
            <Button
              onClick={() => {
                if (diffVersion) {
                  setConfirmRestore(diffVersion);
                  setDiffVersion(null);
                }
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              このバージョンを復元
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={!!confirmRestore}
        onOpenChange={(open) => !open && setConfirmRestore(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>バージョンを復元</DialogTitle>
            <DialogDescription>
              {confirmRestore &&
                `${format(new Date(confirmRestore.createdAt), "yyyy/MM/dd HH:mm", {
                  locale: ja,
                })} のバージョンで上書きします。現在の内容は自動的にバージョン履歴に保存されます。`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRestore(null)}
              disabled={isRestoring !== null}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => confirmRestore && handleRestore(confirmRestore)}
              disabled={isRestoring !== null}
            >
              {isRestoring ? "復元中..." : "復元する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Management Dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              共有設定
            </DialogTitle>
            <DialogDescription>
              このノートを他のユーザーと共有します
            </DialogDescription>
          </DialogHeader>
          <NoteShareManager noteId={note.id} initialShares={shares} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
