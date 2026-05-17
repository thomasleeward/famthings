import { createBrowserSupabaseClient } from "./client";
import type { Database } from "@/types/database";

export type Household = Database["public"]["Tables"]["households"]["Row"];
export type HouseholdMember = Database["public"]["Tables"]["household_members"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type TodoRow = Database["public"]["Tables"]["todos"]["Row"];
export type GroceryRow = Database["public"]["Tables"]["grocery_items"]["Row"];
export type MealRow = Database["public"]["Tables"]["meals"]["Row"];
export type MealIngredientRow = Database["public"]["Tables"]["meal_ingredients"]["Row"];
export type MealPlanEntryRow = Database["public"]["Tables"]["meal_plan_entries"]["Row"];

export type MealWithIngredients = MealRow & {
  ingredients: MealIngredientRow[];
};

export type MealPlanEntryWithMeal = MealPlanEntryRow & {
  meal: MealRow | null;
};

export async function getCurrentHousehold() {
  const supabase = createBrowserSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Could not load the current user.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("id, household_id, user_id, role, joined_at")
    .eq("user_id", authData.user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new Error(membershipError?.message || "You are not currently in a household.");
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, name, created_by, created_at")
    .eq("id", membership.household_id)
    .single();

  if (householdError || !household) {
    throw new Error(householdError?.message || "Could not load household.");
  }

  return { supabase, user: authData.user, household, membership };
}

export async function getHouseholdEvents(householdId: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, household_id, title, description, start_at, end_at, all_day, category_id, is_holiday, recurrence_rule, link, created_by, created_at")
    .eq("household_id", householdId)
    .order("start_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getHouseholdTodos(householdId: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("todos")
    .select("id, household_id, event_id, title, notes, due_at, completed, completed_at, created_by, created_at")
    .eq("household_id", householdId)
    .order("completed", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getHouseholdGroceries(householdId: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("grocery_items")
    .select("id, household_id, name, quantity, unit, checked, source, meal_plan_entry_id, added_by, created_at")
    .eq("household_id", householdId)
    .order("checked", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getHouseholdMeals(householdId: string): Promise<MealWithIngredients[]> {
  const supabase = createBrowserSupabaseClient();
  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select("id, household_id, name, description, created_by, created_at")
    .eq("household_id", householdId)
    .order("name", { ascending: true });

  if (mealsError) {
    throw new Error(mealsError.message);
  }

  const mealIds = (meals || []).map((meal) => meal.id);

  if (!mealIds.length) {
    return [];
  }

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("meal_ingredients")
    .select("id, meal_id, name, quantity, unit")
    .in("meal_id", mealIds)
    .order("name", { ascending: true });

  if (ingredientsError) {
    throw new Error(ingredientsError.message);
  }

  const ingredientsByMeal = new Map<string, MealIngredientRow[]>();
  for (const ingredient of ingredients || []) {
    const next = ingredientsByMeal.get(ingredient.meal_id) || [];
    next.push(ingredient);
    ingredientsByMeal.set(ingredient.meal_id, next);
  }

  return (meals || []).map((meal) => ({
    ...meal,
    ingredients: ingredientsByMeal.get(meal.id) || [],
  }));
}

export async function getHouseholdMealPlanEntries(householdId: string, startDate: string, endDate: string): Promise<MealPlanEntryWithMeal[]> {
  const supabase = createBrowserSupabaseClient();
  const { data: entries, error: entriesError } = await supabase
    .from("meal_plan_entries")
    .select("id, household_id, meal_id, planned_date, meal_slot")
    .eq("household_id", householdId)
    .gte("planned_date", startDate)
    .lte("planned_date", endDate)
    .order("planned_date", { ascending: true });

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  const mealIds = [...new Set((entries || []).map((entry) => entry.meal_id))];

  if (!mealIds.length) {
    return [];
  }

  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select("id, household_id, name, description, created_by, created_at")
    .in("id", mealIds);

  if (mealsError) {
    throw new Error(mealsError.message);
  }

  const mealById = new Map((meals || []).map((meal) => [meal.id, meal]));

  return (entries || []).map((entry) => ({
    ...entry,
    meal: mealById.get(entry.meal_id) || null,
  }));
}
