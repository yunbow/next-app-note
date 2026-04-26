"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "./MarkdownEditor";
import { updateNote } from "../server/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";

interface NoteEditFormProps {
  note: any;
}

export function NoteEditForm({ note }: NoteEditFormProps) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(
    note.tags?.map((t: any) => t.tag.name) || [],
  );
  const [tagInput, setTagInput] = useState("");

  const handleSave = async (title: string, content: string) => {
    const result = await updateNote({
      id: note.id,
      title,
      content,
      tags,
    });

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
      <div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 space-y-2">
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

        <MarkdownEditor
          initialTitle={note.title}
          initialContent={note.content}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
