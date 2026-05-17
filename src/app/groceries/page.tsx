import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { groceries } from "@/lib/data/sample";

export default function GroceriesPage() {
  const checked = groceries.filter((item) => item.checked).length;
  const open = groceries.filter((item) => !item.checked);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ward Fam"
        title="Groceries"
        action={
          <Button>
            <Plus className="size-4" /> Add item
          </Button>
        }
      />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-muted">{checked} of {groceries.length} in cart</p>
          <p className="font-semibold text-success">{open.length} left</p>
        </div>
        <Progress value={(checked / groceries.length) * 100} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="font-serif text-2xl font-medium">To get</h2>
            <Badge>{open.length}</Badge>
          </div>
          <div className="divide-y divide-line">
            {open.map((item) => (
              <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 p-4" key={item.id}>
                <span className="size-7 rounded-full border border-green" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm capitalize text-muted">{item.source}</p>
                </div>
                {item.quantity ? <Badge className="bg-cream text-muted">{item.quantity}</Badge> : null}
              </div>
            ))}
            <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 p-4">
              <div className="grid size-7 place-items-center rounded-full border border-green text-green">
                <Plus className="size-4" />
              </div>
              <input className="h-10 bg-transparent font-medium outline-none" placeholder="New item" />
              <Button variant="secondary">Add</Button>
            </div>
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
              <Button variant="secondary" disabled>Clear cart ({checked})</Button>
              <Button variant="danger">
                <Trash2 className="size-4" /> Clear list ({groceries.length})
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
