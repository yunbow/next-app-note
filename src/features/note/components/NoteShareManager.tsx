"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Trash2, Plus, Eye, Edit, Link, User, Globe, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNoteShare, deleteNoteShare, findUserByEmail, getNoteShares } from "../server/share-actions";
import { cn } from "@/lib/utils";

type Share = Awaited<ReturnType<typeof getNoteShares>>[number];

interface NoteShareManagerProps {
  noteId: string;
  initialShares: Share[];
}

export function NoteShareManager({ noteId, initialShares }: NoteShareManagerProps) {
  const [shares, setShares] = useState<Share[]>(initialShares);
  const [isCreating, setIsCreating] = useState(false);

  const [targetEmail, setTargetEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [expiresIn, setExpiresIn] = useState<"" | "1" | "7" | "30">("");

  const reload = async () => {
    const updated = await getNoteShares(noteId);
    setShares(updated);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      let userId: string | null = null;

      if (targetEmail.trim()) {
        const result = await findUserByEmail(targetEmail.trim());
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        userId = result.data.id;
      }

      const expiresAt = expiresIn
        ? new Date(Date.now() + Number(expiresIn) * 24 * 60 * 60 * 1000)
        : null;

      const result = await createNoteShare({ noteId, userId, permission, expiresAt });

      if (result.success) {
        toast.success("共有を作成しました");
        setTargetEmail("");
        setPermission("view");
        setExpiresIn("");
        await reload();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (shareId: string) => {
    const result = await deleteNoteShare(shareId);
    if (result.success) {
      toast.success("共有を削除しました");
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } else {
      toast.error(result.error);
    }
  };

  const isExpired = (expiresAt: Date | null) => expiresAt !== null && expiresAt < new Date();

  return (
    <div className="space-y-6">
      {/* Existing shares */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">現在の共有設定</h3>
        {shares.length === 0 ? (
          <p className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">
            共有設定はまだありません
          </p>
        ) : (
          <ul className="space-y-2">
            {shares.map((share) => (
              <li
                key={share.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded border p-3",
                  isExpired(share.expiresAt) && "opacity-50",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {share.user ? (
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {share.user
                        ? (share.user.name || share.user.email)
                        : "リンクを知っている全員"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {share.expiresAt && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {isExpired(share.expiresAt)
                            ? "期限切れ"
                            : format(share.expiresAt, "yyyy/MM/dd", { locale: ja }) + " まで"}
                        </span>
                      )}
                      {share.password && <span>🔒 パスワード保護</span>}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      share.permission === "edit"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {share.permission === "edit" ? (
                      <><Edit className="h-3 w-3" />編集</>
                    ) : (
                      <><Eye className="h-3 w-3" />閲覧</>
                    )}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(share.id)}
                    aria-label="共有を削除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create new share */}
      <div className="space-y-3 rounded border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          新しい共有を追加
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="share-email" className="text-xs">
            共有相手のメールアドレス（空欄でリンク共有）
          </Label>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              id="share-email"
              type="email"
              placeholder="user@example.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="share-permission" className="text-xs">権限</Label>
            <select
              id="share-permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value as "view" | "edit")}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="view">閲覧のみ</option>
              <option value="edit">編集可</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="share-expires" className="text-xs">有効期限</Label>
            <select
              id="share-expires"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value as "" | "1" | "7" | "30")}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">無期限</option>
              <option value="1">1日</option>
              <option value="7">7日</option>
              <option value="30">30日</option>
            </select>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full gap-2"
        >
          <Link className="h-4 w-4" />
          {isCreating ? "作成中..." : "共有を作成"}
        </Button>
      </div>
    </div>
  );
}
