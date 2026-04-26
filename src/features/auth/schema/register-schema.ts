import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "ユーザー名は必須です")
      .max(50, "ユーザー名は50文字以内で入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上である必要があります")
      .regex(/[A-Za-z]/, "パスワードには英字を含める必要があります")
      .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
