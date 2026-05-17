import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition hover:bg-soft-green disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border border-green/30 bg-lime/70 text-green hover:border-green/40",
        variant === "secondary" && "border border-green/30 bg-white text-green hover:border-green/40",
        variant === "ghost" && "text-muted hover:text-green",
        variant === "danger" && "border border-danger/25 bg-white text-danger hover:bg-danger/5",
        className,
      )}
      {...props}
    />
  );
}
