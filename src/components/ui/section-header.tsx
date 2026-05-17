import type { ReactNode } from "react";

export function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-green">{eyebrow}</p> : null}
        <h1 className="mt-1 text-4xl font-black tracking-normal text-ink md:text-5xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
