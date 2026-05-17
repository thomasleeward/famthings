import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { todos } from "@/lib/data/sample";

export default function TodosPage() {
  const complete = todos.filter((todo) => todo.completed).length;
  const progress = Math.round((complete / todos.length) * 100);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Ward Fam"
        title="To-dos"
        action={
          <Button>
            <Plus className="size-4" /> New to-do
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {["Open · 1", "This week", "Anytime · 1", "Done · 1"].map((filter, index) => (
          <Badge className={index === 0 ? "border-green bg-soft-green text-success" : "bg-white text-muted"} key={filter}>
            {filter}
          </Badge>
        ))}
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-muted">{complete} of {todos.length} done</p>
          <p className="font-semibold text-success">{progress}%</p>
        </div>
        <Progress value={progress} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          {["Due soon", "Later this week", "Someday", "Done"].map((group) => {
            const groupTodos = todos.filter((todo) => todo.period === group);
            return (
              <div key={group}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-medium">{group}</h2>
                  <p className="text-sm text-muted">{groupTodos.length}</p>
                </div>
                {groupTodos.length ? (
                  <div className="space-y-3">
                    {groupTodos.map((todo) => (
                      <Card className="flex items-center gap-4 p-4" key={todo.id}>
                        <span className={todo.completed ? "grid size-9 place-items-center rounded-full bg-success text-white" : "size-9 rounded-full border border-green"}>{todo.completed ? "✓" : ""}</span>
                        <div className="min-w-0">
                          <p className={todo.completed ? "font-semibold text-muted line-through" : "font-semibold"}>{todo.title}</p>
                          <p className="flex items-center gap-1 text-sm text-muted">
                            <CalendarDays className="size-3.5" /> {todo.due}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="flex items-center justify-between border-dashed bg-cream p-5">
                    <p className="text-muted">Nothing due {group === "Due soon" ? "today or tomorrow" : group.toLowerCase()}</p>
                    <Button variant="secondary">
                      <Plus className="size-4" /> Add a to-do
                    </Button>
                  </Card>
                )}
              </div>
            );
          })}
        </section>

        <Card className="h-fit p-5">
          <h2 className="text-lg font-medium">New To-do</h2>
          <div className="mt-4 space-y-3">
            <input className="h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium" placeholder="What needs doing?" />
            <textarea className="min-h-24 w-full rounded-xl border border-line bg-cream px-3 py-3 font-medium" placeholder="Notes" />
            <input className="h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium" type="datetime-local" />
            <select className="h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium text-muted">
              <option>No linked event</option>
              <option>Thomas Birthday</option>
              <option>Mother&apos;s Day</option>
            </select>
            <p className="text-sm leading-6 text-muted">
              Event-linked items use the same <span className="font-medium text-ink">todos</span> table with an optional <span className="font-medium text-ink">event_id</span>.
            </p>
            <Button className="w-full">
              <Plus className="size-4" /> Add To-do
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
