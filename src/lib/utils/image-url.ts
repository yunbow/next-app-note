export function getImageUrl(
  imagePath: string | null | undefined,
): string | undefined {
  if (!imagePath) return undefined;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  // data: URL (プレビュー用)
  if (imagePath.startsWith("data:")) return imagePath;
  return imagePath;
}
