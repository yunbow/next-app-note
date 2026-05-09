/**
 * Y.js WebSocket server (Hocuspocus)
 *
 * 起動: npm run ws:dev
 * ポート: $WS_PORT (default 1234)
 *
 * - onLoadDocument : DB から content を読み込んで Y.Doc を初期化
 * - onStoreDocument: content が変わるたびに DB へ自動保存
 */
import { Server } from "@hocuspocus/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = parseInt(process.env.WS_PORT ?? "1234", 10);

const server = new Server({
  port: PORT,
  quiet: false,

  async onLoadDocument({ documentName, document }) {
    // documentName = "note-{noteId}"
    const noteId = documentName.replace(/^note-/, "");
    if (!noteId) return;

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { content: true },
    });
    if (!note) return;

    // Initialize the shared text with DB content (only if document is empty)
    const yText = document.getText("content");
    if (yText.length === 0 && note.content) {
      yText.insert(0, note.content);
    }
  },

  async onStoreDocument({ documentName, document }) {
    const noteId = documentName.replace(/^note-/, "");
    if (!noteId) return;

    const content = document.getText("content").toString();
    await prisma.note
      .update({ where: { id: noteId }, data: { content } })
      .catch(() => {
        // note が存在しない場合（削除済み）は無視
      });
  },

  async onDisconnect({ documentName, document, clientsCount }) {
    // 全員切断時に最終保存
    if (clientsCount === 0) {
      const noteId = documentName.replace(/^note-/, "");
      if (!noteId) return;
      const content = document.getText("content").toString();
      await prisma.note
        .update({ where: { id: noteId }, data: { content } })
        .catch(() => {});
    }
  },
});

server.listen().then(() => {
  console.log(`[ws-server] Hocuspocus listening on ws://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  await server.destroy();
  process.exit(0);
});
