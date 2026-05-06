import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadUserAvatar, R2_ENABLED } from "@/lib/storage/r2";

const IMAGE_SIGNATURES: { type: string; ext: string; signatures: number[][] }[] = [
  { type: "image/jpeg", ext: "jpg", signatures: [[0xff, 0xd8, 0xff]] },
  {
    type: "image/png",
    ext: "png",
    signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
  {
    type: "image/gif",
    ext: "gif",
    signatures: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
  },
  { type: "image/webp", ext: "webp", signatures: [[0x52, 0x49, 0x46, 0x46]] },
];

function validateImageMagicNumber(
  buffer: Buffer,
): { type: string; ext: string } | null {
  for (const { type, ext, signatures } of IMAGE_SIGNATURES) {
    for (const signature of signatures) {
      if (buffer.length < signature.length) continue;
      if (signature.every((byte, i) => buffer[i] === byte)) {
        if (type === "image/webp") {
          if (buffer.length < 12) continue;
          if (![0x57, 0x45, 0x42, 0x50].every((b, i) => buffer[8 + i] === b))
            continue;
        }
        return { type, ext };
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  if (!R2_ENABLED)
    return NextResponse.json(
      { error: "ストレージが設定されていません" },
      { status: 503 },
    );

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 },
      );
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 },
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    const validatedImage = validateImageMagicNumber(buffer);
    if (!validatedImage)
      return NextResponse.json(
        { error: "JPEG、PNG、GIF、WebP形式の画像のみアップロードできます" },
        { status: 400 },
      );

    const url = await uploadUserAvatar({
      userId: session.user.id,
      buffer,
      mimeType: validatedImage.type,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 },
    );
  }
}
