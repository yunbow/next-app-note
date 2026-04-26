import { z } from "zod";

// カスタムエラーメッセージ
const errorMessages = {
  required: "この項目は必須です",
  tooShort: (min: number) => `${min}文字以上で入力してください`,
  tooLong: (max: number) => `${max}文字以内で入力してください`,
  invalidFormat: "形式が正しくありません",
};

// ノート作成スキーマ
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, errorMessages.tooLong(200))
    .trim(),
  content: z
    .string()
    .max(100000, errorMessages.tooLong(100000)),
  visibility: z
    .enum(["private", "shared", "public"])
    .default("private"),
  tags: z
    .array(
      z
        .string()
        .min(1, "タグは1文字以上で入力してください")
        .max(50, errorMessages.tooLong(50))
        .trim()
    )
    .max(10, "タグは10個まで設定できます")
    .optional(),
  categories: z
    .array(
      z
        .string()
        .min(1, "カテゴリは1文字以上で入力してください")
        .max(50, errorMessages.tooLong(50))
        .trim()
    )
    .max(5, "カテゴリは5個まで設定できます")
    .optional(),
});

// ノート更新スキーマ
export const updateNoteSchema = z.object({
  id: z.string().cuid("無効なノートIDです"),
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, errorMessages.tooLong(200))
    .trim()
    .optional(),
  content: z.string().max(100000, errorMessages.tooLong(100000)).optional(),
  visibility: z
    .enum(["private", "shared", "public"])
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, "タグは1文字以上で入力してください")
        .max(50, errorMessages.tooLong(50))
        .trim()
    )
    .max(10, "タグは10個まで設定できます")
    .optional(),
  categories: z
    .array(
      z
        .string()
        .min(1, "カテゴリは1文字以上で入力してください")
        .max(50, errorMessages.tooLong(50))
        .trim()
    )
    .max(5, "カテゴリは5個まで設定できます")
    .optional(),
});

// ノート共有スキーマ
export const shareNoteSchema = z.object({
  noteId: z.string().cuid("無効なノートIDです"),
  permission: z.enum(["view", "edit"]),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で設定してください")
    .max(100, errorMessages.tooLong(100))
    .optional(),
  expiresAt: z.date().min(new Date(), "有効期限は現在より後に設定してください").optional(),
});

// ノート検索スキーマ
export const searchNotesSchema = z.object({
  query: z.string().max(200, errorMessages.tooLong(200)).trim().optional(),
  tags: z
    .array(z.string().max(50, errorMessages.tooLong(50)))
    .max(10, "タグは10個まで指定できます")
    .optional(),
  categories: z
    .array(z.string().max(50, errorMessages.tooLong(50)))
    .max(5, "カテゴリは5個まで指定できます")
    .optional(),
  visibility: z
    .enum(["private", "shared", "public"])
    .optional(),
});

// テンプレート作成スキーマ
export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名は必須です")
    .max(100, errorMessages.tooLong(100))
    .trim(),
  content: z
    .string()
    .max(100000, errorMessages.tooLong(100000)),
  type: z
    .string()
    .min(1, "テンプレートタイプは必須です")
    .max(50, errorMessages.tooLong(50))
    .trim(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ShareNoteInput = z.infer<typeof shareNoteSchema>;
export type SearchNotesInput = z.infer<typeof searchNotesSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
