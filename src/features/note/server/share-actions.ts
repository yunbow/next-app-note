"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateNoteShareSchema,
  type CreateNoteShareInput,
} from "../schema/note-schema";

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

export async function createNoteShare(
  input: CreateNoteShareInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_share_create", { input });
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateNoteShareSchema.parse(input);

    // Check note ownership
    const note = await prisma.note.findUnique({
      where: { id: validated.noteId },
    });

    if (!note) {
      return { success: false, error: "ノートが見つかりません" };
    }

    if (note.authorId !== session.user.id) {
      logSecurityEvent("unauthorized_share_create_attempt", {
        noteId: validated.noteId,
        userId: session.user.id,
        ownerId: note.authorId,
      });
      return { success: false, error: "このノートを共有する権限がありません" };
    }

    // Hash password if provided
    const hashedPassword = validated.password
      ? await bcrypt.hash(validated.password, 10)
      : null;

    const share = await prisma.noteShare.create({
      data: {
        noteId: validated.noteId,
        userId: validated.userId || null,
        permission: validated.permission,
        password: hashedPassword,
        expiresAt: validated.expiresAt || null,
      },
    });

    logger.info(
      { shareId: share.id, noteId: validated.noteId, userId: session.user.id },
      "Note share created"
    );
    revalidatePath(`/notes/${validated.noteId}`);

    return { success: true, data: { id: share.id } };
  } catch (error) {
    logger.error({ error, input }, "Failed to create note share");
    return { success: false, error: "共有の作成に失敗しました" };
  }
}

export async function deleteNoteShare(id: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_share_delete", { shareId: id });
      return { success: false, error: "認証が必要です" };
    }

    // Check ownership
    const share = await prisma.noteShare.findUnique({
      where: { id },
      include: {
        note: true,
      },
    });

    if (!share) {
      return { success: false, error: "共有が見つかりません" };
    }

    if (share.note.authorId !== session.user.id) {
      logSecurityEvent("unauthorized_share_delete_attempt", {
        shareId: id,
        userId: session.user.id,
        ownerId: share.note.authorId,
      });
      return { success: false, error: "この共有を削除する権限がありません" };
    }

    await prisma.noteShare.delete({
      where: { id },
    });

    logger.info({ shareId: id, userId: session.user.id }, "Note share deleted");
    revalidatePath(`/notes/${share.noteId}`);

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error, shareId: id }, "Failed to delete note share");
    return { success: false, error: "共有の削除に失敗しました" };
  }
}
