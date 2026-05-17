import Link from "next/link";
import { CalendarDays, CheckSquare, Moon, Plus, ShoppingCart, Soup, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { events, groceries, household, todos } from "@/lib/data/sample";

export default function Home() {
  const openTodos = todos.filter((todo) => !todo.completed);
  const activeGroceries = groceries.filter((item) => !item.checked);
  const stats: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "To-dos open", value: openTodos.length, icon: CheckSquare },
    { label: "Events today", value: 1, icon: CalendarDays },
    { label: "On grocery list", value: activeGroceries.length, icon: ShoppingCart },
  ];
  const quickAdds: Array<{ label: string; icon: LucideIcon; href: string }> = [
    { label: "Event", icon: CalendarDays, href: "/events" },
    { label: "To-do", icon: CheckSquare, href: "/todos" },
    { label: "Meal", icon: Soup, href: "/meals" },
    { label: "Grocery", icon: ShoppingCart, href: "/groceries" },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Fam Things"
        title={household.name}
        action={
          <div className="flex gap-2">
            <Button variant="secondary">
              <Plus className="size-4" /> Quick add
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card className="p-5" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted">{label}</p>
              <Icon className="size-5 text-green" />
            </div>
            <p className="mt-5 text-4xl font-black">{value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Today</p>
              <h2 className="mt-1 text-2xl font-black">Sat, May 16</h2>
            </div>
            <Badge>2 things today</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {events.slice(0, 2).map((event) => (
              <Link href="/events" key={event.id} className="rounded-lg border border-line bg-cream p-4 transition hover:border-green">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-lg bg-white text-center text-sm font-black">
                    {event.date.split(", ")[1]}
                  </div>
                  <div>
                    <p className="font-black">{event.title}</p>
                    <p className="text-sm text-muted">{event.time}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/meals" className="rounded-lg border border-line bg-soft-green p-4 transition hover:border-green">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-lg bg-white text-green">
                    <Moon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Tonight&apos;s dinner</p>
                    <p className="font-bold italic text-muted">Nothing planned yet</p>
                  </div>
                </div>
                <p className="font-black text-green">+ Plan</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">To do</h2>
            <Link href="/todos" className="text-sm font-bold text-green">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {openTodos.map((todo) => (
              <div className="flex items-center gap-3 rounded-lg border border-line p-3" key={todo.id}>
                <span className="size-5 rounded-full border-2 border-green" />
                <div>
                  <p className="font-black">{todo.title}</p>
                  <p className="text-sm text-muted">{todo.due}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-black">Quick add</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickAdds.map(({ label, icon: Icon, href }) => (
            <Link href={href} key={label} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 font-black transition hover:border-green">
              <Icon className="size-5 text-green" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
