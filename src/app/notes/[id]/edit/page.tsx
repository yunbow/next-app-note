import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNote } from "@/features/note/server/actions";
import { NoteEditForm } from "@/features/note/components/NoteEditForm";

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  const result = await getNote(id);

  if (!result.success || !result.data) {
    redirect("/notes");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ノート編集</h1>
      <div className="max-w-4xl">
        <NoteEditForm note={result.data} />
      </div>
    </div>
  );
}
