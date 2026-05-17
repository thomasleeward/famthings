"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarPlus, Check, Loader2, Plus, Soup, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { addMealIngredientsToGroceries } from "@/lib/supabase/planning";
import { getCurrentHousehold, getHouseholdMealPlanEntries, getHouseholdMeals, type MealPlanEntryWithMeal, type MealWithIngredients } from "@/lib/supabase/live-data";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealSlot = (typeof slots)[number];

type PlanTarget = {
  date: string;
  label: string;
  slot: MealSlot;
};

type GrocerySelection = {
  key: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  const [householdId, setHouseholdId] = useState("");
  const [userId, setUserId] = useState("");
  const [meals, setMeals] = useState<MealWithIngredients[]>([]);
  const [entries, setEntries] = useState<MealPlanEntryWithMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [planTarget, setPlanTarget] = useState<PlanTarget | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealWithIngredients | null>(null);
  const [grocerySelections, setGrocerySelections] = useState<GrocerySelection[]>([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => addDays(today, index));
  }, []);

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { household, user } = await getCurrentHousehold();
      const [mealRows, entryRows] = await Promise.all([
        getHouseholdMeals(household.id),
        getHouseholdMealPlanEntries(household.id, toDateKey(days[0]), toDateKey(days[days.length - 1])),
      ]);

      setHouseholdId(household.id);
      setUserId(user.id);
      setMeals(mealRows);
      setEntries(entryRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load meals.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    let active = true;

    async function loadActiveMeals() {
      if (active) {
        await loadMeals();
      }
    }

    void loadActiveMeals();

    return () => {
      active = false;
    };
  }, [loadMeals]);

  const entriesByDateAndSlot = new Map(entries.map((entry) => [`${entry.planned_date}:${entry.meal_slot}`, entry]));

  function openPlanner(target: PlanTarget) {
    setPlanTarget(target);
    setSelectedMeal(null);
    setGrocerySelections([]);
    setPlanError("");
    setPlannerOpen(true);
  }

  function chooseMeal(meal: MealWithIngredients) {
    setSelectedMeal(meal);
    setPlanError("");
    setGrocerySelections(meal.ingredients.map((ingredient) => ({
      key: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      checked: true,
    })));
  }

  function toggleGrocerySelection(key: string) {
    setGrocerySelections((items) => items.map((item) => item.key === key ? { ...item, checked: !item.checked } : item));
  }

  async function savePlannedMeal() {
    if (!planTarget || !selectedMeal) {
      setPlanError("Choose a meal to plan.");
      return;
    }

    if (!householdId) {
      setPlanError("Could not find your household.");
      return;
    }

    try {
      setSavingPlan(true);
      setPlanError("");

      const supabase = createBrowserSupabaseClient();
      const { data: entry, error: entryError } = await supabase
        .from("meal_plan_entries")
        .insert({
          household_id: householdId,
          meal_id: selectedMeal.id,
          planned_date: planTarget.date,
          meal_slot: planTarget.slot,
        })
        .select("id")
        .single();

      if (entryError || !entry) {
        throw new Error(entryError?.message || "Could not plan meal.");
      }

      const selectedIngredients = grocerySelections
        .filter((ingredient) => ingredient.checked)
        .map(({ name, quantity, unit }) => ({ name, quantity, unit }));

      if (selectedIngredients.length) {
        const { error: groceryError } = await addMealIngredientsToGroceries({
          householdId,
          mealPlanEntryId: entry.id,
          ingredients: selectedIngredients,
          addedBy: userId || undefined,
        });

        if (groceryError) {
          throw new Error(groceryError.message);
        }
      }

      await loadMeals();
      setPlannerOpen(false);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Could not save meal plan.");
    } finally {
      setSavingPlan(false);
    }
  }

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
            <Link
              href="/meals/library"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-green/30 bg-lime/70 px-3.5 text-sm font-semibold text-green transition hover:border-green/40 hover:bg-soft-green"
            >
              <Plus className="size-4" /> New meal
            </Link>
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
                            <button
                              className="font-medium text-green transition hover:text-ink"
                              onClick={() => openPlanner({ date: toDateKey(day), label: formatDay(day), slot })}
                            >
                              + plan
                            </button>
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
                <Link
                  href="/meals/library"
                  className="flex w-full items-center gap-3 rounded-lg border border-line p-3 text-left transition hover:border-green hover:bg-cream"
                  key={meal.id}
                >
                  <div className="grid size-10 place-items-center rounded-lg bg-cream text-muted">
                    <Soup className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{meal.name}</p>
                    <p className="text-sm text-muted">{meal.ingredients.length ? `${meal.ingredients.length} ingredients` : "No ingredients yet"}</p>
                  </div>
                </Link>
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
              <Link
                href="/meals/library"
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-green/30 bg-lime/70 px-3.5 text-sm font-semibold text-green transition hover:border-green/40 hover:bg-soft-green"
              >
                Add Meal
              </Link>
            </div>
          </Card>
        </aside>
      </div>

      {plannerOpen && planTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">{planTarget.label} · {planTarget.slot}</p>
                <h2 className="mt-1 font-serif text-3xl font-medium">{selectedMeal ? "Add ingredients?" : "Choose a meal"}</h2>
              </div>
              <button
                className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-soft-green hover:text-green"
                onClick={() => setPlannerOpen(false)}
                aria-label="Close meal planner"
              >
                <X className="size-4" />
              </button>
            </div>

            {!selectedMeal ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {meals.map((meal) => (
                  <button
                    className="flex items-center gap-3 rounded-lg border border-line bg-cream p-3 text-left transition hover:border-green hover:bg-white"
                    key={meal.id}
                    onClick={() => chooseMeal(meal)}
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-muted">
                      <Soup className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{meal.name}</p>
                      <p className="text-sm text-muted">{meal.ingredients.length ? `${meal.ingredients.length} ingredients` : "No ingredients yet"}</p>
                    </div>
                  </button>
                ))}
                {!meals.length ? <p className="text-sm font-medium text-muted">No meals in your library yet.</p> : null}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-line bg-cream p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted">Planning</p>
                      <h3 className="text-xl font-semibold">{selectedMeal.name}</h3>
                    </div>
                    <Button variant="secondary" onClick={() => setSelectedMeal(null)}>Change meal</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">Add ingredients to groceries</h3>
                  <p className="mt-1 text-sm text-muted">Everything is selected by default. Uncheck anything you already have.</p>
                  <div className="mt-3 space-y-2">
                    {grocerySelections.length ? grocerySelections.map((ingredient) => (
                      <label className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cream px-3 py-2" key={ingredient.key}>
                        <span className="flex min-w-0 items-center gap-3">
                          <input
                            className="size-4 accent-[var(--green)]"
                            type="checkbox"
                            checked={ingredient.checked}
                            onChange={() => toggleGrocerySelection(ingredient.key)}
                          />
                          <span className="truncate font-medium">{ingredient.name}</span>
                        </span>
                        <Badge className="bg-white text-muted">{[ingredient.quantity, ingredient.unit].filter(Boolean).join(" ") || "1"}</Badge>
                      </label>
                    )) : (
                      <p className="rounded-lg border border-line bg-cream px-3 py-2 text-sm font-medium text-muted">This meal has no ingredients yet.</p>
                    )}
                  </div>
                </div>

                {planError ? <p className="rounded-lg border border-danger/20 bg-cream px-3 py-2 text-sm font-medium text-danger">{planError}</p> : null}

                <div className="flex justify-end gap-2 border-t border-line pt-4">
                  <Button variant="ghost" onClick={() => setPlannerOpen(false)}>Cancel</Button>
                  <Button onClick={() => void savePlannedMeal()} disabled={savingPlan}>
                    {savingPlan ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    Plan meal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
