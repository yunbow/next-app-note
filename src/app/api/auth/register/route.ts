import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

function generateUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 10; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `user_${suffix}`;
}

async function generateUniqueUsername(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const username = generateUsername();
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
  }
  return `user_${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { message: validated.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: { message: "このメールアドレスは既に登録されています" } },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername();

    await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: { message: "登録中にエラーが発生しました" } },
      { status: 500 }
    );
  }
}
