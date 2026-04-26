"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownLeft, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createNoteLink, deleteNoteLink } from "../server/link-actions";
import { getNotes } from "../server/actions";

interface LinkedNote {
  id: string;
  title: string;
}

interface NoteLinkRow {
  id: string;
  sourceNote?: LinkedNote;
  targetNote?: LinkedNote;
}

interface NoteLinksProps {
  noteId: string;
  links: NoteLinkRow[]; // outgoing (this note → others)
  linkedFrom: NoteLinkRow[]; // incoming (others → this note)
}

export function NoteLinks({ noteId, links, linkedFrom }: NoteLinksProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableNotes, setAvailableNotes] = useState<LinkedNote[]>([]);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [search, setSearch] = useState("");

  const linkedNoteIds = new Set([
    ...links.map((l) => l.targetNote?.id).filter(Boolean),
    ...linkedFrom.map((l) => l.sourceNote?.id).filter(Boolean),
    noteId,
  ]);

  const loadNotes = async () => {
    setIsFetchingNotes(true);
    const result = await getNotes({ all: true });
    setIsFetchingNotes(false);
    if (result.success && result.data) {
      setAvailableNotes(
        result.data.notes
          .filter((n: LinkedNote) => !linkedNoteIds.has(n.id))
          .map((n: LinkedNote) => ({ id: n.id, title: n.title }))
      );
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      loadNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen]);

  const handleAdd = async (targetNoteId: string) => {
    setIsAdding(true);
    const result = await createNoteLink({ sourceNoteId: noteId, targetNoteId });
    setIsAdding(false);

    if (result.success) {
      toast.success("リンクを追加しました");
      setIsDialogOpen(false);
      setSearch("");
      router.refresh();
    } else {
      toast.error(result.error || "リンクの追加に失敗しました");
    }
  };

  const handleDelete = async (linkId: string) => {
    setIsDeleting(linkId);
    const result = await deleteNoteLink(linkId);
    setIsDeleting(null);

    if (result.success) {
      toast.success("リンクを削除しました");
      router.refresh();
    } else {
      toast.error(result.error || "リンクの削除に失敗しました");
    }
  };

  const filteredNotes = search.trim()
    ? availableNotes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase())
      )
    : availableNotes;

  return (
    <div className="space-y-6">
      {/* Outgoing links */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            このノートからのリンク ({links.length})
          </h3>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            リンクを追加
          </Button>
        </div>
        {links.length === 0 ? (
          <p className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">
            他のノートへのリンクはまだありません
          </p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) =>
              l.targetNote ? (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded border p-3 hover:bg-accent/40"
                >
                  <Link
                    href={`/notes/${l.targetNote.id}`}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate font-medium">
                      {l.targetNote.title}
                    </span>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(l.id)}
                    disabled={isDeleting === l.id}
                    aria-label="リンクを削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ) : null
            )}
          </ul>
        )}
      </section>

      {/* Incoming links (backlinks) */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
          バックリンク ({linkedFrom.length})
        </h3>
        {linkedFrom.length === 0 ? (
          <p className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">
            このノートを参照している他のノートはありません
          </p>
        ) : (
          <ul className="space-y-2">
            {linkedFrom.map((l) =>
              l.sourceNote ? (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded border p-3 hover:bg-accent/40"
                >
                  <Link
                    href={`/notes/${l.sourceNote.id}`}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <ArrowDownLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate font-medium">
                      {l.sourceNote.title}
                    </span>
                  </Link>
                </li>
              ) : null
            )}
          </ul>
        )}
      </section>

      {/* Add link dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>リンクを追加</DialogTitle>
            <DialogDescription>
              自分のノートから選択してリンクを作成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="ノートタイトルで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-[400px] overflow-y-auto rounded border">
              {isFetchingNotes ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  読み込み中...
                </p>
              ) : filteredNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {search.trim()
                    ? "該当するノートが見つかりません"
                    : "リンク可能なノートがありません"}
                </p>
              ) : (
                <ul className="divide-y">
                  {filteredNotes.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleAdd(n.id)}
                        disabled={isAdding}
                        className="flex w-full items-center gap-2 p-3 text-left hover:bg-accent/40 disabled:opacity-50"
                      >
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{n.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
