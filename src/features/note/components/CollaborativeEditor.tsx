"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { keymap } from "@codemirror/view";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:1234";
const SYNC_TIMEOUT_MS = 4000;

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
}

export interface CollaborativeEditorHandle {
  getContent: () => string;
}

interface OnlineUser {
  name: string;
  color: string;
}

type EditorMode = "loading" | "ready" | "fallback";

interface CollaborativeEditorProps {
  noteId: string;
  initialContent: string;
  currentUser: { id: string; name: string | null; email: string | null };
}

export const CollaborativeEditor = forwardRef<
  CollaborativeEditorHandle,
  CollaborativeEditorProps
>(function CollaborativeEditor({ noteId, initialContent, currentUser }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const fallbackContentRef = useRef(initialContent);

  const [mode, setMode] = useState<EditorMode>("loading");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (viewRef.current) {
        return ydocRef.current?.getText("content").toString() ?? fallbackContentRef.current;
      }
      return fallbackContentRef.current;
    },
  }));

  // Phase 1: Y.Doc + WebSocket 接続
  // setTimeout(fn, 0) で接続を遅延させることで React StrictMode の
  // 二重 Effect 実行時に "closed before established" エラーが出ないようにする。
  // クリーンアップがタイマーより先に走った場合は接続自体をキャンセルする。
  useEffect(() => {
    type Session = {
      ydoc: Y.Doc;
      provider: WebsocketProvider;
      updateUsers: () => void;
      syncTimeout: ReturnType<typeof setTimeout>;
    };
    let session: Session | null = null;

    const connectTimer = setTimeout(() => {
      const ydoc = new Y.Doc();
      const yText = ydoc.getText("content");
      ydocRef.current = ydoc;

      const provider = new WebsocketProvider(WS_URL, `note-${noteId}`, ydoc);
      providerRef.current = provider;

      provider.awareness.setLocalStateField("user", {
        name: currentUser.name || currentUser.email || "Anonymous",
        color: getUserColor(currentUser.id),
      });

      const updateUsers = () => {
        const users: OnlineUser[] = [];
        provider.awareness.getStates().forEach((state) => {
          if (state.user) users.push(state.user as OnlineUser);
        });
        setOnlineUsers(users);
      };
      provider.awareness.on("change", updateUsers);

      const syncTimeout = setTimeout(() => {
        setMode((prev) => (prev === "loading" ? "fallback" : prev));
      }, SYNC_TIMEOUT_MS);

      provider.on("sync", (isSynced: boolean) => {
        if (!isSynced) return;
        clearTimeout(syncTimeout);

        if (yText.length === 0 && initialContent) {
          ydoc.transact(() => {
            yText.insert(0, initialContent);
          });
        }

        setMode("ready");
      });

      session = { ydoc, provider, updateUsers, syncTimeout };
    }, 0);

    return () => {
      clearTimeout(connectTimer);
      if (session) {
        clearTimeout(session.syncTimeout);
        session.provider.awareness.off("change", session.updateUsers);
        session.provider.destroy();
        session.ydoc.destroy();
      }
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // Phase 2: sync 完了後に CodeMirror をマウント
  useEffect(() => {
    if (mode !== "ready") return;
    if (!containerRef.current || !ydocRef.current || !providerRef.current) return;
    if (viewRef.current) return;

    const yText = ydocRef.current.getText("content");
    const undoManager = new Y.UndoManager(yText);

    viewRef.current = new EditorView({
      extensions: [
        basicSetup,
        markdown(),
        yCollab(yText, providerRef.current.awareness, { undoManager }),
        keymap.of(yUndoManagerKeymap),
        EditorView.theme({
          "&": { height: "calc(100vh - 360px)", minHeight: "400px" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { fontFamily: "ui-monospace, monospace", fontSize: "14px" },
        }),
      ],
      parent: containerRef.current,
    });
  }, [mode]);

  return (
    <div className="space-y-2">
      {/* 接続中: initialContent をプレビュー表示 */}
      {mode === "loading" && (
        <div className="relative overflow-hidden rounded-md border border-input">
          <textarea
            readOnly
            value={initialContent}
            className="min-h-[400px] w-full resize-none bg-transparent p-4 font-mono text-sm opacity-40"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow">
              WebSocket に接続中...
            </span>
          </div>
        </div>
      )}

      {/* フォールバック: WS なし textarea */}
      {mode === "fallback" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
            <span>⚠</span>
            <span>
              WebSocket サーバーに接続できません（<code>npm run ws:dev</code>{" "}
              で起動）。リアルタイム同期なしで編集できます。
            </span>
          </div>
          <textarea
            defaultValue={initialContent}
            onChange={(e) => {
              fallbackContentRef.current = e.target.value;
            }}
            className="min-h-[400px] w-full resize-none rounded-md border border-input bg-transparent p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* 協調編集モード: プレゼンスバー */}
      {mode === "ready" && onlineUsers.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>オンライン:</span>
          <div className="flex gap-1">
            {onlineUsers.map((u, i) => (
              <span
                key={i}
                title={u.name}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: u.color }}
              >
                {u.name.charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 協調編集モード: CodeMirror コンテナ */}
      <div
        ref={containerRef}
        className={
          mode === "ready"
            ? "overflow-hidden rounded-md border border-input"
            : "hidden"
        }
      />
    </div>
  );
});
