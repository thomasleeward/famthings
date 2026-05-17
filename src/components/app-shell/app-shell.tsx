import type { ReactNode } from "react";
import { Bell, Search, UserRound } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 lg:hidden">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-green">Fam Things</p>
                <p className="truncate text-xl font-black">Ward Fam</p>
              </div>
              <label className="hidden h-10 max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm text-muted lg:flex">
                <Search className="size-4" />
                <input className="w-full bg-transparent font-medium outline-none" placeholder="Search events, meals, groceries..." />
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button className="grid size-10 place-items-center rounded-lg border border-line bg-white text-muted hover:text-green" aria-label="Notifications">
                  <Bell className="size-5" />
                </button>
                <button className="grid size-10 place-items-center rounded-lg border border-line bg-white text-green" aria-label="Account">
                  <UserRound className="size-5" />
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 md:px-8 md:py-8 lg:pb-8">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
