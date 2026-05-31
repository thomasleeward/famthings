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
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/todos", label: "To-dos", icon: CheckSquare },
  { href: "/meals", label: "Meals", icon: Soup },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart },
  { href: "/household", label: "Household", icon: UsersRound },
];

export function Sidebar({ householdName }: { householdName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-line bg-cream px-5 py-7 lg:block">
      <Link href="/" className="flex items-center gap-3 rounded-lg">
        <BrandLogo className="size-10" />
        <p className="truncate text-lg font-semibold leading-6 text-ink">{householdName}</p>
      </Link>

      <nav className="mt-12 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-soft-green hover:text-green",
                active && "bg-soft-green text-green",
              )}
            >
              <Icon className="size-4 stroke-[1.8]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-12 rounded-lg border border-line bg-white/70 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
          <Settings className="size-3.5 text-muted" />
          Backend ready
        </div>
        <p className="mt-3 text-xs font-medium leading-6 text-muted">
          Supabase tables, RPCs, and invite Edge Function helpers are scaffolded for live data.
        </p>
      </div>
    </aside>
  );
}
