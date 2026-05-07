"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action-result";
import {
  createNoteSchema,
  updateNoteSchema,
  shareNoteSchema,
  searchNotesSchema,
  createTemplateSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
  type ShareNoteInput,
  type SearchNotesInput,
  type CreateTemplateInput,
} from "../schema";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import {
  AuthenticationError,
  ValidationError,
  isAppError,
  getErrorMessage,
} from "@/lib/errors";
import { verifyNoteOwnership } from "@/lib/security/resource-ownership";
import { createLogger, logError, logSuccess } from "@/lib/logger/index";
import { getUserPlan, getPlanLimits } from "@/lib/stripe/feature-gate";

const logger = createLogger("note-actions");

async function getSession() {
  try {
    return await auth();
  } catch (error) {
    logger.error({ err: error }, "Error getting session");
    return null;
  }
}

// ノート作成
export async function createNote(
  input: CreateNoteInput,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const validated = createNoteSchema.parse(input);

    const plan = await getUserPlan(session.user.id);
    const limits = getPlanLimits(plan);
    if (limits.maxNotes !== null) {
      const count = await prisma.note.count({ where: { authorId: session.user.id } });
      if (count >= limits.maxNotes) {
        return {
          success: false,
          error: `Freeプランではノートは最大${limits.maxNotes}件まで作成できます。Basicプラン以上にアップグレードすると無制限になります`,
        };
      }
    }

    const note = await prisma.note.create({
      data: {
        title: validated.title,
        content: validated.content,
        visibility: validated.visibility,
        authorId: session.user.id,
        tags: validated.tags
          ? {
              create: validated.tags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
        categories: validated.categories
          ? {
              create: validated.categories.map((categoryName) => ({
                category: {
                  connectOrCreate: {
                    where: { name: categoryName },
                    create: { name: categoryName },
                  },
                },
              })),
            }
          : undefined,
      },
    });

    // 初期バージョンを作成
    await prisma.noteVersion.create({
      data: {
        content: validated.content,
        noteId: note.id,
        userId: session.user.id,
      },
    });

    logSuccess("Note created successfully", "createNote", {
      noteId: note.id,
      userId: session.user.id,
    });

    revalidatePath("/notes");
    return { success: true, data: note as any };
  } catch (error) {
    if (error instanceof ZodError) {
      logError(error, "createNote", { input });
      return {
        success: false,
        error: "入力内容に誤りがあります",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (isAppError(error)) {
      logError(error, "createNote");
      return { success: false, error: error.message };
    }

    logError(error, "createNote");
    return { success: false, error: "ノートの作成に失敗しました" };
  }
}

// ノート更新
export async function updateNote(
  input: UpdateNoteInput,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const validated = updateNoteSchema.parse(input);

    // IDOR対策: 権限チェック
    await verifyNoteOwnership(validated.id, session.user.id);

    const note = await prisma.note.update({
      where: { id: validated.id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.content && { content: validated.content }),
        ...(validated.visibility && { visibility: validated.visibility }),
      },
    });

    // バージョン履歴を作成
    if (validated.content) {
      await prisma.noteVersion.create({
        data: {
          content: validated.content,
          noteId: note.id,
          userId: session.user.id,
        },
      });
    }

    logSuccess("Note updated successfully", "updateNote", {
      noteId: note.id,
      userId: session.user.id,
    });

    revalidatePath("/notes");
    revalidatePath(`/notes/${validated.id}`);
    return { success: true, data: note as any };
  } catch (error) {
    if (error instanceof ZodError) {
      logError(error, "updateNote", { input });
      return {
        success: false,
        error: "入力内容に誤りがあります",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (isAppError(error)) {
      logError(error, "updateNote");
      return { success: false, error: error.message };
    }

    logError(error, "updateNote");
    return { success: false, error: "ノートの更新に失敗しました" };
  }
}

// ノート削除
export async function deleteNote(noteId: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    // IDOR対策: 権限チェック
    await verifyNoteOwnership(noteId, session.user.id);

    await prisma.note.delete({
      where: { id: noteId },
    });

    logSuccess("Note deleted successfully", "deleteNote", {
      noteId,
      userId: session.user.id,
    });

    revalidatePath("/notes");
    return { success: true, data: undefined };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "deleteNote");
      return { success: false, error: error.message };
    }

    logError(error, "deleteNote");
    return { success: false, error: "ノートの削除に失敗しました" };
  }
}

// ノート一覧取得
export async function getNotes() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const notes = await prisma.note.findMany({
      where: { authorId: session.user.id },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: notes };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getNotes");
      return { success: false, error: error.message };
    }

    logError(error, "getNotes");
    return { success: false, error: "ノートの取得に失敗しました" };
  }
}

// ノート詳細取得
export async function getNote(noteId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        versions: { orderBy: { createdAt: "desc" }, take: 10 },
        links: {
          include: {
            targetNote: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        linkedFrom: {
          include: {
            sourceNote: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!note) {
      return { success: false, error: "ノートが見つかりません" };
    }

    // 権限チェック
    if (note.authorId !== session.user.id && note.visibility === "private") {
      return { success: false, error: "権限がありません" };
    }

    return { success: true, data: note };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getNote");
      return { success: false, error: error.message };
    }

    logError(error, "getNote");
    return { success: false, error: "ノートの取得に失敗しました" };
  }
}

// ノート検索
export async function searchNotes(input: SearchNotesInput) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const validated = searchNotesSchema.parse(input);

    const notes = await prisma.note.findMany({
      where: {
        authorId: session.user.id,
        ...(validated.query && {
          OR: [
            { title: { contains: validated.query } },
            { content: { contains: validated.query } },
          ],
        }),
        ...(validated.visibility && { visibility: validated.visibility }),
        ...(validated.tags &&
          validated.tags.length > 0 && {
            tags: {
              some: {
                tag: {
                  name: { in: validated.tags },
                },
              },
            },
          }),
        ...(validated.categories &&
          validated.categories.length > 0 && {
            categories: {
              some: {
                category: {
                  name: { in: validated.categories },
                },
              },
            },
          }),
      },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: notes };
  } catch (error) {
    if (error instanceof ZodError) {
      logError(error, "searchNotes", { input });
      return {
        success: false,
        error: "検索条件に誤りがあります",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (isAppError(error)) {
      logError(error, "searchNotes");
      return { success: false, error: error.message };
    }

    logError(error, "searchNotes");
    return { success: false, error: "ノートの検索に失敗しました" };
  }
}

// ノート共有
export async function shareNote(input: ShareNoteInput): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const validated = shareNoteSchema.parse(input);

    // IDOR対策: 権限チェック
    await verifyNoteOwnership(validated.noteId, session.user.id);

    const plan = await getUserPlan(session.user.id);
    const limits = getPlanLimits(plan);

    if (validated.password && !limits.sharePassword) {
      return { success: false, error: "パスワード保護はBasicプラン以上で利用できます" };
    }
    if (validated.expiresAt && !limits.shareExpiry) {
      return { success: false, error: "有効期限の設定はPremiumプランで利用できます" };
    }
    if (validated.permission === "edit" && !limits.shareEditPermission) {
      return { success: false, error: "編集権限付きの共有はPremiumプランで利用できます" };
    }

    const shareData: any = {
      noteId: validated.noteId,
      permission: validated.permission,
      expiresAt: validated.expiresAt,
    };

    if (validated.password) {
      shareData.password = await bcrypt.hash(validated.password, 10);
    }

    const share = await prisma.noteShare.create({
      data: shareData,
    });

    logSuccess("Note shared successfully", "shareNote", {
      shareId: share.id,
      noteId: validated.noteId,
      userId: session.user.id,
    });

    return { success: true, data: share as any };
  } catch (error) {
    if (error instanceof ZodError) {
      logError(error, "shareNote", { input });
      return {
        success: false,
        error: "共有設定に誤りがあります",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (isAppError(error)) {
      logError(error, "shareNote");
      return { success: false, error: error.message };
    }

    logError(error, "shareNote");
    return { success: false, error: "ノートの共有に失敗しました" };
  }
}

// テンプレート作成
export async function createTemplate(
  input: CreateTemplateInput,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const validated = createTemplateSchema.parse(input);

    const plan = await getUserPlan(session.user.id);
    const limits = getPlanLimits(plan);
    if (limits.maxTemplates === 0) {
      return { success: false, error: "テンプレートはBasicプラン以上で利用できます" };
    }
    if (limits.maxTemplates !== null) {
      const count = await prisma.template.count({ where: { userId: session.user.id } });
      if (count >= limits.maxTemplates) {
        return {
          success: false,
          error: `現在のプランではテンプレートは最大${limits.maxTemplates}件まで作成できます。Premiumプランで無制限になります`,
        };
      }
    }

    const template = await prisma.template.create({
      data: {
        name: validated.name,
        content: validated.content,
        type: validated.type,
        userId: session.user.id,
      },
    });

    logSuccess("Template created successfully", "createTemplate", {
      templateId: template.id,
      userId: session.user.id,
    });

    return { success: true, data: template as any };
  } catch (error) {
    if (error instanceof ZodError) {
      logError(error, "createTemplate", { input });
      return {
        success: false,
        error: "入力内容に誤りがあります",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (isAppError(error)) {
      logError(error, "createTemplate");
      return { success: false, error: error.message };
    }

    logError(error, "createTemplate");
    return { success: false, error: "テンプレートの作成に失敗しました" };
  }
}

// テンプレート一覧取得
export async function getTemplates() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const templates = await prisma.template.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: templates };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getTemplates");
      return { success: false, error: error.message };
    }

    logError(error, "getTemplates");
    return { success: false, error: "テンプレートの取得に失敗しました" };
  }
}
