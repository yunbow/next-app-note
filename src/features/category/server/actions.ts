"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticationError, isAppError } from "@/lib/errors";
import { logError } from "@/lib/logger/index";

export type CategoryWithCount = {
  id: string;
  name: string;
  noteCount: number;
};

export async function getCategoriesWithCount(): Promise<
  { success: true; data: CategoryWithCount[] } | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const userId = session.user.id;

    const categories = await prisma.category.findMany({
      where: {
        notes: {
          some: {
            note: { authorId: userId },
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            notes: {
              where: {
                note: { authorId: userId },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data: CategoryWithCount[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      noteCount: c._count.notes,
    }));

    return { success: true, data };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getCategoriesWithCount");
      return { success: false, error: error.message };
    }

    logError(error, "getCategoriesWithCount");
    return { success: false, error: "フォルダの取得に失敗しました" };
  }
}
