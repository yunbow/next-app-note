"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CollaborativeEditor, type CollaborativeEditorHandle } from "./CollaborativeEditor";
import { updateNote } from "../server/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Tag, X } from "lucide-react";
import Link from "next/link";

interface NoteEditFormProps {
  note: {
    id: string;
    title: string;
    content: string;
    tags?: Array<{ tag: { name: string } }>;
  };
  currentUser: { id: string; name: string | null; email: string | null };
}

export function NoteEditForm({ note, currentUser }: NoteEditFormProps) {
  const router = useRouter();
  const editorRef = useRef<CollaborativeEditorHandle>(null);
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState<string[]>(
    note.tags?.map((t) => t.tag.name) || [],
  );
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const content = editorRef.current?.getContent() ?? note.content;
    const result = await updateNote({ id: note.id, title, content, tags });
    setIsSaving(false);

    if (result.success) {
      toast.success("ノートを更新しました");
      router.push(`/notes/${note.id}`);
    } else {
      toast.error(result.error || "更新に失敗しました");
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-6">
      <Link href={`/notes/${note.id}`}>
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </Link>

      <div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
        {/* Title */}
        <div className="mb-4 space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ノートのタイトルを入力..."
            className="text-lg font-semibold"
          />
        </div>

        {/* Tags */}
        <div className="mb-6 space-y-2">
          <Label htmlFor="tags">タグ</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="タグを入力してEnter"
            />
            <Button type="button" onClick={addTag}>
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collaborative editor */}
        <div className="space-y-2">
          <Label>内容（リアルタイム共同編集）</Label>
          <CollaborativeEditor
            ref={editorRef}
            noteId={note.id}
            initialContent={note.content}
            currentUser={currentUser}
          />
        </div>

        {/* Save */}
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
