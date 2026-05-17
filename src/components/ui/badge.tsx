import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-soft-lime px-2.5 py-1 text-xs font-bold text-ink",
        className,
      )}
      {...props}
    />
  );
}
