import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NoteEditor } from "@/features/note/components/NoteEditor";

export default async function NewNotePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">新規ノート作成</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <NoteEditor />
        </div>
      </main>
    </div>
  );
}
