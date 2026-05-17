"use client";

import type { ReactNode } from "react";
import { Bell, LogOut, Search, UserRound } from "lucide-react";
import { signOut } from "@/lib/supabase/auth";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1 border-r border-line">
          <header className="sticky top-0 z-10 bg-cream/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Fam Things</p>
                <p className="truncate text-xl font-semibold">Ward Fam</p>
              </div>
              <label className="hidden h-10 max-w-md flex-1 items-center gap-3 rounded-lg border border-line bg-white/80 px-3 text-muted lg:flex">
                <Search className="size-4 stroke-[1.8]" />
                <input className="w-full bg-transparent text-sm font-medium leading-tight outline-none placeholder:text-muted/70" placeholder="Search events, meals, groceries" />
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-soft-green hover:text-green" aria-label="Notifications">
                  <Bell className="size-4 stroke-[1.8]" />
                </button>
                <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-soft-green hover:text-green" aria-label="Account">
                  <UserRound className="size-4 stroke-[1.8]" />
                </button>
                <button
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/5 hover:text-danger"
                  aria-label="Sign out"
                  onClick={() => void signOut()}
                >
                  <LogOut className="size-4 stroke-[1.8]" />
                </button>
              </div>
            </div>
          </header>
          <main className="w-full max-w-[1500px] px-4 py-5 pb-24 md:px-8 md:py-6 lg:pb-10 xl:px-9">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
