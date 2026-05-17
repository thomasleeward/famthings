"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2, Plus, Search, Soup, Star, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCurrentHousehold, getHouseholdMeals, type MealWithIngredients } from "@/lib/supabase/live-data";

const filters = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

type IngredientEditorRow = {
  clientId: string;
  name: string;
  quantity: string;
  unit: string;
};

function createIngredientRow(): IngredientEditorRow {
  return {
    clientId: crypto.randomUUID(),
    name: "",
    quantity: "",
    unit: "",
  };
}

export default function MealLibraryPage() {
  const [meals, setMeals] = useState<MealWithIngredients[]>([]);
  const [householdId, setHouseholdId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMealId, setSelectedMealId] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [ingredientRows, setIngredientRows] = useState<IngredientEditorRow[]>([createIngredientRow()]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const selectedMeal = meals.find((meal) => meal.id === selectedMealId) || meals[0];

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { household } = await getCurrentHousehold();
      const mealRows = await getHouseholdMeals(household.id);

      setHouseholdId(household.id);
      setMeals(mealRows);
      setSelectedMealId((current) => current || mealRows[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load meals.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  function openMealEditor(meal?: MealWithIngredients) {
    setSaveError("");
    setEditingMealId(meal?.id || null);
    setMealName(meal?.name || "");
    setMealDescription(meal?.description || "");
    setIngredientRows(
      meal?.ingredients.length
        ? meal.ingredients.map((ingredient) => ({
          clientId: ingredient.id,
          name: ingredient.name,
          quantity: ingredient.quantity || "",
          unit: ingredient.unit || "",
        }))
        : [createIngredientRow()],
    );
    setEditorOpen(true);
  }

  function updateIngredientRow(clientId: string, field: keyof Omit<IngredientEditorRow, "clientId">, value: string) {
    setIngredientRows((rows) => rows.map((row) => row.clientId === clientId ? { ...row, [field]: value } : row));
  }

  function removeIngredientRow(clientId: string) {
    setIngredientRows((rows) => rows.length === 1 ? [createIngredientRow()] : rows.filter((row) => row.clientId !== clientId));
  }

  async function saveMeal() {
    const nextName = mealName.trim();
    const nextDescription = mealDescription.trim() || null;
    const nextIngredients = ingredientRows
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim() || null,
        unit: ingredient.unit.trim() || null,
      }))
      .filter((ingredient) => ingredient.name);

    if (!nextName) {
      setSaveError("Meal name is required.");
      return;
    }

    if (!householdId) {
      setSaveError("Could not find your household.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const supabase = createBrowserSupabaseClient();
      let mealId = editingMealId;

      if (mealId) {
        const { error: mealError } = await supabase
          .from("meals")
          .update({ name: nextName, description: nextDescription })
          .eq("id", mealId)
          .eq("household_id", householdId);

        if (mealError) {
          throw new Error(mealError.message);
        }
      } else {
        const { data: meal, error: mealError } = await supabase
          .from("meals")
          .insert({ household_id: householdId, name: nextName, description: nextDescription })
          .select("id")
          .single();

        if (mealError || !meal) {
          throw new Error(mealError?.message || "Could not create meal.");
        }

        mealId = meal.id;
      }

      const { error: deleteError } = await supabase
        .from("meal_ingredients")
        .delete()
        .eq("meal_id", mealId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      if (nextIngredients.length) {
        const { error: ingredientError } = await supabase
          .from("meal_ingredients")
          .insert(nextIngredients.map((ingredient) => ({ meal_id: mealId, ...ingredient })));

        if (ingredientError) {
          throw new Error(ingredientError.message);
        }
      }

      await loadMeals();
      setSelectedMealId(mealId);
      setEditorOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save meal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Meals"
        title="Meal Library"
        action={
          <div className="flex gap-2">
            <Link
              href="/meals"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-muted transition hover:bg-soft-green hover:text-green"
            >
              <ArrowLeft className="size-4" /> Planner
            </Link>
            <Button onClick={() => openMealEditor()}>
              <Plus className="size-4" /> New meal
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <Card className="p-4">
            <label className="flex h-12 items-center gap-3 rounded-lg border border-line bg-cream px-3 text-muted">
              <Search className="size-5" />
              <input className="w-full bg-transparent font-medium outline-none" placeholder="Search meals..." />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Badge
                  className={index === 0 ? "border-green bg-soft-green text-success" : "bg-white text-muted"}
                  key={filter}
                >
                  {filter}{index === 0 ? ` · ${meals.length}` : ""}
                </Badge>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium">All meals</h2>
            <p className="text-sm font-medium text-muted">{meals.length} meals</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {loading ? <Card className="p-4 text-sm font-medium text-muted">Loading meals...</Card> : null}
            {error ? <Card className="p-4 text-sm font-medium text-danger">{error}</Card> : null}
            {!loading && !error && meals.map((meal) => (
              <button
                className="group flex w-full items-center gap-4 rounded-lg border border-line bg-white/80 p-4 text-left transition hover:border-green hover:bg-white"
                key={meal.id}
                onClick={() => {
                  setSelectedMealId(meal.id);
                  openMealEditor(meal);
                }}
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-cream text-muted group-hover:text-green">
                  <Soup className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-lg font-medium">{meal.name}</p>
                    {meal.ingredients.length > 0 ? <Star className="size-4 fill-lime text-ink" /> : null}
                  </div>
                  <p className="text-sm text-muted">
                    {meal.ingredients.length ? `${meal.ingredients.length} ingredients` : "No ingredients yet"}
                  </p>
                </div>
                <ChevronRight className="size-5 text-line group-hover:text-green" />
              </button>
            ))}
          </div>

          {!loading && !error && !meals.length ? <Card className="border-dashed bg-cream p-6 text-center">
            <h2 className="text-lg font-medium">Build out your library</h2>
            <p className="mt-2 text-muted">Add family favorites to plan them quickly later.</p>
            <Button className="mt-4" variant="secondary" onClick={() => openMealEditor()}>
              <Plus className="size-4" /> Add another meal
            </Button>
          </Card> : null}
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Selected meal</p>
            <h2 className="mt-2 font-serif text-3xl font-medium">{selectedMeal?.name || "No meal selected"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Keep ingredients attached to meals here, then use the planner to generate grocery items from the selected meal plan entry.
            </p>
            <div className="mt-4 space-y-2">
              {(selectedMeal?.ingredients || []).map((ingredient) => (
                <div className="flex items-center justify-between rounded-lg border border-line bg-cream px-3 py-2" key={ingredient.id}>
                  <span className="font-medium">{ingredient.name}</span>
                  <Badge className="bg-white text-muted">{[ingredient.quantity, ingredient.unit].filter(Boolean).join(" ") || "1"}</Badge>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full" disabled={!selectedMeal}>Plan this meal</Button>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-medium">New meal</h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-6 text-muted">Add meals in the editor so names and ingredients save together.</p>
              <Button className="w-full" variant="secondary" onClick={() => openMealEditor()}>
                <Plus className="size-4" /> Add Meal
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Meal editor</p>
                <h2 className="mt-1 font-serif text-3xl font-medium">{editingMealId ? "Edit meal" : "New meal"}</h2>
              </div>
              <button
                className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-soft-green hover:text-green"
                onClick={() => setEditorOpen(false)}
                aria-label="Close meal editor"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Meal name</span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium"
                  value={mealName}
                  onChange={(event) => setMealName(event.target.value)}
                  placeholder="Meal name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Description</span>
                <textarea
                  className="mt-1 min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium"
                  value={mealDescription}
                  onChange={(event) => setMealDescription(event.target.value)}
                  placeholder="Optional notes"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Ingredients</h3>
                  <Button variant="secondary" onClick={() => setIngredientRows((rows) => [...rows, createIngredientRow()])}>
                    <Plus className="size-4" /> Ingredient
                  </Button>
                </div>
                <div className="space-y-2">
                  {ingredientRows.map((ingredient) => (
                    <div className="grid grid-cols-[minmax(0,1fr)_88px_88px_36px] gap-2" key={ingredient.clientId}>
                      <input
                        className="h-10 rounded-lg border border-line bg-cream px-3 font-medium"
                        value={ingredient.name}
                        onChange={(event) => updateIngredientRow(ingredient.clientId, "name", event.target.value)}
                        placeholder="Ingredient"
                      />
                      <input
                        className="h-10 rounded-lg border border-line bg-cream px-3 font-medium"
                        value={ingredient.quantity}
                        onChange={(event) => updateIngredientRow(ingredient.clientId, "quantity", event.target.value)}
                        placeholder="Qty"
                      />
                      <input
                        className="h-10 rounded-lg border border-line bg-cream px-3 font-medium"
                        value={ingredient.unit}
                        onChange={(event) => updateIngredientRow(ingredient.clientId, "unit", event.target.value)}
                        placeholder="Unit"
                      />
                      <button
                        className="grid size-10 place-items-center rounded-lg text-muted transition hover:bg-danger/5 hover:text-danger"
                        onClick={() => removeIngredientRow(ingredient.clientId)}
                        aria-label="Remove ingredient"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {saveError ? <p className="rounded-lg border border-danger/20 bg-cream px-3 py-2 text-sm font-medium text-danger">{saveError}</p> : null}

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
                <Button onClick={() => void saveMeal()} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save meal
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
