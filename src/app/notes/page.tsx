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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">マイノート</h1>
      <NoteList notes={notes} />
    </div>
  );
}
