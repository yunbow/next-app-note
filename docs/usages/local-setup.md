# ローカル環境構築手順

このドキュメントは本プロジェクト（Next.js + Prisma 製のメモアプリ）をローカルで開発するための手順をまとめたものです。

## 前提条件

以下のツールが事前にインストールされている必要があります。

| ツール  | 推奨バージョン | 備考                                          |
| ------- | -------------- | --------------------------------------------- |
| Node.js | 22.x           | `Dockerfile` で `node:22-alpine` を使用       |
| npm     | 10.x 以上      | Node.js 22 同梱版で OK                        |
| Git     | 任意           | サブモジュールを含むため `--recursive` で clone |

OS は Windows / macOS / Linux いずれでも動作します。Windows では Git Bash もしくは WSL の利用を推奨します。

## 1. リポジトリの取得

サブモジュール（`docs/ai-dev-os` 等）を含むので `--recursive` を付けて clone します。

```bash
git clone --recursive <repository-url>
cd next-app-note
```

すでに clone 済みの場合は次で取得できます。

```bash
git submodule update --init --recursive
```

## 2. 依存関係のインストール

```bash
npm ci
```

`postinstall` で `prisma generate` が自動実行され、Prisma Client が生成されます。

## 3. 環境変数の設定

`.env.example` を `.env.local` にコピーして必要な値を埋めます。

```bash
cp .env.example .env.local
```

最低限ローカル開発で必要な変数は以下です。

| キー              | ローカル設定例                          | 用途                              |
| ----------------- | --------------------------------------- | --------------------------------- |
| `NODE_ENV`        | `development`                           | 実行環境                          |
| `DATABASE_URL`    | `file:./dev.db`                         | SQLite ファイル（Prisma）         |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` で生成        | セッション暗号化キー              |
| `NEXTAUTH_URL`    | `http://localhost:3000`                 | アプリのベース URL                |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000`             | クライアント側で参照する URL      |

OAuth / SMTP は使う機能のみ設定すれば OK です（未設定でもアプリ自体は起動します）。

`NEXTAUTH_SECRET` の生成例:

```bash
openssl rand -base64 32
```

## 4. データベースの初期化

開発環境では SQLite (`prisma/dev.db`) を使います。マイグレーションを適用してスキーマを反映します。

```bash
npm run db:migrate:dev
```

スキーマだけ確認したい場合や、マイグレーションの状態を見るには次のコマンドが使えます。

```bash
npm run db:migrate:status
```

## 5. 開発サーバーの起動

```bash
npm run dev
```

起動後、ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 6. テストの実行

### ユニット / コンポーネントテスト（Vitest）

```bash
# watch モード
npm test

# 1 回だけ実行
npm run test:run

# カバレッジ
npm run test:coverage
```

対象は `src/**/*.{test,spec}.{ts,tsx}` です。

### E2E テスト（Playwright）

初回のみブラウザのインストールが必要です。

```bash
npx playwright install
```

実行は次のいずれかで行います。

```bash
# ヘッドレス実行
npm run test:e2e

# UI モード
npm run test:e2e:ui

# デバッグ実行
npm run test:e2e:debug
```

`playwright.config.ts` の `webServer` 設定により、E2E 実行時は自動的に `npm run dev` が起動します。

## 7. Lint / Format

```bash
# ESLint
npm run lint

# Prettier（書き込み）
npm run format

# Prettier（チェックのみ）
npm run format:check
```

## 8. Docker での起動（任意）

本番に近い構成で動かしたい場合は Dockerfile を使います。

```bash
docker build -t next-app-note .
docker run --rm -p 3000:3000 --env-file .env.local next-app-note
```

ヘルスチェックは `http://localhost:3000/api/health` に対して実行されます。

## トラブルシューティング

### `prisma generate` が失敗する

`node_modules` が壊れている可能性があります。一度削除して再インストールしてください。

```bash
rm -rf node_modules
npm ci
```

### Vitest で `expect is not defined` が出る

`vitest.config.ts` の `test.globals` が `true` になっているか、`tsconfig.json` の `types` に `"vitest/globals"` が含まれているかを確認してください。

### Playwright のテストが Vitest で実行されてしまう

`vitest.config.ts` の `exclude` に `tests/e2e/**` が含まれているか確認してください。

### ポート 3000 がすでに使われている

別ポートで起動できます。

```bash
PORT=3100 npm run dev
```

その場合は `.env.local` の `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` も合わせて変更してください。
