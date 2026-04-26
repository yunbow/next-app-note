# Note

Markdown ベースのメモ管理アプリケーションです。ノートの作成・編集・共有、タグ／カテゴリによる分類、バージョン履歴、ノート間リンク、テンプレートなどの機能を備えます。

## 技術スタック

| 領域            | 採用技術                                                  |
| --------------- | --------------------------------------------------------- |
| フレームワーク  | Next.js 16 (App Router) / React 19                        |
| 言語            | TypeScript                                                |
| スタイル        | Tailwind CSS v4 / shadcn/ui / Radix UI                    |
| 状態管理／取得  | TanStack Query / React Hook Form + Zod                    |
| 認証            | NextAuth.js v5 (Google / GitHub / Credentials)            |
| データベース    | Prisma 6 + SQLite（開発）/ PostgreSQL（本番想定）         |
| メール          | Nodemailer (SMTP)                                         |
| ロギング        | pino                                                      |
| テスト          | Vitest + Testing Library / Playwright                     |
| Lint / Format   | ESLint / Prettier                                         |
| コンテナ        | Docker (Node 22 alpine, multi-stage)                      |

## 主な機能

- Markdown でのノート作成・編集（DOMPurify によるサニタイズ）
- タグ／カテゴリによる分類
- ノートの共有（プライベート／共有／公開、パスワード保護、有効期限）
- ノート間リンク
- バージョン履歴
- テンプレート（meeting / specification など）
- ユーザー認証・設定
- ダーク／ライトテーマ切り替え（next-themes）

## ディレクトリ構成（抜粋）

```
.
├── prisma/              # Prisma schema / migrations
├── src/
│   ├── app/             # App Router（routes / layouts）
│   ├── components/      # 共通 UI コンポーネント
│   ├── features/        # ドメイン別機能（auth, note, tag, category, user, settings）
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
cp .env.example .env.local
# NEXTAUTH_SECRET は openssl rand -base64 32 などで生成してください

# DB マイグレーション（SQLite: prisma/dev.db）
npm run db:migrate:dev

# 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

詳細な手順・トラブルシューティングは [`docs/usages/local-setup.md`](docs/usages/local-setup.md) を参照してください。

## npm scripts

| コマンド                    | 内容                                          |
| --------------------------- | --------------------------------------------- |
| `npm run dev`               | 開発サーバー起動                              |
| `npm run build`             | 本番ビルド                                    |
| `npm start`                 | 本番サーバー起動                              |
| `npm run lint`              | ESLint                                        |
| `npm run format`            | Prettier 書き込み                             |
| `npm run format:check`      | Prettier チェックのみ                         |
| `npm test`                  | Vitest（watch モード）                        |
| `npm run test:run`          | Vitest（1 回実行）                            |
| `npm run test:coverage`     | Vitest（カバレッジ）                          |
| `npm run test:e2e`          | Playwright E2E                                |
| `npm run test:e2e:ui`       | Playwright UI モード                          |
| `npm run test:e2e:debug`    | Playwright デバッグモード                     |
| `npm run analyze`           | バンドルサイズ解析（`@next/bundle-analyzer`） |
| `npm run db:migrate:dev`    | Prisma マイグレーション（開発）               |
| `npm run db:migrate:deploy` | Prisma マイグレーション（本番）               |
| `npm run db:migrate:status` | マイグレーションの状態確認                    |

## 環境変数

`.env.example` を参照してください。最低限ローカル開発で必要なものは以下です。

- `NODE_ENV`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

OAuth (Google / GitHub) と SMTP は使う機能のみ設定すれば動作します。

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
docker run --rm -p 3000:3000 --env-file .env.local next-app-note
```

ヘルスチェックは `/api/health` で行われます。

## ライセンス

[MIT License](LICENSE)
