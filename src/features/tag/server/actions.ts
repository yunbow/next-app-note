"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticationError, isAppError } from "@/lib/errors";
import { logError } from "@/lib/logger/index";

export type TagWithCount = {
  id: string;
  name: string;
  noteCount: number;
};

export async function getTagsWithCount(): Promise<
  { success: true; data: TagWithCount[] } | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const userId = session.user.id;

    const tags = await prisma.tag.findMany({
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

    const data: TagWithCount[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      noteCount: tag._count.notes,
    }));

    return { success: true, data };
  } catch (error) {
    if (isAppError(error)) {
      logError(error, "getTagsWithCount");
      return { success: false, error: error.message };
    }

    logError(error, "getTagsWithCount");
    return { success: false, error: "タグの取得に失敗しました" };
  }
}
