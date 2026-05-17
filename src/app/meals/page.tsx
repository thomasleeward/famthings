"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarPlus, Plus, Soup } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentHousehold, getHouseholdMealPlanEntries, getHouseholdMeals, type MealPlanEntryWithMeal, type MealWithIngredients } from "@/lib/supabase/live-data";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric" }).format(date);
}

export default function MealsPage() {
  const [meals, setMeals] = useState<MealWithIngredients[]>([]);
  const [entries, setEntries] = useState<MealPlanEntryWithMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => addDays(today, index));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMeals() {
      try {
        setLoading(true);
        setError("");
        const { household } = await getCurrentHousehold();
        const [mealRows, entryRows] = await Promise.all([
          getHouseholdMeals(household.id),
          getHouseholdMealPlanEntries(household.id, toDateKey(days[0]), toDateKey(days[days.length - 1])),
        ]);

        if (active) {
          setMeals(mealRows);
          setEntries(entryRows);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load meals.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMeals();

    return () => {
      active = false;
    };
  }, [days]);

  const entriesByDateAndSlot = new Map(entries.map((entry) => [`${entry.planned_date}:${entry.meal_slot}`, entry]));

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ward Fam"
        title="Meals"
        action={
          <div className="flex gap-2">
            <Link
              href="/meals/library"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green/30 bg-white px-4 text-sm font-semibold text-green transition hover:bg-soft-green"
            >
              <BookOpen className="size-4" /> Meal library
            </Link>
            <Button>
              <Plus className="size-4" /> New meal
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <button className={index === 0 ? "rounded-lg bg-soft-lime p-2.5 text-center font-semibold text-green" : "rounded-lg border border-line bg-white p-2.5 text-center font-semibold text-muted"} key={toDateKey(day)}>
                <span className="block text-xs uppercase">{formatDay(day).split(" ")[0]}</span>
                <span className="text-xl">{formatDay(day).split(" ")[1]}</span>
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div>
                <h2 className="font-serif text-2xl font-medium">Weekly planner</h2>
                <p className="text-sm text-muted">Plan meals, then add ingredients to groceries from the selected meal.</p>
              </div>
              <Badge>{entries.length} planned</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-cream text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    {slots.map((slot) => <th className="px-4 py-3" key={slot}>{slot}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="border-t border-line">
                      <td className="px-4 py-4 text-muted" colSpan={5}>Loading meal plan...</td>
                    </tr>
                  ) : error ? (
                    <tr className="border-t border-line">
                      <td className="px-4 py-4 text-danger" colSpan={5}>{error}</td>
                    </tr>
                  ) : days.map((day) => (
                    <tr className="border-t border-line" key={toDateKey(day)}>
                      <td className="px-4 py-4 font-semibold">{formatDay(day)}</td>
                      {slots.map((slot) => (
                        <td className="px-4 py-4" key={slot}>
                          {entriesByDateAndSlot.get(`${toDateKey(day)}:${slot}`)?.meal ? (
                            <span className="rounded-full bg-soft-green px-3 py-1 font-medium text-success">{entriesByDateAndSlot.get(`${toDateKey(day)}:${slot}`)?.meal?.name}</span>
                          ) : (
                            <button className="font-medium text-green">+ plan</button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Meal library</h2>
              <Badge>{meals.length} meals</Badge>
            </div>
            <input className="mt-4 h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="Search meals..." />
            <div className="mt-4 space-y-3">
              {loading ? <p className="text-sm font-medium text-muted">Loading meals...</p> : null}
              {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
              {!loading && !error && meals.map((meal) => (
                <div className="flex items-center gap-3 rounded-lg border border-line p-3" key={meal.id}>
                  <div className="grid size-10 place-items-center rounded-lg bg-cream text-muted">
                    <Soup className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{meal.name}</p>
                    <p className="text-sm text-muted">{meal.ingredients.length ? `${meal.ingredients.length} ingredients` : "No ingredients yet"}</p>
                  </div>
                </div>
              ))}
              {!loading && !error && !meals.length ? <p className="text-sm font-medium text-muted">No meals yet.</p> : null}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CalendarPlus className="size-5 text-green" />
              <h2 className="text-lg font-medium">New meal</h2>
            </div>
            <div className="mt-4 space-y-3">
              <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="Meal name" />
              <textarea className="min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium" placeholder="Description" />
              <div className="grid grid-cols-[1fr_88px_88px_44px] gap-2">
                <input className="h-10 rounded-lg border border-line bg-cream px-3" placeholder="Ingredient" />
                <input className="h-10 rounded-lg border border-line bg-cream px-3" placeholder="Qty" />
                <input className="h-10 rounded-lg border border-line bg-cream px-3" placeholder="Unit" />
                <Button aria-label="Add ingredient" className="px-0">
                  <Plus className="size-4" />
                </Button>
              </div>
              <p className="text-sm leading-6 text-muted">
                When a meal plan entry is saved, its ingredients can be inserted into <span className="font-medium text-ink">grocery_items</span> with source <span className="font-medium text-ink">meal</span>.
              </p>
              <Button className="w-full">Add Meal</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
