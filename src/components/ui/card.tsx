import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-line bg-white shadow-[0_1px_0_rgba(24,24,24,0.03)]", className)}
      {...props}
    />
  );
}
