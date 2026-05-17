"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronRight, Loader2, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCurrentHousehold, getHouseholdEvents, getHouseholdTodos, type EventRow, type TodoRow } from "@/lib/supabase/live-data";

function formatMonth(date: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(date));
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(date));
}

function formatEventTime(event: EventRow) {
  if (event.all_day) {
    return "All day";
  }

  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(event.start_at));
}

function toDatetimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 16);
}

function createLinkedTodoRow() {
  return {
    id: crypto.randomUUID(),
    title: "",
  };
}

export default function EventsPage() {
  const [householdId, setHouseholdId] = useState("");
  const [userId, setUserId] = useState("");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [eventStartAt, setEventStartAt] = useState("");
  const [eventAllDay, setEventAllDay] = useState(true);
  const [linkedTodos, setLinkedTodos] = useState<Array<{ id: string; title: string }>>([createLinkedTodoRow()]);
  const [savingEvent, setSavingEvent] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { household, user } = await getCurrentHousehold();
      const [eventRows, todoRows] = await Promise.all([
        getHouseholdEvents(household.id),
        getHouseholdTodos(household.id),
      ]);

      setHouseholdId(household.id);
      setUserId(user.id);
      setEvents(eventRows);
      setTodos(todoRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadActiveEvents() {
      if (active) {
        await loadEvents();
      }
    }

    void loadActiveEvents();

    return () => {
      active = false;
    };
  }, [loadEvents]);

  const now = useMemo(() => new Date(), []);
  const visibleEvents = useMemo(() => {
    return showPast
      ? events
      : events.filter((event) => {
        const end = event.end_at ? new Date(event.end_at) : new Date(event.start_at);
        return end >= now;
      });
  }, [events, now, showPast]);
  const months = [...new Set(visibleEvents.map((event) => formatMonth(event.start_at)))];
  const today = new Date();
  const thisMonthCount = events.filter((event) => {
    const start = new Date(event.start_at);
    return start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear();
  }).length;
  const pastCount = events.length - events.filter((event) => {
    const end = event.end_at ? new Date(event.end_at) : new Date(event.start_at);
    return end >= now;
  }).length;

  function openNewEventModal() {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

    setEventTitle("");
    setEventNotes("");
    setEventStartAt(toDatetimeLocalValue(nextHour));
    setEventAllDay(true);
    setLinkedTodos([createLinkedTodoRow()]);
    setSaveError("");
    setEventModalOpen(true);
  }

  function updateLinkedTodo(id: string, title: string) {
    setLinkedTodos((rows) => rows.map((row) => row.id === id ? { ...row, title } : row));
  }

  function removeLinkedTodo(id: string) {
    setLinkedTodos((rows) => rows.length === 1 ? [createLinkedTodoRow()] : rows.filter((row) => row.id !== id));
  }

  async function saveEvent() {
    const title = eventTitle.trim();
    const startAt = eventStartAt ? new Date(eventStartAt).toISOString() : "";
    const todoTitles = linkedTodos.map((todo) => todo.title.trim()).filter(Boolean);

    if (!title) {
      setSaveError("Event title is required.");
      return;
    }

    if (!startAt) {
      setSaveError("Event date is required.");
      return;
    }

    if (!householdId) {
      setSaveError("Could not find your household.");
      return;
    }

    try {
      setSavingEvent(true);
      setSaveError("");

      const supabase = createBrowserSupabaseClient();
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          household_id: householdId,
          title,
          description: eventNotes.trim() || null,
          start_at: startAt,
          end_at: null,
          all_day: eventAllDay,
          is_holiday: false,
          created_by: userId || null,
        })
        .select("id")
        .single();

      if (eventError || !event) {
        throw new Error(eventError?.message || "Could not create event.");
      }

      if (todoTitles.length) {
        const { error: todosError } = await supabase
          .from("todos")
          .insert(todoTitles.map((todoTitle) => ({
            household_id: householdId,
            event_id: event.id,
            title: todoTitle,
            due_at: startAt,
            completed: false,
            created_by: userId || null,
          })));

        if (todosError) {
          throw new Error(todosError.message);
        }
      }

      await loadEvents();
      setEventModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save event.");
    } finally {
      setSavingEvent(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ward Fam"
        title="Events"
        action={
          <Button onClick={openNewEventModal}>
            <Plus className="size-4" /> New event
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowPast(false)}>
          <Badge className={!showPast ? "border-green bg-soft-green text-success" : "bg-white text-muted"}>Upcoming · {events.length - pastCount}</Badge>
        </button>
        <button onClick={() => setShowPast(true)}>
          <Badge className={showPast ? "border-green bg-soft-green text-success" : "bg-white text-muted"}>All · {events.length}</Badge>
        </button>
        <Badge className="bg-white text-muted">This month · {thisMonthCount}</Badge>
        {pastCount ? <Badge className="bg-white text-muted">Past hidden · {pastCount}</Badge> : null}
        {months.map((month) => <Badge className="bg-white text-muted" key={month}>{month}</Badge>)}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          {loading ? <Card className="p-4 text-sm font-medium text-muted">Loading events...</Card> : null}
          {error ? <Card className="p-4 text-sm font-medium text-danger">{error}</Card> : null}
          {!loading && !error && (months.length ? months : [formatMonth(new Date().toISOString())]).map((month) => {
            const monthEvents = visibleEvents.filter((event) => formatMonth(event.start_at) === month);
            return (
              <div key={month}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-medium">{month}</h2>
                  <p className="text-sm font-medium text-muted">{monthEvents.length ? `${monthEvents.length} event` : ""}</p>
                </div>
                {monthEvents.length ? (
                  <div className="space-y-3">
                    {monthEvents.map((event) => (
                      <Card className="flex items-center gap-4 p-4" key={event.id}>
                        <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-cream text-center">
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted">{formatEventDate(event.start_at).slice(0, 3)}</p>
                            <p className="text-2xl font-medium">{new Date(event.start_at).getDate()}</p>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xl font-medium">{event.title}</p>
                          <p className="text-muted">{formatEventTime(event)}</p>
                          <Badge className="mt-2">
                            <span className="size-2 rounded-full bg-green" />
                            {event.is_holiday ? "Holiday" : `${todos.filter((todo) => todo.event_id === event.id).length} to-dos`}
                          </Badge>
                        </div>
                        <ChevronRight className="size-5 text-line" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="flex items-center justify-between border-dashed bg-cream p-4">
                    <p className="text-muted">No events this month</p>
                    <Button variant="secondary" onClick={openNewEventModal}>
                      <Plus className="size-4" /> Add event
                    </Button>
                  </Card>
                )}
              </div>
            );
          })}
        </section>

        <Card className="h-fit p-4">
          <div className="flex items-center gap-2">
            <CalendarPlus className="size-5 text-green" />
            <h2 className="text-lg font-medium">Event tools</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Button className="w-full" onClick={openNewEventModal}>
              <Plus className="size-4" /> New Event
            </Button>
            <div className="rounded-lg border border-line bg-cream p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Linked to-dos</p>
              <p className="mt-2 text-sm text-muted">
                To-dos created here insert into <span className="font-medium text-ink">todos.event_id</span>, so they also show on the To-dos page.
              </p>
              <div className="mt-3 space-y-2">
                {todos.filter((todo) => todo.event_id).map((todo) => (
                  <div className="rounded-lg bg-white px-3 py-2 text-sm font-medium" key={todo.id}>{todo.title}</div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {eventModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Event builder</p>
                <h2 className="mt-1 font-serif text-3xl font-medium">New event</h2>
              </div>
              <button
                className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-soft-green hover:text-green"
                onClick={() => setEventModalOpen(false)}
                aria-label="Close event builder"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Event title</span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium"
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  placeholder="Event title"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Notes</span>
                <textarea
                  className="mt-1 min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium"
                  value={eventNotes}
                  onChange={(event) => setEventNotes(event.target.value)}
                  placeholder="Optional notes"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">Date</span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium"
                    value={eventStartAt}
                    onChange={(event) => setEventStartAt(event.target.value)}
                    type="datetime-local"
                  />
                </label>
                <label className="mt-6 flex h-10 items-center gap-2 rounded-lg border border-line bg-cream px-3 text-sm font-semibold text-ink">
                  <input
                    className="size-4 accent-[var(--green)]"
                    type="checkbox"
                    checked={eventAllDay}
                    onChange={(event) => setEventAllDay(event.target.checked)}
                  />
                  All day
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Linked to-dos</h3>
                    <p className="text-sm text-muted">These will appear on the To-dos page for this event.</p>
                  </div>
                  <Button variant="secondary" onClick={() => setLinkedTodos((rows) => [...rows, createLinkedTodoRow()])}>
                    <Plus className="size-4" /> To-do
                  </Button>
                </div>
                <div className="space-y-2">
                  {linkedTodos.map((todo) => (
                    <div className="grid grid-cols-[minmax(0,1fr)_36px] gap-2" key={todo.id}>
                      <input
                        className="h-10 rounded-lg border border-line bg-cream px-3 font-medium"
                        value={todo.title}
                        onChange={(event) => updateLinkedTodo(todo.id, event.target.value)}
                        placeholder="To-do title"
                      />
                      <button
                        className="grid size-10 place-items-center rounded-lg text-muted transition hover:bg-danger/5 hover:text-danger"
                        onClick={() => removeLinkedTodo(todo.id)}
                        aria-label="Remove linked to-do"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {saveError ? <p className="rounded-lg border border-danger/20 bg-cream px-3 py-2 text-sm font-medium text-danger">{saveError}</p> : null}

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setEventModalOpen(false)}>Cancel</Button>
                <Button onClick={() => void saveEvent()} disabled={savingEvent}>
                  {savingEvent ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save event
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
