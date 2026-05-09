import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotes } from "@/features/note/server/actions";
import { getTagsWithCount } from "@/features/tag/server/actions";
import { NoteList } from "@/features/note/components/NoteList";

interface Props {
  searchParams: Promise<{ page?: string; q?: string; tag?: string }>;
}

export default async function NotesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const q = params.q ?? "";
  const tag = params.tag ?? "";

  const [notesResult, tagsResult] = await Promise.all([
    getNotes({ page, q, tag }),
    getTagsWithCount(),
  ]);

  const { notes, currentPage, totalPages } = notesResult.success && notesResult.data
    ? { notes: notesResult.data.notes, currentPage: notesResult.data.page, totalPages: notesResult.data.totalPages }
    : { notes: [], currentPage: 1, totalPages: 1 };

  const allTags = tagsResult.success && tagsResult.data
    ? tagsResult.data.items.map((t) => t.name)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">マイノート</h1>
      <NoteList
        notes={notes}
        allTags={allTags}
        currentTag={tag}
        currentQ={q}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
