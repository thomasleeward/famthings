import Image from "next/image";
import { cn } from "@/lib/utils";

export const HOUSEHOLD_LOGO_PATH = "/logo.png";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-lg bg-soft-green", className)}>
      <Image
        alt="Household logo"
        className="object-contain p-1"
        fill
        priority
        sizes="48px"
        src={HOUSEHOLD_LOGO_PATH}
      />
    </span>
  );
}
