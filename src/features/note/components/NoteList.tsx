"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Search, Plus, Tag, Folder } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ tag: { name: string } }>;
  categories: Array<{ category: { name: string } }>;
}

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // タグ一覧を取得
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags.map((t) => t.tag.name))),
  );

  // フィルタリング
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      !selectedTag || note.tags.some((t) => t.tag.name === selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ノートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/notes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規ノート
          </Button>
        </Link>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            すべて
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block rounded-lg border bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
          >
            <h3 className="mb-2 text-lg font-semibold">{note.title}</h3>
            <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
              {note.content.substring(0, 150)}
            </p>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((t) => (
                <span
                  key={t.tag.name}
                  className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              {formatDistanceToNow(new Date(note.updatedAt), {
                addSuffix: true,
                locale: ja,
              })}
            </div>
          </Link>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {searchQuery || selectedTag
            ? "該当するノートが見つかりません"
            : "ノートがありません。新規作成してください。"}
        </div>
      )}
    </div>
  );
}
