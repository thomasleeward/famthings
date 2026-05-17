import Link from "next/link";
import { ArrowLeft, ChevronRight, Plus, Search, Soup, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { meals } from "@/lib/data/sample";

const filters = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

export default function MealLibraryPage() {
  const featuredMeal = meals[1];

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
            <Button>
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
            {meals.map((meal) => (
              <Card className="group flex items-center gap-4 p-4 transition hover:border-green" key={meal.id}>
                <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-cream text-muted group-hover:text-green">
                  <Soup className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-lg font-medium">{meal.name}</p>
                    {meal.ingredients > 0 ? <Star className="size-4 fill-lime text-ink" /> : null}
                  </div>
                  <p className="text-sm text-muted">
                    {meal.ingredients ? `${meal.ingredients} ingredients` : "No ingredients yet"} · {meal.slot}
                  </p>
                </div>
                <ChevronRight className="size-5 text-line group-hover:text-green" />
              </Card>
            ))}
          </div>

          <Card className="border-dashed bg-cream p-6 text-center">
            <h2 className="text-lg font-medium">Build out your library</h2>
            <p className="mt-2 text-muted">Add family favorites to plan them quickly later.</p>
            <Button className="mt-4" variant="secondary">
              <Plus className="size-4" /> Add another meal
            </Button>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Selected meal</p>
            <h2 className="mt-2 font-serif text-3xl font-medium">{featuredMeal.name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Keep ingredients attached to meals here, then use the planner to generate grocery items from the selected meal plan entry.
            </p>
            <div className="mt-4 space-y-2">
              {["Chicken breast", "Potatoes", "Broccoli"].map((ingredient) => (
                <div className="flex items-center justify-between rounded-lg border border-line bg-cream px-3 py-2" key={ingredient}>
                  <span className="font-medium">{ingredient}</span>
                  <Badge className="bg-white text-muted">1</Badge>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full">Plan this meal</Button>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-medium">New meal</h2>
            <div className="mt-4 space-y-3">
              <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="Meal name" />
              <textarea className="min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium" placeholder="Description" />
              <div className="grid grid-cols-[1fr_72px_72px] gap-2">
                <input className="h-10 rounded-lg border border-line bg-cream px-3" placeholder="Ingredient" />
                <input className="h-10 rounded-lg border border-line bg-cream px-3" placeholder="Qty" />
                <input className="h-10 rounded-lg border border-line bg-cream px-3" placeholder="Unit" />
              </div>
              <Button className="w-full" variant="secondary">
                <Plus className="size-4" /> Add Meal
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
