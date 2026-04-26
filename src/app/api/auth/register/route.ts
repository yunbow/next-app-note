import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/features/auth/schema/register-schema";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/api/rate-limit";

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
    const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
    const { success: rateLimitOk } = checkRateLimit(`auth:register:${ip}`, RATE_LIMIT_PRESETS.auth);
    if (!rateLimitOk) {
      return NextResponse.json(
        { success: false, error: { message: "リクエストが多すぎます。しばらくしてから再試行してください。" } },
        { status: 429 }
      );
    }

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
