import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNote } from "@/features/note/server/actions";
import { getNoteShares } from "@/features/note/server/share-actions";
import { checkNoteWriteAccess } from "@/features/note/services/ownership";
import { NoteDetail } from "@/features/note/components/NoteDetail";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getNote(id);

  if (!result.success || !result.data) {
    redirect("/notes");
  }

  const isOwner = result.data.authorId === session.user.id;
  const [shares, canEdit] = await Promise.all([
    isOwner ? getNoteShares(id) : Promise.resolve([]),
    checkNoteWriteAccess(id, session.user.id),
  ]);

  return (
    <div className="max-w-4xl">
      <NoteDetail note={result.data} shares={shares} isOwner={isOwner} canEdit={canEdit} />
    </div>
  );
}
