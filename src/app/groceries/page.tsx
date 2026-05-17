"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCurrentHousehold, getHouseholdGroceries, type GroceryRow } from "@/lib/supabase/live-data";

export default function GroceriesPage() {
  const [householdId, setHouseholdId] = useState("");
  const [userId, setUserId] = useState("");
  const [groceries, setGroceries] = useState<GroceryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(new Set());

  const loadGroceries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { household, user } = await getCurrentHousehold();
      const groceryRows = await getHouseholdGroceries(household.id);

      setHouseholdId(household.id);
      setUserId(user.id);
      setGroceries(groceryRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load groceries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadActiveGroceries() {
      if (active) {
        await loadGroceries();
      }
    }

    void loadActiveGroceries();

    return () => {
      active = false;
    };
  }, [loadGroceries]);

  const checked = groceries.filter((item) => item.checked).length;
  const open = groceries.filter((item) => !item.checked);
  const checkedItems = groceries.filter((item) => item.checked);
  const progress = groceries.length ? (checked / groceries.length) * 100 : 0;

  function setItemPending(itemId: string, pending: boolean) {
    setPendingItemIds((current) => {
      const next = new Set(current);

      if (pending) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }

      return next;
    });
  }

  async function toggleItemChecked(item: GroceryRow) {
    setItemPending(item.id, true);
    setError("");
    setGroceries((items) => items.map((next) => next.id === item.id ? { ...next, checked: !item.checked } : next));

    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase
      .from("grocery_items")
      .update({ checked: !item.checked })
      .eq("id", item.id)
      .eq("household_id", item.household_id);

    if (updateError) {
      setGroceries((items) => items.map((next) => next.id === item.id ? item : next));
      setError(updateError.message);
    }

    setItemPending(item.id, false);
  }

  async function addItem() {
    const name = newItemName.trim();
    const quantity = newItemQuantity.trim() || null;

    if (!name) {
      setError("Enter an item name.");
      return;
    }

    if (!householdId) {
      setError("Could not find your household.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const supabase = createBrowserSupabaseClient();
      const { data, error: insertError } = await supabase
        .from("grocery_items")
        .insert({
          household_id: householdId,
          name,
          quantity,
          unit: null,
          checked: false,
          source: "manual",
          added_by: userId || null,
        })
        .select("id, household_id, name, quantity, unit, checked, source, meal_plan_entry_id, added_by, created_at")
        .single();

      if (insertError || !data) {
        throw new Error(insertError?.message || "Could not add item.");
      }

      setGroceries((items) => [data, ...items]);
      setNewItemName("");
      setNewItemQuantity("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add item.");
    } finally {
      setSaving(false);
    }
  }

  async function clearCheckedItems() {
    if (!checkedItems.length || !householdId) {
      return;
    }

    const ids = checkedItems.map((item) => item.id);
    const previous = groceries;

    setGroceries((items) => items.filter((item) => !ids.includes(item.id)));
    setError("");

    const supabase = createBrowserSupabaseClient();
    const { error: deleteError } = await supabase
      .from("grocery_items")
      .delete()
      .eq("household_id", householdId)
      .in("id", ids);

    if (deleteError) {
      setGroceries(previous);
      setError(deleteError.message);
    }
  }

  async function clearList() {
    if (!groceries.length || !householdId) {
      return;
    }

    const previous = groceries;

    setGroceries([]);
    setError("");

    const supabase = createBrowserSupabaseClient();
    const { error: deleteError } = await supabase
      .from("grocery_items")
      .delete()
      .eq("household_id", householdId);

    if (deleteError) {
      setGroceries(previous);
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ward Fam"
        title="Groceries"
      />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-muted">{checked} of {groceries.length} in cart</p>
          <p className="font-semibold text-success">{open.length} left</p>
        </div>
        <Progress value={progress} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="font-serif text-2xl font-medium">To get</h2>
            <Badge>{open.length}</Badge>
          </div>
          <div className="divide-y divide-line">
            {loading ? (
              <div className="p-4 text-sm font-medium text-muted">Loading groceries...</div>
            ) : error ? (
              <div className="p-4 text-sm font-medium text-danger">{error}</div>
            ) : null}
            {!loading && open.length ? open.map((item) => (
              <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 p-4" key={item.id}>
                <button
                  className="grid size-7 place-items-center rounded-full border border-green text-green transition hover:bg-soft-green disabled:opacity-50"
                  onClick={() => void toggleItemChecked(item)}
                  disabled={pendingItemIds.has(item.id)}
                  aria-label={`Mark ${item.name} in cart`}
                >
                  {pendingItemIds.has(item.id) ? <Loader2 className="size-3.5 animate-spin" /> : null}
                </button>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm capitalize text-muted">{item.source}</p>
                </div>
                {item.quantity || item.unit ? <Badge className="bg-cream text-muted">{[item.quantity, item.unit].filter(Boolean).join(" ")}</Badge> : null}
              </div>
            )) : !loading && !error ? (
              <div className="p-4 text-sm font-medium text-muted">No grocery items yet.</div>
            ) : null}
            {checkedItems.length ? (
              <div className="bg-cream/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">In cart</p>
                <div className="space-y-2">
                  {checkedItems.map((item) => (
                    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4" key={item.id}>
                      <button
                        className="grid size-7 place-items-center rounded-full border border-green bg-soft-green text-green transition hover:bg-white disabled:opacity-50"
                        onClick={() => void toggleItemChecked(item)}
                        disabled={pendingItemIds.has(item.id)}
                        aria-label={`Move ${item.name} back to list`}
                      >
                        {pendingItemIds.has(item.id) ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-4" />}
                      </button>
                      <div>
                        <p className="font-semibold text-muted line-through">{item.name}</p>
                        <p className="text-sm capitalize text-muted">{item.source}</p>
                      </div>
                      {item.quantity || item.unit ? <Badge className="bg-white text-muted">{[item.quantity, item.unit].filter(Boolean).join(" ")}</Badge> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <form
              className="grid grid-cols-[36px_minmax(0,1fr)_120px_auto] items-center gap-3 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void addItem();
              }}
            >
              <div className="grid size-7 place-items-center rounded-full border border-green text-green">
                <Plus className="size-4" />
              </div>
              <input
                id="new-grocery-item"
                className="h-10 min-w-0 bg-transparent font-medium outline-none"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                placeholder="New item"
              />
              <input
                className="h-10 min-w-0 rounded-lg border border-line bg-cream px-3 font-medium outline-none"
                value={newItemQuantity}
                onChange={(event) => setNewItemQuantity(event.target.value)}
                placeholder="Qty"
              />
              <Button variant="secondary" disabled={saving || !newItemName.trim()}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Add
              </Button>
            </form>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-green" />
              <h2 className="text-lg font-medium">Grocery flow</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Manual items and meal-generated ingredients live together in <span className="font-medium text-ink">grocery_items</span>. Meal rows should keep <span className="font-medium text-ink">meal_plan_entry_id</span> for traceability.
            </p>
          </Card>
          <Card className="p-4">
            <h2 className="text-lg font-medium">Cart actions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={!checked} onClick={() => void clearCheckedItems()}>Clear cart ({checked})</Button>
              <Button variant="danger" disabled={!groceries.length} onClick={() => void clearList()}>
                <Trash2 className="size-4" /> Clear list ({groceries.length})
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
