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
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-green/75">{eyebrow}</p> : null}
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink md:text-5xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
