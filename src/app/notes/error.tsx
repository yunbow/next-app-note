"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログをサーバーに送信（本番環境ではSentry等を使用）
    console.error("Notes page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[400px] items-center justify-center p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950">
        <div className="mb-4 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
            ノートの読み込みに失敗しました
          </h2>
        </div>
        <p className="mb-6 text-sm text-red-800 dark:text-red-200">
          申し訳ございません。ノート一覧の読み込み中にエラーが発生しました。
        </p>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
          >
            再試行
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="ghost"
            className="text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
