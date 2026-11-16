import { useEffect, useState, type FormEvent } from "react";

import { Evening } from "@/pages/parlor/Evening";
import { Field, Notice, controlClass, proseClass } from "@/pages/parlor/fields";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/button";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { loadInvitation, postInvitation } from "@/parlor/client";
import { categoryPhrase } from "@/parlor/format";
import type { Category, GuestAsk, GuestView } from "@/parlor/types";

function Rule() {
  return <div className="mx-auto h-px w-16 bg-section-story" aria-hidden="true" />;
}

function AskCard({
  ask,
  pending,
  onAnswer,
}: {
  ask: GuestAsk;
  pending: boolean;
  onAnswer: (response: "accept" | "decline", note: string) => Promise<void>;
}) {
  const [note, setNote] = useState(ask.note);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNote(ask.note);
  }, [ask.note]);

  async function answer(response: "accept" | "decline") {
    setError(null);
    try {
      await onAnswer(response, note);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The house could not save that.");
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-foreground-faint bg-background p-6 text-foreground">
      <h3 className="text-subtitle text-foreground">{ask.title}</h3>
      <p className="text-body text-foreground">{ask.message}</p>
      <Field label="A short note, if you wish">
        <textarea className={proseClass} rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      {error ? <Notice>{error}</Notice> : null}
      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          type="button"
          disabled={pending}
          variant={ask.response === "accept" ? "default" : "outline"}
          aria-pressed={ask.response === "accept"}
          className="w-full whitespace-normal text-center md:flex-1"
          onClick={() => answer("accept")}
        >
          I will
        </Button>
        <Button
          type="button"
          disabled={pending}
          variant={ask.response === "decline" ? "default" : "outline"}
          aria-pressed={ask.response === "decline"}
          className="w-full whitespace-normal text-center md:flex-1"
          onClick={() => answer("decline")}
        >
          Not this time
        </Button>
      </div>
    </article>
  );
}

function PlusOneForm({
  view,
  pending,
  act,
}: {
  view: GuestView;
  pending: boolean;
  act: (body: Record<string, unknown>) => Promise<void>;
}) {
  const current = view.guest.plusOne;
  const [name, setName] = useState(current?.name ?? "");
  const [chosen, setChosen] = useState<Category>(current?.category ?? "lady");
  const [error, setError] = useState<string | null>(null);
  const availability = view.plusOneAvailability;

  useEffect(() => {
    setName(current?.name ?? "");
    if (current?.category) setChosen(current.category);
  }, [current?.name, current?.category]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await act({ type: "plus-one", plusOne: { name, category: chosen } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The house could not save that.");
    }
  }

  const closed =
    current?.status === "waitlist" ? availability[current.category].closedMessage : null;
  const showClosed = (group: Category) =>
    !availability[group].open &&
    current?.status !== "waitlist" &&
    !(current?.status === "accepted" && current.category === group);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left">
      <h3 className="text-subtitle text-foreground">Bringing someone?</h3>
      {current ? (
        <p className="text-body text-foreground">
          You asked to bring {current.name || "a guest"}, {categoryPhrase(current.category)}.
          {current.status === "accepted" ? " There is room. They are welcome." : ""}
        </p>
      ) : null}
      {closed ? <p className="text-aside text-foreground">{closed}</p> : null}
      {showClosed("gentleman") ? (
        <p className="text-aside text-foreground-muted">{availability.gentleman.closedMessage}</p>
      ) : null}
      {showClosed("lady") ? (
        <p className="text-aside text-foreground-muted">{availability.lady.closedMessage}</p>
      ) : null}
      <Field label="Their name">
        <input className={controlClass} value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label="They would come as">
        <select className={controlClass} value={chosen} onChange={(event) => setChosen(event.target.value as Category)}>
          <option value="lady">A lady</option>
          <option value="gentleman">A gentleman</option>
        </select>
      </Field>
      {error ? <Notice>{error}</Notice> : null}
      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={pending} className="w-full whitespace-normal text-center">
          {current ? "Update this request" : "Request a plus-one"}
        </Button>
        {current ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="w-full whitespace-normal text-center"
            onClick={() => {
              void act({ type: "plus-one", plusOne: null }).catch(() => undefined);
            }}
          >
            Withdraw the request
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function ReferralForm({
  view,
  pending,
  act,
}: {
  view: GuestView;
  pending: boolean;
  act: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [why, setWhy] = useState("");
  const [bountyId, setBountyId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await act({ type: "referral", name, contact, why, bountyId });
      setName("");
      setContact("");
      setWhy("");
      setBountyId("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The house could not save that.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {view.referrals.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {view.referrals.map((referral) => (
            <li key={referral.id} className="text-body text-foreground">
              {referral.name} — {referral.contact}
              {referral.bountyTitle ? ` · ${referral.bountyTitle}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <Field label="Their name">
        <input className={controlClass} required value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label="How we might reach them">
        <input className={controlClass} required value={contact} onChange={(event) => setContact(event.target.value)} />
      </Field>
      <Field label="Why them">
        <textarea className={proseClass} required rows={3} value={why} onChange={(event) => setWhy(event.target.value)} />
      </Field>
      {view.bounties.length > 0 ? (
        <Field label="The house is especially hoping to meet">
          <select className={controlClass} value={bountyId} onChange={(event) => setBountyId(event.target.value)}>
            <option value="">No particular role</option>
            {view.bounties.map((bounty) => (
              <option key={bounty.id} value={bounty.id}>
                {bounty.title}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      {error ? <Notice>{error}</Notice> : null}
      <Button type="submit" disabled={pending} variant="outline" className="w-full whitespace-normal text-center">
        Send the name
      </Button>
    </form>
  );
}

export function InvitationCard({ token }: { token: string }) {
  const [view, setView] = useState<GuestView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setView(null);
    setError(null);
    loadInvitation(token)
      .then((next) => {
        if (!cancelled) setView(next);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "This invitation link is not one we recognize.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function act(body: Record<string, unknown>) {
    setPending(true);
    setError(null);
    try {
      setView(await postInvitation(token, body));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The house could not save that.");
      throw caught;
    } finally {
      setPending(false);
    }
  }

  if (!view && !error) {
    return <p className="text-aside text-center text-foreground-muted">One moment.</p>;
  }

  if (!view) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <Notice>{error}</Notice>
        <a href="/parlor" className="text-label text-foreground underline underline-offset-4">
          Try another address
        </a>
      </div>
    );
  }

  const { event, guest } = view;
  const paragraphs = event.invitationNote.split(/\n+/).filter(Boolean);

  return (
    <div className="flex flex-col gap-8" data-parlor-invitation>
      <FadeIn>
        <div className="rounded-lg border border-foreground/20 bg-background p-2 text-foreground">
          <MandelbrotCorners
            size="xs"
            opacity={0.45}
            className="flex flex-col gap-6 rounded-md border border-foreground-faint bg-background p-6 text-center text-foreground"
          >
            <div className="flex flex-col gap-3">
              <p className="text-label text-foreground-muted">An invitation</p>
              <h1 className="text-title text-foreground">{event.name}</h1>
              {event.workingTitle && event.workingTitle !== event.name ? (
                <p className="text-aside text-foreground-muted">{event.workingTitle} is a working title.</p>
              ) : null}
            </div>
            <Rule />
            <div className="flex flex-col gap-2">
              <p className="text-subtitle text-balance text-foreground">{event.dateLabel}</p>
              {event.dateIsTentative ? (
                <p className="text-aside text-foreground-muted">
                  Tentative.
                  {event.alternateDateLabel
                    ? ` The other evening under consideration is ${event.alternateDateLabel}.`
                    : ""}
                </p>
              ) : null}
              <p className="text-label text-foreground-muted">
                {event.timeLabel} · {event.location}
              </p>
            </div>
            <Rule />
            <div className="flex flex-col gap-4 text-left">
              <h2 className="text-subtitle text-center text-foreground">Dear {guest.name},</h2>
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-body text-foreground">
                  {paragraph}
                </p>
              ))}
              {event.phonesNote ? <p className="text-body text-foreground">{event.phonesNote}</p> : null}
              {event.donationNote ? <p className="text-body text-foreground">{event.donationNote}</p> : null}
            </div>
            <div className="flex flex-col gap-3" data-testid="parlor-rsvp">
              <p className="text-label text-foreground-muted">Will you attend?</p>
              {guest.rsvp === "yes" ? <p className="text-aside text-foreground">You are coming.</p> : null}
              {guest.rsvp === "no" ? <p className="text-aside text-foreground">You sent your regrets.</p> : null}
              {error ? <Notice>{error}</Notice> : null}
              <div className="flex flex-col gap-3 md:flex-row">
                <Button
                  type="button"
                  disabled={pending}
                  variant={guest.rsvp === "yes" ? "default" : "outline"}
                  aria-pressed={guest.rsvp === "yes"}
                  className="w-full whitespace-normal text-center md:flex-1"
                  onClick={() => {
                  void act({ type: "rsvp", rsvp: "yes" }).catch(() => undefined);
                }}
                >
                  With pleasure
                </Button>
                <Button
                  type="button"
                  disabled={pending}
                  variant={guest.rsvp === "no" ? "default" : "outline"}
                  aria-pressed={guest.rsvp === "no"}
                  className="w-full whitespace-normal text-center md:flex-1"
                  onClick={() => {
                  void act({ type: "rsvp", rsvp: "no" }).catch(() => undefined);
                }}
                >
                  With regrets
                </Button>
              </div>
              <p className="text-aside text-foreground-muted">You may change your answer.</p>
            </div>
            {guest.rsvp === "yes" ? <PlusOneForm view={view} pending={pending} act={act} /> : null}
            <details className="text-left">
              <summary className="cursor-pointer list-none text-subtitle text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
                Who should we invite next time?
              </summary>
              <div className="pt-4">
                <ReferralForm view={view} pending={pending} act={act} />
              </div>
            </details>
          </MandelbrotCorners>
        </div>
      </FadeIn>

      {guest.asks.length > 0 ? (
        <FadeIn delay={0.08}>
          <section className="flex flex-col gap-4">
            <h2 className="text-subtitle text-center text-foreground">A further invitation</h2>
            {guest.asks.map((ask) => (
              <AskCard
                key={ask.id}
                ask={ask}
                pending={pending}
                onAnswer={(response, note) => act({ type: "ask", askId: ask.id, response, note })}
              />
            ))}
          </section>
        </FadeIn>
      ) : null}

      <details className="rounded-lg border border-foreground-faint bg-background p-6 text-foreground">
        <summary className="cursor-pointer list-none text-subtitle text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
          The Evening
        </summary>
        <div className="pt-6">
          <Evening view={view} act={act} pending={pending} />
        </div>
      </details>
    </div>
  );
}
