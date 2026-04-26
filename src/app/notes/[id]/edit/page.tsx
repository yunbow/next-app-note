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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">ノート編集</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <NoteEditForm note={result.data} />
        </div>
      </main>
    </div>
  );
}
