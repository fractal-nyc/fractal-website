import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Notice, controlClass, proseClass } from "@/pages/parlor/fields";
import { loadDesk, loginDesk, logoutDesk, saveDesk } from "@/parlor/client";
import { formatClock, categoryPhrase } from "@/parlor/format";
import { HOUSE_STAFF_ASK } from "@/parlor/templates";
import type { AdminPayload, Category, Guest, ParlorEvent, ScheduleSlot } from "@/parlor/types";

function rsvpLabel(guest: Guest): string {
  if (guest.rsvp === "yes") return "Coming";
  if (guest.rsvp === "no") return "Declined";
  return "Waiting";
}

export function AdminDesk() {
  const [password, setPassword] = useState("");
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [locked, setLocked] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadDesk()
      .then((next) => {
        if (cancelled) return;
        setPayload(next);
        setLocked(false);
      })
      .catch(() => {
        if (!cancelled) setLocked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await loginDesk(password);
      setPayload(await loadDesk());
      setLocked(false);
      setPassword("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The desk stayed locked.");
    } finally {
      setPending(false);
    }
  }

  async function save(body: Record<string, unknown>) {
    setPending(true);
    setError(null);
    try {
      setPayload(await saveDesk(body));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The house could not save that.");
      throw caught;
    } finally {
      setPending(false);
    }
  }

  if (locked || !payload) {
    return (
      <form onSubmit={unlock} className="flex flex-col gap-6" data-parlor-admin-login>
        <div className="flex flex-col gap-3 text-center">
          <p className="text-label text-foreground-muted">Parlor</p>
          <h1 className="text-title text-foreground">The desk</h1>
          <p className="text-aside text-foreground-muted">For the host of the evening.</p>
        </div>
        <Field label="Password">
          <input
            className={controlClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" disabled={pending} className="w-full whitespace-normal text-center">
          {pending ? "One moment" : "Unlock the desk"}
        </Button>
      </form>
    );
  }

  const { state, summary, store } = payload;

  return (
    <div className="flex flex-col gap-10 text-left" data-parlor-admin>
      <div className="flex flex-col gap-3">
        <p className="text-label text-foreground-muted">Parlor</p>
        <h1 className="text-title text-foreground">The desk</h1>
        <p className="text-aside text-foreground-muted">{store.note}</p>
        {state.guests.some((guest) => guest.example) ? (
          <p className="text-aside text-foreground-muted">
            Example guests are sample data. Remove them before the real invitations go out.
          </p>
        ) : null}
        {error ? <Notice>{error}</Notice> : null}
      </div>

      <section className="flex flex-col gap-3" aria-label="Responses">
        <p className="text-label text-foreground">
          Coming {summary.coming} · Declined {summary.declined} · Waiting {summary.waiting}
        </p>
        <p className="text-label text-foreground-muted">
          Gentlemen {summary.seats.gentleman.taken} / {summary.seats.gentleman.capacity}
          {" · "}
          Ladies {summary.seats.lady.taken} / {summary.seats.lady.capacity}
        </p>
        <ul className="flex flex-col gap-3">
          {state.guests.map((guest) => (
            <li key={guest.id} className="border-t border-foreground-faint pt-3">
              <p className="text-body text-foreground">
                {guest.name} — {rsvpLabel(guest)}
                {guest.plusOne
                  ? ` · plus-one ${guest.plusOne.status} (${categoryPhrase(guest.plusOne.category)})`
                  : ""}
              </p>
              {guest.asks.length > 0 ? (
                <p className="text-aside text-foreground-muted">
                  {guest.asks
                    .map((ask) => `${ask.title}: ${ask.response ?? "unanswered"}`)
                    .join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <CapacityForm
        gentleman={state.capacity.gentleman}
        lady={state.capacity.lady}
        pending={pending}
        onSave={(gentleman, lady) => save({ type: "capacity", gentleman, lady })}
      />

      <section className="flex flex-col gap-6">
        <h2 className="text-subtitle text-foreground">Guests</h2>
        <NewGuest pending={pending} onSave={save} />
        {state.guests.map((guest) => (
          <GuestCard key={guest.id} guest={guest} pending={pending} onSave={save} />
        ))}
      </section>

      <EventForm event={state.event} version={state.version} pending={pending} onSave={save} />

      <ReferralList
        payload={payload}
        pending={pending}
        onRemove={(referralId) => save({ type: "referral-remove", referralId })}
      />

      <BountyEditor payload={payload} pending={pending} onSave={save} />

      <ScheduleEditor payload={payload} pending={pending} onSave={save} />

      <Button
        type="button"
        variant="outline"
        className="w-full whitespace-normal text-center"
        onClick={() => {
          void logoutDesk().then(() => {
            setPayload(null);
            setLocked(true);
          });
        }}
      >
        Lock the desk
      </Button>
    </div>
  );
}

function CapacityForm({
  gentleman,
  lady,
  pending,
  onSave,
}: {
  gentleman: number;
  lady: number;
  pending: boolean;
  onSave: (gentleman: number, lady: number) => Promise<void>;
}) {
  const [men, setMen] = useState(String(gentleman));
  const [women, setWomen] = useState(String(lady));

  useEffect(() => {
    setMen(String(gentleman));
    setWomen(String(lady));
  }, [gentleman, lady]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(Number(men), Number(women)).catch(() => undefined);
      }}
    >
      <h2 className="text-subtitle text-foreground">Seats</h2>
      <p className="text-aside text-foreground-muted">
        Placeholder caps. A plus-one is offered only while a seat remains. Guests never see these numbers.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Gentlemen">
          <input className={controlClass} type="number" min={0} max={500} value={men} onChange={(event) => setMen(event.target.value)} />
        </Field>
        <Field label="Ladies">
          <input className={controlClass} type="number" min={0} max={500} value={women} onChange={(event) => setWomen(event.target.value)} />
        </Field>
      </div>
      <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal text-center">
        Save seats
      </Button>
    </form>
  );
}

function NewGuest({
  pending,
  onSave,
}: {
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("lady");

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-foreground-faint p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave({ type: "guest-upsert", name, email, category })
          .then(() => {
            setName("");
            setEmail("");
          })
          .catch(() => undefined);
      }}
    >
      <h3 className="text-subtitle text-foreground">Add a guest</h3>
      <Field label="Name">
        <input className={controlClass} required value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label="Email">
        <input className={controlClass} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </Field>
      <Field label="Category">
        <select className={controlClass} value={category} onChange={(event) => setCategory(event.target.value as Category)}>
          <option value="lady">Lady</option>
          <option value="gentleman">Gentleman</option>
        </select>
      </Field>
      <Button type="submit" disabled={pending} className="w-full whitespace-normal text-center">
        Add guest
      </Button>
    </form>
  );
}

function GuestCard({
  guest,
  pending,
  onSave,
}: {
  guest: Guest;
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email);
  const [category, setCategory] = useState<Category>(guest.category);
  const [askTitle, setAskTitle] = useState("");
  const [askMessage, setAskMessage] = useState("");
  const link = `${window.location.origin}/parlor?g=${encodeURIComponent(guest.token)}`;

  useEffect(() => {
    setName(guest.name);
    setEmail(guest.email);
    setCategory(guest.category);
  }, [guest.name, guest.email, guest.category]);

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-lg border border-foreground-faint bg-background p-6 text-foreground">
      <div className="flex flex-col gap-2">
        <h3 className="text-subtitle text-foreground">{guest.name}</h3>
        <p className="text-label text-foreground-muted">
          {rsvpLabel(guest)}
          {guest.example ? " · Example" : ""}
          {" · "}
          {guest.category}
        </p>
      </div>
      <Field label="Invitation link">
        <input
          className="w-full min-w-0 rounded-md border border-foreground/20 bg-background px-4 py-4 font-mono text-sm normal-case tracking-normal text-foreground [overflow-wrap:anywhere]"
          readOnly
          value={link}
          aria-label={`Invitation link for ${guest.name}`}
          onFocus={(event) => event.currentTarget.select()}
        />
      </Field>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onSave({ type: "guest-upsert", id: guest.id, name, email, category }).catch(() => undefined);
        }}
      >
        <Field label="Name">
          <input className={controlClass} required value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Email">
          <input className={controlClass} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Category">
          <select className={controlClass} value={category} onChange={(event) => setCategory(event.target.value as Category)}>
            <option value="lady">Lady</option>
            <option value="gentleman">Gentleman</option>
          </select>
        </Field>
        <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal text-center">
          Save guest
        </Button>
      </form>

      {guest.plusOne ? (
        <div className="flex flex-col gap-3">
          <p className="text-body text-foreground">
            Plus-one {guest.plusOne.name || "(no name)"}, {categoryPhrase(guest.plusOne.category)} — {guest.plusOne.status}
          </p>
          <div className="flex flex-col gap-3">
            <Button type="button" disabled={pending} variant="outline" className="w-full whitespace-normal" onClick={() => void onSave({ type: "plus-one", guestId: guest.id, status: "accepted" }).catch(() => undefined)}>
              Hold the seat
            </Button>
            <Button type="button" disabled={pending} variant="outline" className="w-full whitespace-normal" onClick={() => void onSave({ type: "plus-one", guestId: guest.id, status: "waitlist" }).catch(() => undefined)}>
              Waitlist
            </Button>
            <Button type="button" disabled={pending} variant="ghost" className="w-full whitespace-normal" onClick={() => void onSave({ type: "plus-one", guestId: guest.id, status: "clear" }).catch(() => undefined)}>
              Clear plus-one
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {guest.asks.map((ask) => (
          <AskEditor key={ask.id} guestId={guest.id} ask={ask} pending={pending} onSave={onSave} />
        ))}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave({ type: "ask-add", guestId: guest.id, title: askTitle, message: askMessage })
              .then(() => {
                setAskTitle("");
                setAskMessage("");
              })
              .catch(() => undefined);
          }}
        >
          <h4 className="text-label text-foreground-muted">New ask</h4>
          <Field label="Title">
            <input className={controlClass} required value={askTitle} onChange={(event) => setAskTitle(event.target.value)} />
          </Field>
          <Field label="Message">
            <textarea className={proseClass} required rows={4} value={askMessage} onChange={(event) => setAskMessage(event.target.value)} />
          </Field>
          <Button
            type="button"
            variant="ghost"
            className="w-full whitespace-normal"
            onClick={() => {
              setAskTitle(HOUSE_STAFF_ASK.title);
              setAskMessage(HOUSE_STAFF_ASK.message);
            }}
          >
            Use the house-staff ask
          </Button>
          <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal text-center">
            Add ask
          </Button>
        </form>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full whitespace-normal"
        disabled={pending}
        onClick={() => {
          if (window.confirm(`Remove ${guest.name} from the list?`)) {
            void onSave({ type: "guest-remove", guestId: guest.id }).catch(() => undefined);
          }
        }}
      >
        Remove guest
      </Button>
    </article>
  );
}

function AskEditor({
  guestId,
  ask,
  pending,
  onSave,
}: {
  guestId: string;
  ask: Guest["asks"][number];
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(ask.title);
  const [message, setMessage] = useState(ask.message);

  return (
    <form
      className="flex flex-col gap-3 border-t border-foreground-faint pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave({ type: "ask-update", guestId, askId: ask.id, title, message }).catch(() => undefined);
      }}
    >
      <p className="text-label text-foreground-muted">Response: {ask.response ?? "unanswered"}</p>
      {ask.note ? <p className="text-aside text-foreground-muted">{ask.note}</p> : null}
      <Field label="Title">
        <input className={controlClass} required value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="Message">
        <textarea className={proseClass} required rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
      </Field>
      <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal text-center">
        Save ask
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className="w-full whitespace-normal"
        onClick={() => void onSave({ type: "ask-remove", guestId, askId: ask.id }).catch(() => undefined)}
      >
        Remove ask
      </Button>
    </form>
  );
}

function EventForm({
  event,
  version,
  pending,
  onSave,
}: {
  event: ParlorEvent;
  version: number;
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [draft, setDraft] = useState(event);
  useEffect(() => {
    setDraft(event);
  }, [version, event]);

  function set<K extends keyof ParlorEvent>(key: K, value: ParlorEvent[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <details className="flex flex-col gap-4">
      <summary className="cursor-pointer list-none text-subtitle text-foreground">Event details</summary>
      <form
        className="flex flex-col gap-4 pt-4"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          void onSave({ type: "event", event: draft }).catch(() => undefined);
        }}
      >
        <Field label="Name">
          <input className={controlClass} required value={draft.name} onChange={(input) => set("name", input.target.value)} />
        </Field>
        <Field label="Working title">
          <input className={controlClass} value={draft.workingTitle} onChange={(input) => set("workingTitle", input.target.value)} />
        </Field>
        <Field label="Date">
          <input className={controlClass} required value={draft.dateLabel} onChange={(input) => set("dateLabel", input.target.value)} />
        </Field>
        <label className="flex items-center gap-3 text-body text-foreground">
          <input
            type="checkbox"
            checked={draft.dateIsTentative}
            onChange={(input) => set("dateIsTentative", input.target.checked)}
          />
          Date is tentative
        </label>
        <Field label="Alternate date">
          <input className={controlClass} value={draft.alternateDateLabel} onChange={(input) => set("alternateDateLabel", input.target.value)} />
        </Field>
        <Field label="Time">
          <input className={controlClass} required value={draft.timeLabel} onChange={(input) => set("timeLabel", input.target.value)} />
        </Field>
        <Field label="Place">
          <input className={controlClass} required value={draft.location} onChange={(input) => set("location", input.target.value)} />
        </Field>
        <Field label="Invitation note">
          <textarea className={proseClass} required rows={4} value={draft.invitationNote} onChange={(input) => set("invitationNote", input.target.value)} />
        </Field>
        <Field label="Phones">
          <textarea className={proseClass} rows={3} value={draft.phonesNote} onChange={(input) => set("phonesNote", input.target.value)} />
        </Field>
        <Field label="Donation">
          <textarea className={proseClass} rows={3} value={draft.donationNote} onChange={(input) => set("donationNote", input.target.value)} />
        </Field>
        <Field label="Schedule note">
          <textarea className={proseClass} rows={3} value={draft.scheduleNote} onChange={(input) => set("scheduleNote", input.target.value)} />
        </Field>
        <Field label="Arrival">
          <textarea
            className={proseClass}
            rows={5}
            value={draft.evening.arrival}
            onChange={(input) =>
              setDraft((current) => ({ ...current, evening: { ...current.evening, arrival: input.target.value } }))
            }
          />
        </Field>
        <Field label="Games">
          <textarea
            className={proseClass}
            rows={5}
            value={draft.evening.games}
            onChange={(input) =>
              setDraft((current) => ({ ...current, evening: { ...current.evening, games: input.target.value } }))
            }
          />
        </Field>
        {draft.evening.rooms.map((room, index) => (
          <div key={room.id} className="flex flex-col gap-3">
            <Field label={`${room.name} — name`}>
              <input
                className={controlClass}
                value={room.name}
                onChange={(input) => {
                  const rooms = draft.evening.rooms.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, name: input.target.value } : item,
                  );
                  setDraft((current) => ({ ...current, evening: { ...current.evening, rooms } }));
                }}
              />
            </Field>
            <Field label={`${room.name} — description`}>
              <textarea
                className={proseClass}
                rows={3}
                value={room.description}
                onChange={(input) => {
                  const rooms = draft.evening.rooms.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, description: input.target.value } : item,
                  );
                  setDraft((current) => ({ ...current, evening: { ...current.evening, rooms } }));
                }}
              />
            </Field>
          </div>
        ))}
        <Button type="submit" disabled={pending} className="w-full whitespace-normal text-center">
          Save the evening
        </Button>
      </form>
    </details>
  );
}

function ReferralList({
  payload,
  pending,
  onRemove,
}: {
  payload: AdminPayload;
  pending: boolean;
  onRemove: (referralId: string) => Promise<void>;
}) {
  const { referrals, bounties } = payload.state;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-subtitle text-foreground">Who to invite next</h2>
      {referrals.length === 0 ? (
        <p className="text-aside text-foreground-muted">No one has suggested a guest yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {referrals.map((referral) => (
            <li key={referral.id} className="flex flex-col gap-2 border-t border-foreground-faint pt-4">
              <p className="text-body text-foreground">
                {referral.name} — {referral.contact}
              </p>
              <p className="text-aside text-foreground-muted">
                From {referral.guestName}. {referral.why}
                {referral.bountyId
                  ? ` · ${bounties.find((bounty) => bounty.id === referral.bountyId)?.title ?? "a role"}`
                  : ""}
              </p>
              <Button type="button" variant="ghost" disabled={pending} className="w-full whitespace-normal" onClick={() => void onRemove(referral.id).catch(() => undefined)}>
                Dismiss
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BountyEditor({
  payload,
  pending,
  onSave,
}: {
  payload: AdminPayload;
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <details>
      <summary className="cursor-pointer list-none text-subtitle text-foreground">Roles being sought</summary>
      <div className="flex flex-col gap-4 pt-4">
        {payload.state.bounties.map((bounty) => (
          <form
            key={bounty.id}
            className="flex flex-col gap-3 border-t border-foreground-faint pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              void onSave({
                type: "bounty-upsert",
                id: bounty.id,
                title: String(data.get("title") ?? ""),
                description: String(data.get("description") ?? ""),
                active: data.get("active") === "on",
              }).catch(() => undefined);
            }}
          >
            <Field label="Role">
              <input className={controlClass} name="title" defaultValue={bounty.title} />
            </Field>
            <Field label="What the host means">
              <textarea className={proseClass} name="description" rows={2} defaultValue={bounty.description} />
            </Field>
            <label className="flex items-center gap-3 text-body text-foreground">
              <input type="checkbox" name="active" defaultChecked={bounty.active} />
              Show this on invitations
            </label>
            <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal">
              Save role
            </Button>
            <Button type="button" variant="ghost" disabled={pending} className="w-full whitespace-normal" onClick={() => void onSave({ type: "bounty-remove", bountyId: bounty.id }).catch(() => undefined)}>
              Remove role
            </Button>
          </form>
        ))}
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave({ type: "bounty-upsert", title, description, active: true })
              .then(() => {
                setTitle("");
                setDescription("");
              })
              .catch(() => undefined);
          }}
        >
          <Field label="New role">
            <input className={controlClass} required value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={proseClass} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal">
            Add role
          </Button>
        </form>
      </div>
    </details>
  );
}

function ScheduleEditor({
  payload,
  pending,
  onSave,
}: {
  payload: AdminPayload;
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const { schedule, event } = payload.state;
  const [roomId, setRoomId] = useState(event.evening.rooms[0]?.id ?? "main");
  const [startsAt, setStartsAt] = useState("21:00");
  const [endsAt, setEndsAt] = useState("22:00");

  return (
    <details>
      <summary className="cursor-pointer list-none text-subtitle text-foreground">Schedule</summary>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-aside text-foreground-muted">
          Open hours have a blank title. Approving a proposal fills the title. A seat limit lets guests reserve; leave it empty for drop-in.
        </p>
        {schedule.map((slot) => (
          <SlotEditor
            key={`${slot.id}:${slot.title}:${slot.startsAt}:${slot.seatLimit ?? "drop"}:${slot.proposals.filter((proposal) => proposal.status === "pending").length}`}
            slot={slot}
            roomName={event.evening.rooms.find((room) => room.id === slot.roomId)?.name ?? slot.roomId}
            pending={pending}
            onSave={onSave}
          />
        ))}
        <form
          className="flex flex-col gap-3"
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            void onSave({ type: "slot-create", roomId, startsAt, endsAt, seatLimit: 4 }).catch(() => undefined);
          }}
        >
          <h3 className="text-label text-foreground-muted">Add an open hour</h3>
          <Field label="Room">
            <select className={controlClass} value={roomId} onChange={(input) => setRoomId(input.target.value)}>
              {event.evening.rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Starts">
              <input className={controlClass} type="time" required value={startsAt} onChange={(input) => setStartsAt(input.target.value)} />
            </Field>
            <Field label="Ends">
              <input className={controlClass} type="time" required value={endsAt} onChange={(input) => setEndsAt(input.target.value)} />
            </Field>
          </div>
          <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal">
            Add hour
          </Button>
        </form>
      </div>
    </details>
  );
}

function SlotEditor({
  slot,
  roomName,
  pending,
  onSave,
}: {
  slot: ScheduleSlot;
  roomName: string;
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const pendingProposals = slot.proposals.filter((proposal) => proposal.status === "pending");

  return (
    <form
      className="flex flex-col gap-3 border-t border-foreground-faint pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const seat = String(data.get("seatLimit") ?? "").trim();
        void onSave({
          type: "slot-update",
          slotId: slot.id,
          startsAt: String(data.get("startsAt") ?? ""),
          endsAt: String(data.get("endsAt") ?? ""),
          title: String(data.get("title") ?? ""),
          description: String(data.get("description") ?? ""),
          seatLimit: seat === "" ? null : Number(seat),
        }).catch(() => undefined);
      }}
    >
      <p className="text-label text-foreground">
        {roomName} · {formatClock(slot.startsAt)} – {formatClock(slot.endsAt)}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Starts">
          <input className={controlClass} type="time" name="startsAt" defaultValue={slot.startsAt} />
        </Field>
        <Field label="Ends">
          <input className={controlClass} type="time" name="endsAt" defaultValue={slot.endsAt} />
        </Field>
      </div>
      <Field label="Title (blank = open)">
        <input className={proseClass} name="title" defaultValue={slot.title} />
      </Field>
      <Field label="Description">
        <textarea className={proseClass} name="description" rows={2} defaultValue={slot.description} />
      </Field>
      <Field label="Seat limit">
        <input className={controlClass} name="seatLimit" type="number" min={1} defaultValue={slot.seatLimit ?? ""} placeholder="Drop-in" />
      </Field>
      {slot.reservations.length > 0 ? (
        <p className="text-aside text-foreground-muted">
          Seats: {slot.reservations.map((reservation) => reservation.guestName).join(", ")}
        </p>
      ) : null}
      {pendingProposals.map((proposal) => (
        <div key={proposal.id} className="flex flex-col gap-2">
          <p className="text-body text-foreground">
            {proposal.guestName} offers {proposal.title}
            {proposal.note ? ` — ${proposal.note}` : ""}
          </p>
          <Button
            type="button"
            disabled={pending}
            className="w-full whitespace-normal"
            onClick={() =>
              void onSave({ type: "proposal", slotId: slot.id, proposalId: proposal.id, decision: "approved" }).catch(() => undefined)
            }
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="w-full whitespace-normal"
            onClick={() =>
              void onSave({ type: "proposal", slotId: slot.id, proposalId: proposal.id, decision: "declined" }).catch(() => undefined)
            }
          >
            Decline
          </Button>
        </div>
      ))}
      <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal">
        Save hour
      </Button>
      <Button type="button" variant="ghost" disabled={pending} className="w-full whitespace-normal" onClick={() => void onSave({ type: "slot-remove", slotId: slot.id }).catch(() => undefined)}>
        Remove hour
      </Button>
    </form>
  );
}
