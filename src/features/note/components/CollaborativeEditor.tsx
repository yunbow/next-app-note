"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { keymap } from "@codemirror/view";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:1234";

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
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [synced, setSynced] = useState(false);

  useImperativeHandle(ref, () => ({
    getContent: () => ydocRef.current?.getText("content").toString() ?? "",
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const ydoc = new Y.Doc();
    const yText = ydoc.getText("content");
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(WS_URL, `note-${noteId}`, ydoc);

    const color = getUserColor(currentUser.id);
    const name = currentUser.name || currentUser.email || "Anonymous";
    provider.awareness.setLocalStateField("user", { name, color });

    const updateUsers = () => {
      const users: OnlineUser[] = [];
      provider.awareness.getStates().forEach((state) => {
        if (state.user) users.push(state.user as OnlineUser);
      });
      setOnlineUsers(users);
    };
    provider.awareness.on("change", updateUsers);

    provider.on("sync", (isSynced: boolean) => {
      setSynced(isSynced);
      // If server has no content yet, seed with initialContent
      if (isSynced && yText.length === 0 && initialContent) {
        ydoc.transact(() => {
          yText.insert(0, initialContent);
        });
      }
    });

    const undoManager = new Y.UndoManager(yText);

    const view = new EditorView({
      extensions: [
        basicSetup,
        markdown(),
        yCollab(yText, provider.awareness, { undoManager }),
        keymap.of(yUndoManagerKeymap),
        EditorView.theme({
          "&": { height: "calc(100vh - 360px)", minHeight: "400px" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { fontFamily: "ui-monospace, monospace", fontSize: "14px" },
        }),
      ],
      parent: containerRef.current,
    });

    return () => {
      provider.awareness.off("change", updateUsers);
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  return (
    <div className="space-y-2">
      {/* Presence bar */}
      {onlineUsers.length > 0 && (
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
          {!synced && (
            <span className="ml-2 text-yellow-500">同期中...</span>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="overflow-hidden rounded-md border border-input"
      />
    </div>
  );
});
