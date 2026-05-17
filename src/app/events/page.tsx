import { CalendarPlus, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { events, todos } from "@/lib/data/sample";

export default function EventsPage() {
  return (
    <div className="space-y-7">
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
        {["All · 2", "This month · 1", "June", "July", "November · 1"].map((filter, index) => (
          <Badge className={index === 0 ? "border-green bg-soft-green text-success" : "bg-white text-muted"} key={filter}>
            {filter}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          {["May 2026", "June 2026", "July 2026", "November 2026"].map((month) => {
            const monthEvents = events.filter((event) => event.month === month);
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
                        <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-cream text-center">
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted">{event.date.slice(0, 3)}</p>
                            <p className="text-3xl font-medium">{event.date.match(/\d+/)?.[0]}</p>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xl font-medium">{event.title}</p>
                          <p className="text-muted">{event.time}</p>
                          <Badge className="mt-2">
                            <span className="size-2 rounded-full" style={{ backgroundColor: event.color }} />
                            {event.category}
                          </Badge>
                        </div>
                        <ChevronRight className="size-5 text-line" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="flex items-center justify-between border-dashed bg-cream p-5">
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

        <Card className="h-fit p-5">
          <div className="flex items-center gap-2">
            <CalendarPlus className="size-5 text-green" />
            <h2 className="text-lg font-medium">Event builder</h2>
          </div>
          <div className="mt-4 space-y-3">
            <input className="h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium" placeholder="Event title" />
            <textarea className="min-h-24 w-full rounded-xl border border-line bg-cream px-3 py-3 font-medium" placeholder="Notes" />
            <input className="h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium" type="datetime-local" />
            <div className="rounded-xl border border-line bg-cream p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Linked to-dos</p>
              <p className="mt-2 text-sm text-muted">
                To-dos created here insert into <span className="font-medium text-ink">todos.event_id</span>, so they also show on the To-dos page.
              </p>
              <div className="mt-3 space-y-2">
                {todos.filter((todo) => todo.eventId).map((todo) => (
                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-medium" key={todo.id}>{todo.title}</div>
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
