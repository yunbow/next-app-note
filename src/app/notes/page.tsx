import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotes } from "@/features/note/server/actions";
import { NoteList } from "@/features/note/components/NoteList";

export default async function NotesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const result = await getNotes();
  const notes = result.success && result.data ? result.data : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">マイノート</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user?.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NoteList notes={notes} />
      </main>
    </div>
  );
}
