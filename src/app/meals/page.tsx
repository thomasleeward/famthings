import { BookOpen, CalendarPlus, Plus, Soup } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { mealPlan, meals } from "@/lib/data/sample";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function MealsPage() {
  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Ward Fam"
        title="Meals"
        action={
          <div className="flex gap-2">
            <Button variant="secondary">
              <BookOpen className="size-4" /> Meal library
            </Button>
            <Button>
              <Plus className="size-4" /> New meal
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {mealPlan.map((day, index) => (
              <button className={index === 0 ? "rounded-lg bg-soft-lime p-3 text-center font-black text-green" : "rounded-lg border border-line bg-white p-3 text-center font-black text-muted"} key={day.day}>
                <span className="block text-xs uppercase">{day.day.split(" ")[0]}</span>
                <span className="text-2xl">{day.day.split(" ")[1]}</span>
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-xl font-black">Weekly planner</h2>
                <p className="text-sm text-muted">Plan meals, then add ingredients to groceries from the selected meal.</p>
              </div>
              <Badge>2 planned</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-cream text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    {slots.map((slot) => <th className="px-4 py-3" key={slot}>{slot}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {mealPlan.map((day) => (
                    <tr className="border-t border-line" key={day.day}>
                      <td className="px-4 py-4 font-black">{day.day}</td>
                      {slots.map((slot) => (
                        <td className="px-4 py-4" key={slot}>
                          {day[slot] ? (
                            <span className="rounded-full bg-soft-green px-3 py-1 font-bold text-success">{day[slot]}</span>
                          ) : (
                            <button className="font-bold text-green">+ plan</button>
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
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Meal library</h2>
              <Badge>{meals.length} meals</Badge>
            </div>
            <input className="mt-4 h-11 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="Search meals..." />
            <div className="mt-4 space-y-3">
              {meals.map((meal) => (
                <div className="flex items-center gap-3 rounded-lg border border-line p-3" key={meal.id}>
                  <div className="grid size-10 place-items-center rounded-lg bg-cream text-muted">
                    <Soup className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{meal.name}</p>
                    <p className="text-sm text-muted">{meal.ingredients ? `${meal.ingredients} ingredients` : "No ingredients yet"}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <CalendarPlus className="size-5 text-green" />
              <h2 className="text-lg font-black">New meal</h2>
            </div>
            <div className="mt-4 space-y-3">
              <input className="h-11 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="Meal name" />
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
                When a meal plan entry is saved, its ingredients can be inserted into <span className="font-bold text-ink">grocery_items</span> with source <span className="font-bold text-ink">meal</span>.
              </p>
              <Button className="w-full">Add Meal</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
