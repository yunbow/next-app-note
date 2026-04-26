import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  label: string;
  showText?: boolean;
  imageSize?: number;
  className?: string;
};

export function BrandLogo({
  label,
  showText = true,
  imageSize = 32,
  className,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <Image
        src="/brand/note-icon-192.png"
        alt=""
        width={imageSize}
        height={imageSize}
        className="shrink-0 rounded-md"
        priority
      />
      {showText && <span className="truncate">{label}</span>}
    </span>
  );
}
