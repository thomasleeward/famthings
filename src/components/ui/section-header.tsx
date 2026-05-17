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
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green/75">{eyebrow}</p> : null}
        <h1 className="mt-3 font-serif text-5xl font-semibold tracking-normal text-ink md:text-6xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
