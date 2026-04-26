"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Search, Plus, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

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
  allTags: string[];
  currentTag: string;
  currentQ: string;
  currentPage: number;
  totalPages: number;
}

export function NoteList({ notes, allTags, currentTag, currentQ, currentPage, totalPages }: NoteListProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(currentQ);

  const buildHref = (q: string, tag: string, page?: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (page && page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/notes${qs ? `?${qs}` : ""}`;
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(buildHref(inputValue, currentTag));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ノートを検索... (Enterで検索)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearchKey}
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
          <Link href={buildHref(currentQ, "")}>
            <Button variant={!currentTag ? "default" : "outline"} size="sm">
              すべて
            </Button>
          </Link>
          {allTags.map((tag) => (
            <Link key={tag} href={buildHref(currentQ, tag)}>
              <Button
                variant={currentTag === tag ? "default" : "outline"}
                size="sm"
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Button>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
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

      {notes.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {currentQ || currentTag
            ? "該当するノートが見つかりません"
            : "ノートがありません。新規作成してください。"}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        createHref={(page) => buildHref(currentQ, currentTag, page)}
      />
    </div>
  );
}
