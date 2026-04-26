# テストカバレッジレポート

計測日: 2026-05-09  
コマンド: `npm run test:coverage` (`vitest run --coverage`, provider: v8)

---

## 実行結果サマリー

| 項目         | 結果                     |
| ------------ | ------------------------ |
| テストファイル | 1 passed (1)             |
| テスト数     | 21 passed (21)           |
| 実行時間     | 18.05s                   |
| カバレッジ対象ファイル | 1 ファイル（実行時インポート分のみ） |

## カバレッジ詳細

> `coverage.include` 未設定のため、テスト実行時に実際にインポートされたファイルのみが計上される。

| ファイル | Stmts | Branch | Funcs | Lines |
| -------- | ------: | ------: | -----: | -----: |
| `src/features/note/schema/note-schema.ts` | 100% | 100% | 100% | 100% |
| **合計** | **100% (5/5)** | **100% (0/0)** | **100% (0/0)** | **100% (5/5)** |

## テストファイル一覧

| ファイル | テスト数 | 内容 |
| -------- | -------: | ---- |
| `src/tests/features/note/note-schema.test.ts` | 21 | ノートスキーマ（Zod）バリデーション |

### テストケース内訳

| describe | テスト数 | 検証内容 |
| -------- | -------: | -------- |
| `CreateNoteSchema` | 7 | タイトル・コンテンツ・visibility のバリデーション |
| `UpdateNoteSchema` | 3 | 部分更新・id 必須チェック |
| `CreateNoteVersionSchema` | 3 | バージョン作成時のフィールド検証 |
| `CreateNoteShareSchema` | 5 | 共有権限・パスワード長チェック |
| `CreateNoteLinkSchema` | 3 | リンク元・リンク先ノート ID 検証 |

---

## 課題・補足

### カバレッジ対象が限定的な理由

`vitest.config.ts` に `coverage.include` が設定されていないため、v8 はテスト実行中に実際にロードされたファイルのみを計上する。  
現在テストが存在するのは note-schema のみで、Server Actions・コンポーネント・ライブラリ等はカバレッジ対象外となっている。

### 未テストの主要モジュール（抜粋）

- `src/features/note/server/actions.ts`（Server Actions）
- `src/features/auth/`（認証フロー）
- `src/features/billing/`（Stripe サブスクリプション）
- `src/features/category/`, `src/features/tag/`（CRUD アクション）
- `src/components/`（UI コンポーネント群）
- `src/lib/`（ユーティリティ・i18n・stripe クライアント等）

### 推奨アクション

1. `vitest.config.ts` に `coverage.include: ['src/**/*.{ts,tsx}']` と `coverage.exclude` を追加し、全ソースファイルを対象にする
2. Server Actions の統合テスト（DB モック or テスト用 DB）を追加する
3. カバレッジ閾値（`coverage.thresholds`）を設定し CI で品質ゲートとして機能させる

---

## 依存関係の変更

本計測のため以下パッケージをインストール済み:

```
@vitest/coverage-v8  (devDependencies)
```
