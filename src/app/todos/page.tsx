"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCurrentHousehold, getHouseholdEvents, getHouseholdTodos, type EventRow, type TodoRow } from "@/lib/supabase/live-data";

const groups = ["Due soon", "Later this week", "Someday", "Done"] as const;
const filters = ["Open", "This week", "Anytime", "Done"] as const;
type TodoFilter = (typeof filters)[number];

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
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  if (due <= tomorrow) {
    return "Due soon";
  }

  const weekOut = new Date(now);
  weekOut.setDate(now.getDate() + 7);

  return due <= weekOut ? "Later this week" : "Someday";
}

function getEventLabel(event: EventRow) {
  return `${event.title} · ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(event.start_at))}`;
}

function matchesFilter(todo: TodoRow, filter: TodoFilter) {
  const group = getTodoGroup(todo);

  if (filter === "Open") {
    return !todo.completed;
  }

  if (filter === "This week") {
    return group === "Due soon" || group === "Later this week";
  }

  if (filter === "Anytime") {
    return group === "Someday";
  }

  return group === "Done";
}

export default function TodosPage() {
  const [householdId, setHouseholdId] = useState("");
  const [userId, setUserId] = useState("");
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("Open");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [eventId, setEventId] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingTodoIds, setPendingTodoIds] = useState<Set<string>>(new Set());

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { household, user } = await getCurrentHousehold();
      const [todoRows, eventRows] = await Promise.all([
        getHouseholdTodos(household.id),
        getHouseholdEvents(household.id),
      ]);

      setHouseholdId(household.id);
      setUserId(user.id);
      setTodos(todoRows);
      setEvents(eventRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load to-dos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadActiveTodos() {
      if (active) {
        await loadTodos();
      }
    }

    void loadActiveTodos();

    return () => {
      active = false;
    };
  }, [loadTodos]);

  const complete = todos.filter((todo) => todo.completed).length;
  const progress = todos.length ? Math.round((complete / todos.length) * 100) : 0;
  const open = todos.filter((todo) => !todo.completed).length;
  const done = todos.filter((todo) => todo.completed).length;
  const thisWeek = todos.filter((todo) => !todo.completed && matchesFilter(todo, "This week")).length;
  const anytime = todos.filter((todo) => !todo.completed && matchesFilter(todo, "Anytime")).length;
  const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter));
  const visibleGroups = filter === "Open"
    ? groups.filter((group) => group !== "Done")
    : filter === "This week"
      ? groups.filter((group) => group === "Due soon" || group === "Later this week")
      : filter === "Anytime"
        ? groups.filter((group) => group === "Someday")
        : groups.filter((group) => group === "Done");

  function focusForm() {
    document.getElementById("new-todo-title")?.focus();
  }

  function setTodoPending(todoId: string, pending: boolean) {
    setPendingTodoIds((current) => {
      const next = new Set(current);

      if (pending) {
        next.add(todoId);
      } else {
        next.delete(todoId);
      }

      return next;
    });
  }

  async function toggleTodo(todo: TodoRow) {
    const nextCompleted = !todo.completed;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    setTodoPending(todo.id, true);
    setError("");
    setTodos((items) => items.map((item) => item.id === todo.id ? { ...item, completed: nextCompleted, completed_at: completedAt } : item));

    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase
      .from("todos")
      .update({ completed: nextCompleted, completed_at: completedAt })
      .eq("id", todo.id)
      .eq("household_id", todo.household_id);

    if (updateError) {
      setTodos((items) => items.map((item) => item.id === todo.id ? todo : item));
      setError(updateError.message);
    }

    setTodoPending(todo.id, false);
  }

  async function addTodo() {
    const nextTitle = title.trim();

    if (!nextTitle) {
      setError("Enter a to-do title.");
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
        .from("todos")
        .insert({
          household_id: householdId,
          event_id: eventId || null,
          title: nextTitle,
          notes: notes.trim() || null,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
          completed: false,
          created_by: userId || null,
        })
        .select("id, household_id, event_id, title, notes, due_at, completed, completed_at, created_by, created_at")
        .single();

      if (insertError || !data) {
        throw new Error(insertError?.message || "Could not add to-do.");
      }

      setTodos((items) => [data, ...items]);
      setTitle("");
      setNotes("");
      setDueAt("");
      setEventId("");
      setFilter("Open");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to-do.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ward Fam"
        title="To-dos"
        action={
          <Button onClick={focusForm}>
            <Plus className="size-4" /> New to-do
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((label) => {
          const count = label === "Open" ? open : label === "This week" ? thisWeek : label === "Anytime" ? anytime : done;
          const active = filter === label;

          return (
            <button key={label} onClick={() => setFilter(label)}>
              <Badge className={active ? "border-green bg-soft-green text-success" : "bg-white text-muted"}>
                {label} · {count}
              </Badge>
            </button>
          );
        })}
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
          {!loading && !error && visibleGroups.map((group) => {
            const groupTodos = visibleTodos.filter((todo) => getTodoGroup(todo) === group);
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
                        <button
                          className={todo.completed ? "grid size-9 place-items-center rounded-full bg-success text-white transition hover:bg-green" : "grid size-9 place-items-center rounded-full border border-green text-green transition hover:bg-soft-green"}
                          onClick={() => void toggleTodo(todo)}
                          disabled={pendingTodoIds.has(todo.id)}
                          aria-label={todo.completed ? `Mark ${todo.title} open` : `Mark ${todo.title} done`}
                        >
                          {pendingTodoIds.has(todo.id) ? <Loader2 className="size-4 animate-spin" /> : todo.completed ? <Check className="size-4" /> : null}
                        </button>
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
                    <p className="text-muted">{group === "Done" ? "Nothing done yet" : `Nothing due ${group === "Due soon" ? "today or tomorrow" : group.toLowerCase()}`}</p>
                    <Button variant="secondary" onClick={focusForm}>
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
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void addTodo();
            }}
          >
            <input
              id="new-todo-title"
              className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs doing?"
            />
            <textarea
              className="min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes"
            />
            <input
              className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium"
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
            <select
              className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium text-muted"
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
            >
              <option value="">No linked event</option>
              {events.map((event) => (
                <option value={event.id} key={event.id}>{getEventLabel(event)}</option>
              ))}
            </select>
            <p className="text-sm leading-6 text-muted">
              Event-linked items use the same <span className="font-medium text-ink">todos</span> table with an optional <span className="font-medium text-ink">event_id</span>.
            </p>
            <Button className="w-full" disabled={saving || !title.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              <Plus className="size-4" /> Add To-do
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
