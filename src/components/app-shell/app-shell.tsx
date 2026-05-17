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
          <header className="sticky top-0 z-10 bg-cream/90 px-4 py-8 backdrop-blur md:px-10">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Fam Things</p>
                <p className="truncate text-xl font-semibold">Ward Fam</p>
              </div>
              <label className="hidden h-20 max-w-md flex-1 items-center gap-4 rounded-2xl border border-line bg-white/80 px-6 text-muted lg:flex">
                <Search className="size-5 stroke-[1.7]" />
                <input className="w-full bg-transparent text-xl font-medium leading-tight outline-none placeholder:text-muted/70" placeholder="Search events, meals, groceries" />
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button className="grid size-10 place-items-center rounded-xl text-muted hover:bg-soft-green hover:text-green" aria-label="Notifications">
                  <Bell className="size-5 stroke-[1.8]" />
                </button>
                <button className="grid size-10 place-items-center rounded-xl text-muted hover:bg-soft-green hover:text-green" aria-label="Account">
                  <UserRound className="size-5 stroke-[1.8]" />
                </button>
                <button
                  className="grid size-10 place-items-center rounded-xl text-muted hover:bg-danger/5 hover:text-danger"
                  aria-label="Sign out"
                  onClick={() => void signOut()}
                >
                  <LogOut className="size-5 stroke-[1.8]" />
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-4xl px-4 py-6 pb-24 md:px-10 md:py-8 lg:pb-12">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
