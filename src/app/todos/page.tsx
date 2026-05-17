"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentHousehold, getHouseholdTodos, type TodoRow } from "@/lib/supabase/live-data";

const groups = ["Due soon", "Later this week", "Someday", "Done"] as const;

function formatDue(todo: TodoRow) {
  if (todo.completed && todo.completed_at) {
    return `Done ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(todo.completed_at))}`;
  }

  if (!todo.due_at) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(todo.due_at));
}

function getTodoGroup(todo: TodoRow): (typeof groups)[number] {
  if (todo.completed) {
    return "Done";
  }

  if (!todo.due_at) {
    return "Someday";
  }

  const due = new Date(todo.due_at);
  const now = new Date();
  const weekOut = new Date(now);
  weekOut.setDate(now.getDate() + 7);

  return due <= weekOut ? "Due soon" : "Later this week";
}

export default function TodosPage() {
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTodos() {
      try {
        setLoading(true);
        setError("");
        const { household } = await getCurrentHousehold();
        const todoRows = await getHouseholdTodos(household.id);

        if (active) {
          setTodos(todoRows);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load to-dos.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTodos();

    return () => {
      active = false;
    };
  }, []);

  const complete = todos.filter((todo) => todo.completed).length;
  const progress = todos.length ? Math.round((complete / todos.length) * 100) : 0;
  const open = todos.filter((todo) => !todo.completed).length;
  const done = todos.filter((todo) => todo.completed).length;

  return (
    <div className="space-y-6">
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
        {[`Open · ${open}`, "This week", "Anytime", `Done · ${done}`].map((filter, index) => (
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          {loading ? <Card className="p-4 text-sm font-medium text-muted">Loading to-dos...</Card> : null}
          {error ? <Card className="p-4 text-sm font-medium text-danger">{error}</Card> : null}
          {!loading && !error && groups.map((group) => {
            const groupTodos = todos.filter((todo) => getTodoGroup(todo) === group);
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
                            <CalendarDays className="size-3.5" /> {formatDue(todo)}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="flex items-center justify-between border-dashed bg-cream p-4">
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

        <Card className="h-fit p-4">
          <h2 className="text-lg font-medium">New To-do</h2>
          <div className="mt-4 space-y-3">
            <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="What needs doing?" />
            <textarea className="min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium" placeholder="Notes" />
            <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" type="datetime-local" />
            <select className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium text-muted">
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
