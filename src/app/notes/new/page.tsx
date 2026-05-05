import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NoteEditor } from "@/features/note/components/NoteEditor";

export default async function NewNotePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新規ノート作成</h1>
      <div className="max-w-4xl">
        <NoteEditor />
      </div>
    </div>
  );
}
