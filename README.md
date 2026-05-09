# Note

Markdown ベースのメモ管理アプリケーションです。ノートの作成・編集・共有、タグ／カテゴリによる分類、バージョン履歴、ノート間リンク、テンプレート、フォロー機能、サブスクリプション課金などの機能を備えます。

## 技術スタック

| 領域              | 採用技術                                                        |
| ----------------- | --------------------------------------------------------------- |
| フレームワーク    | Next.js 16 (App Router) / React 19                              |
| 言語              | TypeScript                                                      |
| スタイル          | Tailwind CSS v4 / shadcn/ui / Radix UI                          |
| 状態管理／取得    | TanStack Query / React Hook Form + Zod                          |
| 認証              | Auth.js v5 (Google / GitHub / Credentials)                      |
| データベース      | Prisma 6 + PostgreSQL                                           |
| リアルタイム同期  | Y.js (CRDT) + Hocuspocus WebSocket サーバー / y-codemirror.next |
| エディタ          | CodeMirror 6 + @codemirror/lang-markdown                        |
| ストレージ        | Cloudflare R2 / MinIO（ローカル）                               |
| 決済              | Stripe v20 / stripe-mock（ローカル）                            |
| メール            | Nodemailer (SMTP)                                               |
| ロギング          | pino                                                            |
| テスト            | Vitest + Testing Library / Playwright                           |
| Lint / Format     | ESLint 9 (flat config) / Prettier                               |
| コンテナ          | Docker (Node 22 alpine, multi-stage)                            |

## 主な機能

- **リアルタイム共同編集** — 複数ユーザーが同一ノートを同時編集。Y.js CRDT で競合なくマージ
- **プレゼンス表示** — 編集中のユーザーをカラーアバターでリアルタイム表示
- Markdown でのノート作成・編集（DOMPurify によるサニタイズ）
- タグ／カテゴリによる分類・ページネーション付き一覧表示
- ノートの共有（プライベート／共有／公開、ユーザー指定、パスワード保護、有効期限）
- ノート間リンク・バックリンク
- バージョン履歴（差分表示・復元）
- テンプレート（meeting / specification など）
- フォロー／フォロワー機能
- サブスクリプション課金（Free / Basic / Premium プラン）
- 画像アップロード（R2 / MinIO）
- ユーザー認証・プロフィール設定
- 多言語対応（日本語 / English）
- ダーク／ライトテーマ切り替え（next-themes）
- Cookie 同意バナー
- CSP（Content Security Policy）ヘッダー

## ディレクトリ構成（抜粋）

```
.
├── ws-server.ts         # Y.js WebSocket サーバー（Hocuspocus）
├── prisma/              # Prisma schema / migrations / seed
├── scripts/             # 静的アセットアップロードなど運用スクリプト
├── src/
│   ├── app/             # App Router（routes / layouts）
│   ├── components/      # 共通 UI コンポーネント
│   ├── features/        # ドメイン別機能
│   │   ├── auth/        # 認証
│   │   ├── billing/     # Stripe 課金・サブスクリプション
│   │   ├── category/    # カテゴリ（フォルダ）
│   │   ├── follow/      # フォロー機能
│   │   ├── note/        # ノート CRUD・共有・リンク・共同編集
│   │   ├── settings/    # ユーザー設定
│   │   ├── tag/         # タグ
│   │   └── user/        # ユーザープロフィール
│   ├── hooks/           # 共通 React hooks
│   ├── lib/             # ユーティリティ・サーバ初期化
│   ├── tests/           # Vitest setup
│   └── types/           # 共通型定義
├── tests/e2e/           # Playwright E2E テスト
├── docs/                # ドキュメント
└── Dockerfile
```

## クイックスタート

```bash
# 依存インストール（postinstall で prisma generate が走ります）
npm ci

# 環境変数
cp .env.example .env
# AUTH_SECRET は openssl rand -base64 48 などで生成してください

# Docker サービス起動（PostgreSQL / MinIO / stripe-mock）
docker compose up -d

# DB マイグレーション
npm run db:migrate:dev

# 開発サーバー起動（Next.js のみ）
npm run dev

# リアルタイム共同編集を使う場合は両サーバーを同時起動
npm run dev:collab
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

詳細な手順・トラブルシューティングは [`docs/usages/local-setup.md`](docs/usages/local-setup.md) を参照してください。

## npm scripts

| コマンド                    | 内容                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `npm run dev`               | Next.js 開発サーバー起動（port 3000）                      |
| `npm run ws:dev`            | Y.js WebSocket サーバー起動（port 1234）                   |
| `npm run dev:collab`        | Next.js + WebSocket サーバーを同時起動（共同編集フル動作） |
| `npm run build`             | 本番ビルド                                                 |
| `npm start`                 | 本番サーバー起動                                           |
| `npm run type-check`        | TypeScript 型チェック（tsc --noEmit）                      |
| `npm run lint`              | ESLint                                                     |
| `npm run format`            | Prettier 書き込み                                          |
| `npm run format:check`      | Prettier チェックのみ                                      |
| `npm test`                  | Vitest（watch モード）                                     |
| `npm run test:unit`         | Vitest（1 回実行）                                         |
| `npm run test:run`          | Vitest（1 回実行、別名）                                   |
| `npm run test:integration`  | Vitest（integration テストのみ）                           |
| `npm run test:coverage`     | Vitest（カバレッジ）                                       |
| `npm run test:e2e`          | Playwright E2E                                             |
| `npm run test:e2e:ui`       | Playwright UI モード                                       |
| `npm run test:e2e:debug`    | Playwright デバッグモード                                  |
| `npm run analyze`           | バンドルサイズ解析（`@next/bundle-analyzer`）              |
| `npm run db:migrate:dev`    | Prisma マイグレーション（開発）                            |
| `npm run db:migrate:deploy` | Prisma マイグレーション（本番）                            |
| `npm run db:migrate:status` | マイグレーションの状態確認                                 |
| `npm run db:seed:dev`       | 開発用テストデータ投入                                     |
| `npm run db:seed:prod`      | マスタデータ（カテゴリ・タグ）のみ投入                     |
| `npm run prisma:studio`     | Prisma Studio 起動（port 5555）                            |
| `npm run upload:static`     | 静的画像を R2 / MinIO へアップロード                       |

## 環境変数

`.env.example` を参照してください。最低限ローカル開発で必要なものは以下です。

| 変数                          | 説明                                                              |
| ----------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL 接続文字列                                             |
| `AUTH_SECRET`                 | セッション暗号化キー（32 文字以上、`openssl rand -base64 48` で生成） |
| `AUTH_URL`                    | アプリのベース URL（開発: `http://localhost:3000`）                |
| `NEXT_PUBLIC_APP_URL`         | 公開 URL（OG 画像・sitemap に使用）                               |
| `NEXT_PUBLIC_WS_URL`          | Y.js WebSocket サーバー URL（開発: `ws://localhost:1234`）        |

OAuth (Google / GitHub)・SMTP・Stripe・R2 は使う機能のみ設定すれば動作します。

## テスト

- ユニット／コンポーネントテスト: `src/**/*.{test,spec}.{ts,tsx}` を Vitest（jsdom 環境）で実行
- E2E テスト: `tests/e2e/**` を Playwright で実行（実行時に dev server を自動起動）

初回のみ Playwright のブラウザインストールが必要です。

```bash
npx playwright install
```

## Docker

```bash
docker build -t next-app-note .
docker run --rm -p 3000:3000 --env-file .env next-app-note
```

ヘルスチェックは `/api/health` で行われます。

## ライセンス

[MIT License](LICENSE)
