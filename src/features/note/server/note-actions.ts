"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
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

export async function createNote(
  input: CreateNoteInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_note_create", { input });
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateNoteSchema.parse(input);

    const note = await prisma.note.create({
      data: {
        title: validated.title,
        content: validated.content,
        visibility: validated.visibility,
        authorId: session.user.id,
        ...(validated.tagIds && validated.tagIds.length > 0 && {
          tags: {
            create: validated.tagIds.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
        ...(validated.categoryIds && validated.categoryIds.length > 0 && {
          categories: {
            create: validated.categoryIds.map((categoryId: string) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        }),
      },
    });

    logger.info({ noteId: note.id, userId: session.user.id }, "Note created");
    revalidatePath("/notes");

    return { success: true, data: { id: note.id } };
  } catch (error) {
    logger.error({ error, input }, "Failed to create note");
    return { success: false, error: "ノートの作成に失敗しました" };
  }
}

export async function updateNote(input: UpdateNoteInput): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_note_update", { noteId: input.id });
      return { success: false, error: "認証が必要です" };
    }

    const validated = UpdateNoteSchema.parse(input);

    // IDOR protection: Check ownership
    const note = await prisma.note.findUnique({
      where: { id: validated.id },
    });

    if (!note) {
      return { success: false, error: "ノートが見つかりません" };
    }

    if (note.authorId !== session.user.id) {
      logSecurityEvent("unauthorized_note_update_attempt", {
        noteId: validated.id,
        userId: session.user.id,
        ownerId: note.authorId,
      });
      return { success: false, error: "このノートを更新する権限がありません" };
    }

    await prisma.note.update({
      where: { id: validated.id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.content && { content: validated.content }),
        ...(validated.visibility && { visibility: validated.visibility }),
        ...(validated.tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: validated.tagIds.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
        ...(validated.categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: validated.categoryIds.map((categoryId: string) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        }),
      },
    });

    logger.info({ noteId: validated.id, userId: session.user.id }, "Note updated");
    revalidatePath("/notes");
    revalidatePath(`/notes/${validated.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error, input }, "Failed to update note");
    return { success: false, error: "ノートの更新に失敗しました" };
  }
}

export async function deleteNote(id: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      logSecurityEvent("unauthorized_note_delete", { noteId: id });
      return { success: false, error: "認証が必要です" };
    }

    // IDOR protection: Check ownership
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return { success: false, error: "ノートが見つかりません" };
    }

    if (note.authorId !== session.user.id) {
      logSecurityEvent("unauthorized_note_delete_attempt", {
        noteId: id,
        userId: session.user.id,
        ownerId: note.authorId,
      });
      return { success: false, error: "このノートを削除する権限がありません" };
    }

    await prisma.note.delete({
      where: { id },
    });

    logger.info({ noteId: id, userId: session.user.id }, "Note deleted");
    revalidatePath("/notes");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error, noteId: id }, "Failed to delete note");
    return { success: false, error: "ノートの削除に失敗しました" };
  }
}

export async function getNoteById(id: string) {
  try {
    const session = await getSession();

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!note) {
      return null;
    }

    // Check visibility
    if (note.visibility === "private" && note.authorId !== session?.user?.id) {
      return null;
    }

    return note;
  } catch (error) {
    logger.error({ error, noteId: id }, "Failed to get note");
    return null;
  }
}

export async function getNotes(params?: {
  visibility?: string;
  tagId?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const session = await getSession();

    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { visibility: "public" },
          ...(session?.user?.id ? [{ authorId: session.user.id }] : []),
        ],
        ...(params?.tagId && {
          tags: {
            some: {
              tagId: params.tagId,
            },
          },
        }),
        ...(params?.categoryId && {
          categories: {
            some: {
              categoryId: params.categoryId,
            },
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: params?.limit || 20,
      skip: params?.offset || 0,
    });

    return notes;
  } catch (error) {
    logger.error({ error, params }, "Failed to get notes");
    return [];
  }
}
