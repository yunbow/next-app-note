# ローカル環境構築手順

Next.js + Prisma + PostgreSQL + MinIO 構成のメモアプリをローカルで動かすための手順です。

---

## 前提条件

| ツール | 推奨バージョン | 備考 |
| --- | --- | --- |
| Node.js | 22.x | `Dockerfile` で `node:22-alpine` を使用 |
| npm | 10.x 以上 | Node.js 22 同梱版で OK |
| Docker Desktop | 最新版 | PostgreSQL / MinIO コンテナに使用 |
| Git | 任意 | サブモジュールを含むため `--recursive` で clone |

---

## セットアップ

### 1. リポジトリの取得

```bash
git clone --recursive <repository-url>
cd next-app-note
```

clone 済みでサブモジュールが空の場合:

```bash
git submodule update --init --recursive
```

### 2. 依存関係のインストール

```bash
npm ci
```

`postinstall` で `prisma generate` が自動実行されます。

### 3. Docker サービスの起動

PostgreSQL と MinIO をバックグラウンドで起動します。

```bash
docker compose up -d
```

起動確認:

```bash
docker compose ps
```

`STATUS` が `Up (healthy)` になるまで数秒待ちます。`minio-init` コンテナが自動で `app-note` バケットを作成します。

| サービス | ホストポート | 用途 |
| --- | --- | --- |
| PostgreSQL | 54332 | アプリの DB |
| MinIO S3 API | 9002 | 画像アップロード先 |
| MinIO コンソール | 9003 | ストレージ管理 UI |

### 4. 環境変数の設定

```bash
cp .env.example .env
```

**必須項目:**

| キー | ローカル設定例 | 用途 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://app:app@localhost:54332/app?schema=public` | DB 接続文字列 |
| `AUTH_SECRET` | `openssl rand -base64 48` で生成 | セッション暗号化キー（32 文字以上） |
| `AUTH_URL` | `http://localhost:3000` | アプリのベース URL |

**ストレージ（R2 / MinIO）:**

| キー | ローカル設定例 | 用途 |
| --- | --- | --- |
| `R2_ACCESS_KEY_ID` | `minioadmin` | MinIO ルートユーザー |
| `R2_SECRET_ACCESS_KEY` | `minioadmin` | MinIO ルートパスワード |
| `R2_BUCKET_NAME` | `app-note` | バケット名 |
| `R2_ENDPOINT` | `http://localhost:9002` | MinIO エンドポイント |
| `R2_PUBLIC_URL` | `http://localhost:9002/app-note` | 画像の公開 URL プレフィックス |

OAuth / SMTP は使う機能のみ設定すれば OK です（未設定でも起動します）。

`AUTH_SECRET` の生成:

```bash
openssl rand -base64 48
```

### 5. DB マイグレーション

```bash
npm run db:migrate:dev
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて動作確認します。

---

## 主要コマンド

### テスト

```bash
# ウォッチモード
npm test

# 1 回実行
npm run test:run

# カバレッジ
npm run test:coverage
```

### E2E テスト（Playwright）

初回のみブラウザをインストール:

```bash
npx playwright install
```

```bash
npm run test:e2e          # ヘッドレス
npm run test:e2e:ui       # UI モード
npm run test:e2e:debug    # デバッグ
```

### Lint / Format

```bash
npm run lint              # ESLint
npm run format            # Prettier（書き込み）
npm run format:check      # Prettier（チェックのみ）
```

### DB 操作

```bash
npm run db:migrate:dev    # マイグレーション適用（開発）
npm run db:migrate:deploy # マイグレーション適用（本番 CI 用）
npm run db:migrate:status # マイグレーション状態確認
npm run db:seed:dev       # 開発用テストデータ投入
npm run prisma:studio     # Prisma Studio を http://localhost:5555 で起動
```

psql で直接操作:

```bash
docker compose exec db psql -U app -d app
```

---

## 開発用テストデータ

`npm run db:seed:dev` で以下のデータが投入されます。

### ログインアカウント

| ユーザー | メールアドレス | パスワード |
| --- | --- | --- |
| Alice | alice@example.com | `password123` |
| Bob | bob@example.com | `password123` |

### ノートデータ

| ユーザー | タイトル | 公開設定 |
| --- | --- | --- |
| Alice | Next.js App Router の基礎 | public |
| Alice | Prisma ORM メモ | private |
| Alice | 今日の日記 | private |
| Bob | React Hooks チートシート | public |
| Bob | アイデアメモ: ダークモード対応 | private |
| Bob | TypeScript Tips | shared |

### SEED モード

| コマンド | 内容 |
| --- | --- |
| `npm run db:seed:dev` | ユーザー・ノート・マスタデータを投入 |
| `npm run db:seed:prod` | マスタデータ（カテゴリ・タグ）のみ投入 |

> `NODE_ENV=production` かつ `SEED_MODE=dev` の組み合わせは起動時エラーになります（本番への誤投入防止）。

---

## Docker ライフサイクル

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 起動 | `docker compose up -d` | |
| 停止（データ保持） | `docker compose stop` | |
| 再開 | `docker compose start` | |
| 停止＋コンテナ削除 | `docker compose down` | ボリュームは残る |
| **完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ確認 | `docker compose logs -f` | |

DB を完全リセットして再構築する場合:

```bash
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

### 複数プロジェクトの同時起動

`docker-compose.yml` の `name:` フィールドとポートが各プロジェクト固有のため、そのまま並走できます。

```bash
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

---

## トラブルシューティング

### `prisma generate` が失敗する

`node_modules` を削除して再インストールします。

```bash
rm -rf node_modules
npm ci
```

### `P1001: Can't reach database server`

- `docker compose ps` で DB コンテナが `healthy` になっているか確認
- `.env` の `DATABASE_URL` のポートが `54332` になっているか確認

### 画像アップロードが 503 になる

R2 / MinIO の環境変数が未設定の場合に発生します。`.env` の `R2_*` 変数をすべて設定してください。MinIO が起動していない場合は `docker compose up -d` で起動します。

### ポート競合

```bash
# 別ポートで起動
PORT=3100 npm run dev
```

その場合は `.env` の `AUTH_URL` / `NEXT_PUBLIC_APP_URL` も合わせて変更してください。

### Playwright のテストが Vitest で実行されてしまう

`vitest.config.ts` の `exclude` に `tests/e2e/**` が含まれているか確認してください。
