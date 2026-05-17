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
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-2 border-ink bg-lime text-ink shadow-[0_2px_0_#181818]",
        variant === "secondary" && "border-2 border-green bg-white text-green",
        variant === "ghost" && "text-muted hover:bg-soft-green hover:text-green",
        variant === "danger" && "border border-danger/30 bg-white text-danger",
        className,
      )}
      {...props}
    />
  );
}
