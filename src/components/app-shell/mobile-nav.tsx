"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckSquare, Home, ShoppingCart, Soup } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/todos", label: "To-dos", icon: CheckSquare },
  { href: "/", label: "Home", icon: Home },
  { href: "/meals", label: "Meals", icon: Soup },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-white px-2 py-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            href={item.href}
            className={cn("flex flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-bold text-muted", active && "text-green")}
            key={item.href}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
