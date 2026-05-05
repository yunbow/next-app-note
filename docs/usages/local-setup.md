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

---

## PostgreSQL 構築・運用手順

このプロジェクトは独立した PostgreSQL コンテナを `docker-compose.yml` で持つ設計です。本プロジェクトの DB は **ホスト側ポート `54332`** で公開されます (他の `next-app-*` プロジェクトとは衝突しないよう個別に割り当て済み)。

### 前提

- **Docker Desktop** が起動していること (`docker version` が通る)
- `.env` に `DATABASE_URL` が入っていること
- `npm install` 完了

### 1. PostgreSQL コンテナを起動

プロジェクトのルートで:

```powershell
docker compose up -d
```

- `-d` でバックグラウンド起動
- 初回はイメージ pull で 1〜2 分かかる
- 2 回目以降は数秒で立ち上がる

起動確認:

```powershell
docker compose ps
```

`STATUS` 列が `Up (healthy)` になっていれば OK (compose の healthcheck で `pg_isready` を見ている)。`(starting)` の間は接続失敗するので、healthy になるまで数秒待つ。

### 2. マイグレーション適用

スキーマを DB に反映 (初回 = テーブル作成、2 回目以降 = 差分適用):

```powershell
npm run db:migrate:dev
```

新しい migration を生成したいときは `--name` を渡す:

```powershell
npm run db:migrate:dev -- --name <name>
```

CI / 本番系では対話処理を伴わない deploy 系を使う:

```powershell
npm run db:migrate:deploy
```

### 3. SEED 投入 (任意)

開発用テストデータを投入:

```powershell
npm run db:seed:dev
```

冪等なので何度実行しても重複しません。

投入されるテストデータの詳細は「[開発用テストデータ](#開発用テストデータ)」を参照してください。

### 4. アプリ起動

```powershell
npm run dev
```

`http://localhost:3000` にアクセスして動作確認。

### 5. データ確認・操作

GUI で中身を見たい場合:

```powershell
npm run prisma:studio
```

`http://localhost:5555` で Prisma Studio が開きます。

CLI で直接 psql に入りたい場合:

```powershell
docker compose exec db psql -U app -d app
```

### ライフサイクル運用

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 停止 (データ保持) | `docker compose stop` | 次回 `start` で即復帰 |
| 再開 | `docker compose start` | |
| 完全停止＋コンテナ削除 | `docker compose down` | ボリュームは残る |
| **DB を完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ追跡 | `docker compose logs -f db` | エラー調査時 |

ハマったときの定番リセット手順:

```powershell
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

### 複数プロジェクトを同時に起動する場合

`docker-compose.yml` の `name:` フィールドが各プロジェクトで異なるため、コンテナは独立して並走できます。ホスト側ポートも 54321〜54342 で固有割当なので衝突しません。

すべて起動するとメモリ消費が積み上がるので、使わないものは `docker compose stop` しておくのが無難です。

全プロジェクトの DB を一覧:

```powershell
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

---

## 開発用テストデータ

`npm run db:seed:dev` で投入されるデータの一覧です。

### 開発用ログインアカウント

| ユーザー | メールアドレス | パスワード |
| -------- | -------------- | ---------- |
| Alice    | alice@example.com | `password123` |
| Bob      | bob@example.com   | `password123` |

### 投入されるコンテンツ

| ユーザー | ノートタイトル | 公開設定 | タグ | カテゴリ |
| -------- | -------------- | -------- | ---- | -------- |
| Alice | Next.js App Router の基礎 | public | TypeScript, Next.js | 技術 |
| Alice | Prisma ORM メモ | private | TypeScript, Prisma | 技術 |
| Alice | 今日の日記 | private | メモ | 日記 |
| Bob | React Hooks チートシート | public | TypeScript, React | 技術 |
| Bob | アイデアメモ: ダークモード対応 | private | メモ, TODO | アイデア |
| Bob | TypeScript Tips | shared | TypeScript | 技術 |

### マスタデータ（prod/dev 共通）

- **カテゴリ**: 技術 / 日記 / アイデア / プロジェクト
- **タグ**: TypeScript / Next.js / React / Prisma / メモ / TODO

### SEED スクリプト一覧

| コマンド | SEED_MODE | 説明 |
| -------- | --------- | ---- |
| `npm run db:seed` | 自動判定 | `NODE_ENV=development` → dev、それ以外 → prod |
| `npm run db:seed:dev` | dev | ユーザー・ノート・マスタデータを投入 |
| `npm run db:seed:prod` | prod | マスタデータのみ投入 |
| `npx prisma db seed` | 自動判定 | `NODE_ENV` で振り分け（上と同様） |

> **安全装置**: `NODE_ENV=production` かつ `SEED_MODE=dev` の組み合わせは起動時エラーになります。本番環境への誤投入を防ぎます。

### トラブルシューティング

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| `port is already allocated` | 該当ポートが他のサービスで使用中 | `docker compose down`、または `netstat -ano \| Select-String "54332"` で犯人を特定 |
| `P1001: Can't reach database server` | コンテナがまだ healthy でない、もしくは `.env` の `DATABASE_URL` のポートと `docker-compose.yml` の publish ポートが不一致 | healthcheck 完了を待つ / `.env` を確認 |
| マイグレーションが破綻 | dev 環境で発生する典型 | `docker compose down -v` で DB をリセットしてから `npm run db:migrate:dev` |
