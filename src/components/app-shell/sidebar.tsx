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
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-line bg-white/70 px-4 py-5 lg:block">
      <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2">
        <div className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-lime font-black">FT</div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-green">Fam Things</p>
          <p className="text-xl font-black">Ward Fam</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-muted transition hover:bg-soft-green hover:text-green",
                active && "border border-green/20 bg-soft-green text-green",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-lg border border-dashed border-line bg-cream p-4">
        <div className="flex items-center gap-2 text-sm font-black text-ink">
          <Settings className="size-4 text-green" />
          Backend ready
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          Supabase tables, RPCs, and invite Edge Function helpers are scaffolded for live data.
        </p>
      </div>
    </aside>
  );
}
