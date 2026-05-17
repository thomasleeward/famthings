import { createBrowserSupabaseClient } from "./client";

type EventTodoInput = {
  householdId: string;
  eventId: string;
  title: string;
  notes?: string;
  dueAt?: string;
  createdBy?: string;
};

type GroceryFromMealInput = {
  householdId: string;
  mealPlanEntryId: string;
  ingredients: Array<{ name: string; quantity?: string | null; unit?: string | null }>;
  addedBy?: string;
};

export async function addTodoForEvent(input: EventTodoInput) {
  const supabase = createBrowserSupabaseClient();

  return supabase.from("todos").insert({
    household_id: input.householdId,
    event_id: input.eventId,
    title: input.title,
    notes: input.notes ?? null,
    due_at: input.dueAt ?? null,
    completed: false,
    created_by: input.createdBy ?? null,
  });
}

export async function addMealIngredientsToGroceries(input: GroceryFromMealInput) {
  const supabase = createBrowserSupabaseClient();

  return supabase.from("grocery_items").insert(
    input.ingredients.map((ingredient) => ({
      household_id: input.householdId,
      name: ingredient.name,
      quantity: ingredient.quantity ?? null,
      unit: ingredient.unit ?? null,
      checked: false,
      source: "meal" as const,
      meal_plan_entry_id: input.mealPlanEntryId,
      added_by: input.addedBy ?? null,
    })),
  );
}
