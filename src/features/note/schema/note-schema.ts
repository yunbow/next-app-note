import { z } from "zod";

export const CreateNoteSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内で入力してください"),
  content: z.string().min(1, "コンテンツは必須です").max(100000, "コンテンツは100000文字以内で入力してください"),
  visibility: z.enum(["private", "shared", "public"]).default("private"),
  tagIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const UpdateNoteSchema = z.object({
  id: z.string().min(1, "IDは必須です"),
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内で入力してください").optional(),
  content: z.string().min(1, "コンテンツは必須です").max(100000, "コンテンツは100000文字以内で入力してください").optional(),
  visibility: z.enum(["private", "shared", "public"]).optional(),
  tagIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const CreateNoteVersionSchema = z.object({
  noteId: z.string().min(1, "ノートIDは必須です"),
  content: z.string().min(1, "コンテンツは必須です"),
});

export const CreateNoteShareSchema = z.object({
  noteId: z.string().min(1, "ノートIDは必須です"),
  userId: z.string().optional().nullable(),
  permission: z.enum(["view", "edit"]),
  password: z.string().min(6, "パスワードは6文字以上で入力してください").optional(),
  expiresAt: z.date().optional().nullable(),
});

export const CreateNoteLinkSchema = z.object({
  sourceNoteId: z.string().min(1, "ソースノートIDは必須です"),
  targetNoteId: z.string().min(1, "ターゲットノートIDは必須です"),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type CreateNoteVersionInput = z.infer<typeof CreateNoteVersionSchema>;
export type CreateNoteShareInput = z.infer<typeof CreateNoteShareSchema>;
export type CreateNoteLinkInput = z.infer<typeof CreateNoteLinkSchema>;
