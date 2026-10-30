import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Notice, controlClass, proseClass } from "@/pages/parlor/fields";
import { formatClock } from "@/parlor/format";
import type { GuestScheduleSlot, GuestView } from "@/parlor/types";

type Act = (body: Record<string, unknown>) => Promise<void>;

function slotsByRoom(schedule: GuestScheduleSlot[]) {
  const rooms: { name: string; slots: GuestScheduleSlot[] }[] = [];
  for (const slot of [...schedule].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const existing = rooms.find((room) => room.name === slot.roomName);
    if (existing) existing.slots.push(slot);
    else rooms.push({ name: slot.roomName, slots: [slot] });
  }
  return rooms;
}

function OfferForm({ slot, act, pending }: { slot: GuestScheduleSlot; act: Act; pending: boolean }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await act({ type: "propose", slotId: slot.id, title, note });
      setTitle("");
      setNote("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The house could not save that.");
    }
  }

  if (slot.yourProposal?.status === "pending") {
    return <p className="text-aside text-foreground-muted">Your offer is with the host.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {slot.yourProposal?.status === "declined" ? (
        <p className="text-aside text-foreground-muted">The host kept this hour open.</p>
      ) : null}
      <Field label="What would you host?">
        <input className={controlClass} value={title} onChange={(event) => setTitle(event.target.value)} required />
      </Field>
      <Field label="A line about it">
        <textarea className={proseClass} rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      {error ? <Notice>{error}</Notice> : null}
      <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal text-center">
        Offer this table
      </Button>
    </form>
  );
}

export function Evening({
  view,
  act,
  pending,
}: {
  view: GuestView;
  act: Act;
  pending: boolean;
}) {
  const { event, guest } = view;
  const attending = guest.rsvp === "yes";
  const rooms = slotsByRoom(view.schedule);

  return (
    <div className="flex flex-col gap-8 text-left">
      <p className="text-body text-foreground">{event.evening.arrival}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {event.evening.rooms.map((room) => (
          <article
            key={room.id}
            className="flex flex-col gap-2 rounded-lg border border-foreground-faint bg-background p-6 text-foreground"
          >
            <h3 className="text-subtitle text-foreground">{room.name}</h3>
            <p className="text-body text-foreground-muted">{room.description}</p>
          </article>
        ))}
      </div>
      <p className="text-body text-foreground">{event.evening.games}</p>

      <section className="flex flex-col gap-4">
        <h3 className="text-subtitle text-foreground">A draft of the hours</h3>
        <p className="text-aside text-foreground-muted">{event.scheduleNote}</p>
        {attending ? null : (
          <p className="text-aside text-foreground-muted">
            Say you will attend before taking a seat or offering a game.
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <article
              key={room.name}
              className="flex flex-col gap-4 rounded-lg border border-foreground-faint bg-background p-6 text-foreground"
            >
              <h4 className="text-label text-foreground">{room.name}</h4>
              <ul className="flex flex-col gap-4">
                {room.slots.map((slot) => (
                  <li key={slot.id} className="flex flex-col gap-2 border-t border-foreground-faint pt-4 first:border-t-0 first:pt-0">
                    <p className="text-label text-foreground-muted">
                      {formatClock(slot.startsAt)} – {formatClock(slot.endsAt)}
                    </p>
                    <p className="text-body text-foreground">{slot.title || "Open"}</p>
                    {slot.description ? (
                      <p className="text-aside text-foreground-muted">{slot.description}</p>
                    ) : null}
                    {slot.kind === "drop-in" ? (
                      <p className="text-aside text-foreground-muted">Drop in. No seat to reserve.</p>
                    ) : null}
                    {slot.kind === "seated" ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-label text-foreground-muted">
                          {slot.seatsLeft} of {slot.seatLimit} seats open
                        </p>
                        {attending && slot.reservedByYou ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={pending}
                            className="w-full whitespace-normal text-center"
                            onClick={() => {
                            void act({ type: "release", slotId: slot.id }).catch(() => undefined);
                          }}
                          >
                            Release my seat
                          </Button>
                        ) : null}
                        {attending && !slot.reservedByYou && (slot.seatsLeft ?? 0) > 0 ? (
                          <Button
                            type="button"
                            disabled={pending}
                            className="w-full whitespace-normal text-center"
                            onClick={() => {
                            void act({ type: "reserve", slotId: slot.id }).catch(() => undefined);
                          }}
                          >
                            Reserve a seat
                          </Button>
                        ) : null}
                        {attending && !slot.reservedByYou && slot.seatsLeft === 0 ? (
                          <p className="text-aside text-foreground-muted">This table is full.</p>
                        ) : null}
                      </div>
                    ) : null}
                    {slot.kind === "open" && attending ? (
                      <OfferForm slot={slot} act={act} pending={pending} />
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
