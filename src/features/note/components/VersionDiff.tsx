"use client";

import { diffLines } from "diff";
import { cn } from "@/lib/utils";

interface VersionDiffProps {
  oldContent: string;
  newContent: string;
  oldLabel?: string;
  newLabel?: string;
}

export function VersionDiff({ oldContent, newContent, oldLabel = "変更前", newLabel = "変更後" }: VersionDiffProps) {
  const parts = diffLines(oldContent, newContent);

  const hasChanges = parts.some((p) => p.added || p.removed);

  if (!hasChanges) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        差分はありません（内容が同一です）
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded border text-sm font-mono">
      {/* legend */}
      <div className="flex gap-4 border-b bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-100 dark:bg-red-950" />
          {oldLabel}（削除）
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-100 dark:bg-green-950" />
          {newLabel}（追加）
        </span>
      </div>

      <div className="divide-y">
        {parts.map((part, i) => {
          const lines = part.value.split("\n");
          // diffLines の最後の要素は末尾改行で空文字になることがある
          if (lines.at(-1) === "") lines.pop();

          return lines.map((line, j) => (
            <div
              key={`${i}-${j}`}
              className={cn(
                "flex items-start gap-2 px-3 py-0.5 leading-5",
                part.added && "bg-green-50 dark:bg-green-950/40",
                part.removed && "bg-red-50 dark:bg-red-950/40",
                !part.added && !part.removed && "bg-background",
              )}
            >
              <span
                className={cn(
                  "w-4 shrink-0 select-none text-center text-xs",
                  part.added && "text-green-600 dark:text-green-400",
                  part.removed && "text-red-600 dark:text-red-400",
                  !part.added && !part.removed && "text-muted-foreground",
                )}
              >
                {part.added ? "+" : part.removed ? "−" : " "}
              </span>
              <span
                className={cn(
                  "min-w-0 break-words whitespace-pre-wrap",
                  part.added && "text-green-800 dark:text-green-300",
                  part.removed && "text-red-800 dark:text-red-300",
                )}
              >
                {line || " "}
              </span>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
