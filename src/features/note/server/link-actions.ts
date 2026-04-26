"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { CreateNoteLinkSchema, type CreateNoteLinkInput } from "../schema/note-schema";

function logSecurityEvent(event: string, details: Record<string, unknown>) {
  logger.warn({ event, ...details }, "Security event");
}

async function getSession() {
  try {
    return await auth();
  } catch (error) {
    logger.error({ err: error }, "Error getting session");
    return null;
  }
}

/**
 * ノート間リンクを作成する。
 *
 * ポリシー:
 *   - 両端ノートの所有者が現在のユーザーであること（IDOR対策）
 *   - 自己参照は禁止（source === target）
 *   - 双方向リンク (A→B, B→A) は許可（ナレッジグラフで正常）
 *   - 多ノード循環 (A→B→C→A) も許可（同上）
 *   - @@unique([sourceNoteId, targetNoteId]) で同一リンク重複は DB で防止
 */
export async function createNoteLink(
  input: CreateNoteLinkInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_link_create", { input });
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateNoteLinkSchema.parse(input);

    if (validated.sourceNoteId === validated.targetNoteId) {
      return { success: false, error: "同じノートにリンクできません" };
    }

    // 両端ノートの所有者チェック（1 クエリで取得して比較）
    const notes = await prisma.note.findMany({
      where: {
        id: { in: [validated.sourceNoteId, validated.targetNoteId] },
      },
      select: { id: true, authorId: true },
    });

    if (notes.length !== 2) {
      return { success: false, error: "ノートが見つかりません" };
    }

    const unauthorized = notes.find((n) => n.authorId !== session.user.id);
    if (unauthorized) {
      logSecurityEvent("unauthorized_link_create_attempt", {
        userId: session.user.id,
        noteId: unauthorized.id,
        ownerId: unauthorized.authorId,
      });
      return { success: false, error: "このノートにリンクする権限がありません" };
    }

    try {
      const link = await prisma.noteLink.create({
        data: {
          sourceNoteId: validated.sourceNoteId,
          targetNoteId: validated.targetNoteId,
        },
      });

      logger.info(
        {
          linkId: link.id,
          sourceNoteId: validated.sourceNoteId,
          targetNoteId: validated.targetNoteId,
          userId: session.user.id,
        },
        "Note link created"
      );
      revalidatePath(`/notes/${validated.sourceNoteId}`);
      revalidatePath(`/notes/${validated.targetNoteId}`);

      return { success: true, data: { id: link.id } };
    } catch (error: unknown) {
      // Prisma P2002: unique constraint violation → 重複
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        return { success: false, error: "既にリンクされています" };
      }
      throw error;
    }
  } catch (error) {
    logger.error({ error, input }, "Failed to create note link");
    return { success: false, error: "リンクの作成に失敗しました" };
  }
}

/**
 * リンクを削除する。source/target いずれかのノート所有者であれば削除可能。
 */
export async function deleteNoteLink(linkId: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_link_delete", { linkId });
      return { success: false, error: "認証が必要です" };
    }

    const link = await prisma.noteLink.findUnique({
      where: { id: linkId },
      include: {
        sourceNote: { select: { authorId: true } },
        targetNote: { select: { authorId: true } },
      },
    });

    if (!link) {
      return { success: false, error: "リンクが見つかりません" };
    }

    const canDelete =
      link.sourceNote.authorId === session.user.id ||
      link.targetNote.authorId === session.user.id;

    if (!canDelete) {
      logSecurityEvent("unauthorized_link_delete_attempt", {
        linkId,
        userId: session.user.id,
        sourceOwner: link.sourceNote.authorId,
        targetOwner: link.targetNote.authorId,
      });
      return { success: false, error: "このリンクを削除する権限がありません" };
    }

    await prisma.noteLink.delete({ where: { id: linkId } });

    logger.info(
      { linkId, userId: session.user.id },
      "Note link deleted"
    );
    revalidatePath(`/notes/${link.sourceNoteId}`);
    revalidatePath(`/notes/${link.targetNoteId}`);

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error, linkId }, "Failed to delete note link");
    return { success: false, error: "リンクの削除に失敗しました" };
  }
}

/**
 * 指定ノートの入出リンクを取得する。
 */
export async function getNoteLinks(noteId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { outgoing: [], incoming: [] };
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { authorId: true, visibility: true },
    });

    if (!note) return { outgoing: [], incoming: [] };

    // Private ノートは所有者のみ閲覧可
    if (note.authorId !== session.user.id && note.visibility === "private") {
      return { outgoing: [], incoming: [] };
    }

    const [outgoing, incoming] = await Promise.all([
      prisma.noteLink.findMany({
        where: { sourceNoteId: noteId },
        include: {
          targetNote: {
            select: { id: true, title: true, authorId: true, visibility: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.noteLink.findMany({
        where: { targetNoteId: noteId },
        include: {
          sourceNote: {
            select: { id: true, title: true, authorId: true, visibility: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { outgoing, incoming };
  } catch (error) {
    logger.error({ error, noteId }, "Failed to get note links");
    return { outgoing: [], incoming: [] };
  }
}
