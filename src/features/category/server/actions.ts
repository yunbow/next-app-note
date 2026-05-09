"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticationError, isAppError } from "@/lib/errors";
import { logError } from "@/lib/logger/index";

const FOLDERS_PAGE_SIZE = 15;

export type CategoryWithCount = {
  id: string;
  name: string;
  noteCount: number;
};

export type CategoryPage = {
  items: CategoryWithCount[];
  total: number;
  page: number;
  totalPages: number;
};

export async function getCategoriesWithCount(options?: { page?: number }): Promise<
  { success: true; data: CategoryPage } | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const userId = session.user.id;
    const page = Math.max(1, options?.page ?? 1);

    const where = {
      notes: {
        some: {
          note: { authorId: userId },
        },
      },
    };

    const select = {
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
    } as const;

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        select,
        orderBy: { name: "asc" },
        skip: (page - 1) * FOLDERS_PAGE_SIZE,
        take: FOLDERS_PAGE_SIZE,
      }),
      prisma.category.count({ where }),
    ]);

    const items: CategoryWithCount[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      noteCount: c._count.notes,
    }));

    const totalPages = Math.ceil(total / FOLDERS_PAGE_SIZE);
    return { success: true, data: { items, total, page, totalPages } };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getCategoriesWithCount");
      return { success: false, error: error.message };
    }

    logError(error, "getCategoriesWithCount");
    return { success: false, error: "フォルダの取得に失敗しました" };
  }
}
