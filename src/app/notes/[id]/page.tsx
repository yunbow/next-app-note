import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNote } from "@/features/note/server/actions";
import { NoteDetail } from "@/features/note/components/NoteDetail";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
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
      <main className="container mx-auto px-4 py-8">
        <NoteDetail note={result.data} />
      </main>
    </div>
  );
}
