import { prisma } from "@/lib/prisma";
import { AuthorizationError, NotFoundError } from "@/lib/errors";

/**
 * IDOR対策: リソース所有権チェック
 */

export async function verifyNoteOwnership(
  noteId: string,
  userId: string
): Promise<void> {
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

export async function verifyTemplateOwnership(
  templateId: string,
  userId: string
): Promise<void> {
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
  userId?: string
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

  // 有効期限チェック
  if (share.expiresAt && share.expiresAt < new Date()) {
    throw new AuthorizationError("この共有リンクは期限切れです");
  }

  // ユーザー指定がある場合はチェック
  if (share.userId && share.userId !== userId) {
    throw new AuthorizationError("この共有リンクにアクセスする権限がありません");
  }

  return {
    noteId: share.noteId,
    permission: share.permission,
  };
}

/**
 * リソースの可視性チェック（public/shared/private）
 */
export async function checkNoteVisibility(
  noteId: string,
  userId?: string
): Promise<boolean> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: {
      authorId: true,
      visibility: true,
    },
  });

  if (!note) {
    return false;
  }

  // 作成者は常にアクセス可能
  if (note.authorId === userId) {
    return true;
  }

  // publicは誰でもアクセス可能
  if (note.visibility === "public") {
    return true;
  }

  // sharedは共有設定をチェック（別途実装）
  if (note.visibility === "shared") {
    // TODO: 共有設定のチェック
    return false;
  }

  // privateは作成者のみ
  return false;
}
