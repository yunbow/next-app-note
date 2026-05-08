import { prisma } from "@/lib/prisma";
import { AuthorizationError, NotFoundError } from "@/lib/errors";

export async function verifyNoteOwnership(noteId: string, userId: string): Promise<void> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { authorId: true },
  });

  if (!note) {
    throw new NotFoundError("ノート");
  }

  if (note.authorId !== userId) {
    throw new AuthorizationError("このノートにアクセスする権限がありません");
  }
}

export async function verifyTemplateOwnership(templateId: string, userId: string): Promise<void> {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { userId: true },
  });

  if (!template) {
    throw new NotFoundError("テンプレート");
  }

  if (template.userId !== userId) {
    throw new AuthorizationError("このテンプレートにアクセスする権限がありません");
  }
}

export async function verifyNoteShareAccess(
  shareId: string,
  userId?: string,
): Promise<{ noteId: string; permission: string }> {
  const share = await prisma.noteShare.findUnique({
    where: { id: shareId },
    select: {
      noteId: true,
      userId: true,
      permission: true,
      expiresAt: true,
    },
  });

  if (!share) {
    throw new NotFoundError("共有リンク");
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    throw new AuthorizationError("この共有リンクは期限切れです");
  }

  if (share.userId && share.userId !== userId) {
    throw new AuthorizationError("この共有リンクにアクセスする権限がありません");
  }

  return { noteId: share.noteId, permission: share.permission };
}

export async function checkNoteVisibility(noteId: string, userId?: string): Promise<boolean> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { authorId: true, visibility: true },
  });

  if (!note) return false;
  if (note.authorId === userId) return true;
  if (note.visibility === "public") return true;
  if (note.visibility === "shared") {
    // TODO: 共有設定のチェック
    return false;
  }
  return false;
}
