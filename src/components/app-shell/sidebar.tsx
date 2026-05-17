"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Home,
  Settings,
  ShoppingCart,
  Soup,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/todos", label: "To-dos", icon: CheckSquare },
  { href: "/meals", label: "Meals", icon: Soup },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart },
  { href: "/household", label: "Household", icon: UsersRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-80 shrink-0 border-r border-line bg-cream px-8 py-9 lg:block">
      <Link href="/" className="flex items-center gap-4 rounded-2xl">
        <div className="grid size-12 place-items-center rounded-2xl bg-soft-green text-base font-semibold text-green">FT</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Fam Things</p>
          <p className="text-2xl font-semibold text-ink">Ward Fam</p>
        </div>
      </Link>

      <nav className="mt-16 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-xl font-medium text-muted transition hover:bg-soft-green hover:text-green",
                active && "bg-soft-green text-green",
              )}
            >
              <Icon className="size-5 stroke-[1.8]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-16 rounded-2xl border border-line bg-white/70 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Settings className="size-4 text-muted" />
          Backend ready
        </div>
        <p className="mt-3 text-sm font-medium leading-7 text-muted">
          Supabase tables, RPCs, and invite Edge Function helpers are scaffolded for live data.
        </p>
      </div>
    </aside>
  );
}
