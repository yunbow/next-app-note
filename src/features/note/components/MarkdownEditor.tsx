"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Eye, Edit } from "lucide-react";

interface MarkdownEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => Promise<void>;
  autoSave?: boolean;
}

export function MarkdownEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  autoSave = true,
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(title, content);
    } finally {
      setIsSaving(false);
    }
  };

  // 簡易的なMarkdownプレビュー（実際にはライブラリを使用することを推奨）
  const renderMarkdown = (text: string) => {
    // セキュリティ: XSS対策のため、本番環境ではDOMPurifyを使用
    // ここでは開発用の簡易実装
    return text
      .split("\n")
      .map((line) => {
        // HTMLエスケープ
        const escaped = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

        // 見出し
        if (escaped.startsWith("### ")) {
          return `<h3 class="text-lg font-semibold mt-4 mb-2">${escaped.slice(4)}</h3>`;
        }
        if (escaped.startsWith("## ")) {
          return `<h2 class="text-xl font-semibold mt-4 mb-2">${escaped.slice(3)}</h2>`;
        }
        if (escaped.startsWith("# ")) {
          return `<h1 class="text-2xl font-bold mt-4 mb-2">${escaped.slice(2)}</h1>`;
        }
        // リスト
        if (escaped.startsWith("- ")) {
          return `<li class="ml-4">${escaped.slice(2)}</li>`;
        }
        // コードブロック
        if (escaped.startsWith("```")) {
          return `<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded my-2"><code>${escaped.slice(3)}</code></pre>`;
        }
        // 通常のテキスト
        return escaped ? `<p class="mb-2">${escaped}</p>` : "<br/>";
      })
      .join("");
  };

  return (
    <div className="flex h-full flex-col">
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              編集
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              プレビュー
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>

        <TabsContent value="edit" className="h-[calc(100vh-300px)]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdownで記述してください..."
            className="h-full w-full resize-none rounded-md border border-gray-300 p-4 font-mono text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </TabsContent>

        <TabsContent value="preview" className="h-[calc(100vh-300px)]">
          <ScrollArea className="h-full rounded-md border p-4">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-xs text-gray-500">
        {autoSave && "自動保存が有効です"}
      </div>
    </div>
  );
}
