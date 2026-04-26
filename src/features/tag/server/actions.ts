"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticationError, isAppError } from "@/lib/errors";
import { logError } from "@/lib/logger/index";

const TAGS_PAGE_SIZE = 24;

export type TagWithCount = {
  id: string;
  name: string;
  noteCount: number;
};

export type TagPage = {
  items: TagWithCount[];
  total: number;
  page: number;
  totalPages: number;
};

export async function getTagsWithCount(options?: { page?: number }): Promise<
  { success: true; data: TagPage } | { success: false; error: string }
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

    const [tags, total] = await prisma.$transaction([
      prisma.tag.findMany({
        where,
        select,
        orderBy: { name: "asc" },
        skip: (page - 1) * TAGS_PAGE_SIZE,
        take: TAGS_PAGE_SIZE,
      }),
      prisma.tag.count({ where }),
    ]);

    const items: TagWithCount[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      noteCount: tag._count.notes,
    }));

    const totalPages = Math.ceil(total / TAGS_PAGE_SIZE);
    return { success: true, data: { items, total, page, totalPages } };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getTagsWithCount");
      return { success: false, error: error.message };
    }

    logError(error, "getTagsWithCount");
    return { success: false, error: "タグの取得に失敗しました" };
  }
}
