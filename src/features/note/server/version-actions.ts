"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateNoteVersionSchema,
  type CreateNoteVersionInput,
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

export async function createNoteVersion(
  input: CreateNoteVersionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_version_create", { input });
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateNoteVersionSchema.parse(input);

    // Check note ownership
    const note = await prisma.note.findUnique({
      where: { id: validated.noteId },
    });

    if (!note) {
      return { success: false, error: "ノートが見つかりません" };
    }

    if (note.authorId !== session.user.id) {
      logSecurityEvent("unauthorized_version_create_attempt", {
        noteId: validated.noteId,
        userId: session.user.id,
        ownerId: note.authorId,
      });
      return { success: false, error: "このノートのバージョンを作成する権限がありません" };
    }

    const version = await prisma.noteVersion.create({
      data: {
        content: validated.content,
        noteId: validated.noteId,
        userId: session.user.id,
      },
    });

    logger.info(
      { versionId: version.id, noteId: validated.noteId, userId: session.user.id },
      "Note version created"
    );
    revalidatePath(`/notes/${validated.noteId}`);

    return { success: true, data: { id: version.id } };
  } catch (error) {
    logger.error({ error, input }, "Failed to create note version");
    return { success: false, error: "バージョンの作成に失敗しました" };
  }
}

export async function getNoteVersions(noteId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
    }

    // Check note ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.authorId !== session.user.id) {
      return [];
    }

    const versions = await prisma.noteVersion.findMany({
      where: { noteId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return versions;
  } catch (error) {
    logger.error({ error, noteId }, "Failed to get note versions");
    return [];
  }
}

/**
 * 指定バージョンの content でノートを復元する。
 * 復元前に現在版のスナップショットを自動作成するので「やっぱり戻したい」にも対応できる。
 */
export async function restoreNoteVersion(
  versionId: string
): Promise<ActionResult<{ noteId: string }>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_version_restore", { versionId });
      return { success: false, error: "認証が必要です" };
    }

    const version = await prisma.noteVersion.findUnique({
      where: { id: versionId },
      include: { note: true },
    });

    if (!version) {
      return { success: false, error: "バージョンが見つかりません" };
    }

    // IDOR 対策: ノート所有者のみ復元可能
    if (version.note.authorId !== session.user.id) {
      logSecurityEvent("unauthorized_version_restore_attempt", {
        versionId,
        noteId: version.noteId,
        userId: session.user.id,
        ownerId: version.note.authorId,
      });
      return { success: false, error: "このバージョンを復元する権限がありません" };
    }

    // トランザクション: 1) 現在版のスナップショット 2) content 復元
    await prisma.$transaction(async (tx) => {
      if (version.note.content !== version.content) {
        await tx.noteVersion.create({
          data: {
            content: version.note.content,
            noteId: version.noteId,
            userId: session.user.id,
          },
        });
      }

      await tx.note.update({
        where: { id: version.noteId },
        data: { content: version.content },
      });
    });

    logger.info(
      { versionId, noteId: version.noteId, userId: session.user.id },
      "Note version restored"
    );
    revalidatePath(`/notes/${version.noteId}`);

    return { success: true, data: { noteId: version.noteId } };
  } catch (error) {
    logger.error({ error, versionId }, "Failed to restore note version");
    return { success: false, error: "バージョンの復元に失敗しました" };
  }
}
