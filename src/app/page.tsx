"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CheckSquare, Moon, Plus, ShoppingCart, Soup, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentHousehold, getHouseholdEvents, getHouseholdGroceries, getHouseholdMealPlanEntries, getHouseholdTodos, type EventRow, type GroceryRow, type Household, type MealPlanEntryWithMeal, type TodoRow } from "@/lib/supabase/live-data";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}

function formatEventTime(event: EventRow) {
  if (event.all_day) {
    return "All day";
  }

  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(event.start_at));
}

export default function Home() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [groceries, setGroceries] = useState<GroceryRow[]>([]);
  const [dinner, setDinner] = useState<MealPlanEntryWithMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const { household: currentHousehold } = await getCurrentHousehold();
        const today = toDateKey(new Date());
        const [eventRows, todoRows, groceryRows, mealPlanRows] = await Promise.all([
          getHouseholdEvents(currentHousehold.id),
          getHouseholdTodos(currentHousehold.id),
          getHouseholdGroceries(currentHousehold.id),
          getHouseholdMealPlanEntries(currentHousehold.id, today, today),
        ]);

        if (active) {
          setHousehold(currentHousehold);
          setEvents(eventRows);
          setTodos(todoRows);
          setGroceries(groceryRows);
          setDinner(mealPlanRows.find((entry) => entry.meal_slot === "dinner") || null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const openTodos = todos.filter((todo) => !todo.completed);
  const activeGroceries = groceries.filter((item) => !item.checked);
  const todayKey = toDateKey(new Date());
  const todayEvents = events.filter((event) => toDateKey(new Date(event.start_at)) === todayKey);
  const upcomingEvents = events.filter((event) => new Date(event.start_at) >= new Date()).slice(0, 2);
  const stats: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "To-dos open", value: openTodos.length, icon: CheckSquare },
    { label: "Events today", value: todayEvents.length, icon: CalendarDays },
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
        title={household?.name || "Fam Things"}
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
          <Card className="p-4" key={label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{label}</p>
              <Icon className="size-5 text-green" />
            </div>
            <p className="mt-3 font-serif text-3xl font-medium">{value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Today</p>
              <h2 className="mt-1 font-serif text-3xl font-medium">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date())}</h2>
            </div>
            <Badge>{todayEvents.length + openTodos.length} things today</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {loading ? <p className="text-sm font-medium text-muted">Loading dashboard...</p> : null}
            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
            {!loading && !error && upcomingEvents.map((event) => (
              <Link href="/events" key={event.id} className="rounded-lg border border-line bg-cream p-4 transition hover:border-green">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-white text-center text-sm font-semibold">
                    {formatEventDate(event.start_at)}
                  </div>
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted">{formatEventTime(event)}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/meals" className="rounded-lg border border-line bg-soft-green p-4 transition hover:border-green">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-white text-green">
                    <Moon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Tonight&apos;s dinner</p>
                    <p className={dinner?.meal ? "font-semibold text-ink" : "font-medium italic text-muted"}>{dinner?.meal?.name || "Nothing planned yet"}</p>
                  </div>
                </div>
                <p className="font-semibold text-green">+ Plan</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium">To do</h2>
            <Link href="/todos" className="text-sm font-medium text-green">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {openTodos.map((todo) => (
              <div className="flex items-center gap-3 rounded-lg border border-line p-3" key={todo.id}>
                <span className="size-5 rounded-full border border-green" />
                <div>
                  <p className="font-semibold">{todo.title}</p>
                  <p className="text-sm text-muted">{todo.due_at ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(todo.due_at)) : "No due date"}</p>
                </div>
              </div>
            ))}
            {!loading && !error && !openTodos.length ? <p className="text-sm font-medium text-muted">No open to-dos.</p> : null}
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-medium">Quick add</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickAdds.map(({ label, icon: Icon, href }) => (
            <Link href={href} key={label} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 font-semibold transition hover:border-green">
              <Icon className="size-5 text-green" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
