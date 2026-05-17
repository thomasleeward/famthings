"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
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

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");
        const { household } = await getCurrentHousehold();
        const [eventRows, todoRows] = await Promise.all([
          getHouseholdEvents(household.id),
          getHouseholdTodos(household.id),
        ]);

        if (active) {
          setEvents(eventRows);
          setTodos(todoRows);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load events.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const months = [...new Set(events.map((event) => formatMonth(event.start_at)))];
  const today = new Date();
  const thisMonthCount = events.filter((event) => {
    const start = new Date(event.start_at);
    return start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ward Fam"
        title="Events"
        action={
          <Button>
            <Plus className="size-4" /> New event
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[`All · ${events.length}`, `This month · ${thisMonthCount}`, ...months].map((filter, index) => (
          <Badge className={index === 0 ? "border-green bg-soft-green text-success" : "bg-white text-muted"} key={filter}>
            {filter}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          {loading ? <Card className="p-4 text-sm font-medium text-muted">Loading events...</Card> : null}
          {error ? <Card className="p-4 text-sm font-medium text-danger">{error}</Card> : null}
          {!loading && !error && (months.length ? months : [formatMonth(new Date().toISOString())]).map((month) => {
            const monthEvents = events.filter((event) => formatMonth(event.start_at) === month);
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
                    <Button variant="secondary">
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
            <h2 className="text-lg font-medium">Event builder</h2>
          </div>
          <div className="mt-4 space-y-3">
            <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="Event title" />
            <textarea className="min-h-20 w-full rounded-lg border border-line bg-cream px-3 py-3 font-medium" placeholder="Notes" />
            <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" type="datetime-local" />
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
            <Button className="w-full">Save Event</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
