import type {
  AttendanceSummary,
  Bounty,
  Category,
  Guest,
  GuestView,
  ParlorEvent,
  ParlorState,
  PlusOne,
  Rsvp,
  ScheduleSlot,
} from "./types";

export class ParlorRuleError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ParlorRuleError";
    this.status = status;
  }
}

const CLOSED_PLUS_ONE: Record<Category, string> = {
  gentleman:
    "There isn't room for another gentleman this evening. Please invite a lady — and bring your gentleman next time.",
  lady: "There isn't room for another lady this evening. Please invite a gentleman — and bring your lady next time.",
};

export function closedPlusOneMessage(category: Category): string {
  return CLOSED_PLUS_ONE[category];
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function clone(state: ParlorState): ParlorState {
  return structuredClone(state);
}

function required(value: string, message: string, max: number): string {
  const trimmed = value.trim().slice(0, max);
  if (!trimmed) throw new ParlorRuleError(message);
  return trimmed;
}

function asCategory(value: string): Category {
  if (value !== "gentleman" && value !== "lady") {
    throw new ParlorRuleError("Choose gentleman or lady.");
  }
  return value;
}

export function guestByToken(state: ParlorState, token: string): Guest | undefined {
  return state.guests.find((guest) => guest.token === token);
}

export function guestByEmail(state: ParlorState, email: string): Guest | undefined {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return undefined;
  return state.guests.find((guest) => guest.email === normalized);
}

/** Confirmed seats: guests who are coming, plus accepted plus-ones of those guests. */
export function seatsTaken(
  state: ParlorState,
  category: Category,
  exceptGuestId?: string,
): number {
  let taken = 0;
  for (const guest of state.guests) {
    if (guest.rsvp !== "yes") continue;
    if (guest.category === category) taken += 1;
    if (guest.id === exceptGuestId) continue;
    if (guest.plusOne?.status === "accepted" && guest.plusOne.category === category) {
      taken += 1;
    }
  }
  return taken;
}

export function attendanceSummary(state: ParlorState): AttendanceSummary {
  let coming = 0;
  let declined = 0;
  let waiting = 0;
  for (const guest of state.guests) {
    if (guest.rsvp === "yes") coming += 1;
    else if (guest.rsvp === "no") declined += 1;
    else waiting += 1;
  }
  return {
    coming,
    declined,
    waiting,
    seats: {
      gentleman: {
        taken: seatsTaken(state, "gentleman"),
        capacity: state.capacity.gentleman,
      },
      lady: { taken: seatsTaken(state, "lady"), capacity: state.capacity.lady },
    },
  };
}

function updateGuest(
  state: ParlorState,
  token: string,
  change: (guest: Guest) => Guest,
): ParlorState {
  const next = clone(state);
  const index = next.guests.findIndex((guest) => guest.token === token);
  if (index < 0) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  next.guests[index] = change(next.guests[index]);
  return next;
}

function updateGuestById(
  state: ParlorState,
  guestId: string,
  change: (guest: Guest) => Guest,
): ParlorState {
  const next = clone(state);
  const index = next.guests.findIndex((guest) => guest.id === guestId);
  if (index < 0) throw new ParlorRuleError("That guest is no longer on the list.");
  next.guests[index] = change(next.guests[index]);
  return next;
}

function releaseReservations(state: ParlorState, guestId: string): ParlorState {
  state.schedule = state.schedule.map((slot) => ({
    ...slot,
    reservations: slot.reservations.filter((reservation) => reservation.guestId !== guestId),
  }));
  return state;
}

function categoryHasRoom(state: ParlorState, category: Category, guestId: string): boolean {
  return seatsTaken(state, category, guestId) < state.capacity[category];
}

export function setRsvp(state: ParlorState, token: string, rsvp: Exclude<Rsvp, null>): ParlorState {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  let next = updateGuest(state, token, (current) => ({ ...current, rsvp }));
  if (rsvp === "no") {
    next = updateGuest(next, token, (current) => ({
      ...current,
      plusOne: current.plusOne ? { ...current.plusOne, status: "waitlist" } : null,
    }));
    return releaseReservations(next, guest.id);
  }
  const refreshed = guestByToken(next, token);
  if (refreshed?.plusOne) {
    const open = categoryHasRoom(next, refreshed.plusOne.category, refreshed.id);
    next = updateGuest(next, token, (current) => ({
      ...current,
      plusOne: current.plusOne
        ? { ...current.plusOne, status: open ? "accepted" : "waitlist" }
        : null,
    }));
  }
  return next;
}

export function setAskResponse(
  state: ParlorState,
  token: string,
  askId: string,
  response: "accept" | "decline",
  note: string,
): ParlorState {
  const trimmed = note.trim().slice(0, 280);
  return updateGuest(state, token, (guest) => {
    if (!guest.asks.some((ask) => ask.id === askId)) {
      throw new ParlorRuleError("That request is no longer on your card.");
    }
    return {
      ...guest,
      asks: guest.asks.map((ask) =>
        ask.id === askId ? { ...ask, response, note: trimmed } : ask,
      ),
    };
  });
}

export function setPlusOne(
  state: ParlorState,
  token: string,
  request: { name: string; category: Category } | null,
): ParlorState {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  if (request === null) {
    return updateGuest(state, token, (current) => ({ ...current, plusOne: null }));
  }
  if (guest.rsvp !== "yes") {
    throw new ParlorRuleError("Say you will attend before asking to bring someone.");
  }
  const category = asCategory(request.category);
  const plusOne: PlusOne = {
    name: request.name.trim().slice(0, 80),
    category,
    status: categoryHasRoom(state, category, guest.id) ? "accepted" : "waitlist",
  };
  return updateGuest(state, token, (current) => ({ ...current, plusOne }));
}

export function addReferral(
  state: ParlorState,
  token: string,
  input: { name: string; contact: string; why: string; bountyId: string | null },
  id: string,
  createdAt: string,
): ParlorState {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  const name = required(input.name, "Who should we invite?", 80);
  const contact = required(input.contact, "How should we reach them?", 120);
  const why = required(input.why, "Tell us, briefly, why them.", 500);
  const next = clone(state);
  const already = next.referrals.filter((referral) => referral.guestId === guest.id).length;
  if (already >= 8) {
    throw new ParlorRuleError("That's a generous list. The host has the ones you've sent.");
  }
  let bountyId: string | null = null;
  if (input.bountyId) {
    const bounty = next.bounties.find((item) => item.id === input.bountyId && item.active);
    if (!bounty) throw new ParlorRuleError("That role is no longer being sought.");
    bountyId = bounty.id;
  }
  next.referrals.push({
    id,
    guestId: guest.id,
    guestName: guest.name,
    name,
    contact,
    why,
    bountyId,
    createdAt,
  });
  return next;
}

export function reserveSeat(
  state: ParlorState,
  token: string,
  slotId: string,
  reservationId: string,
): ParlorState {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  if (guest.rsvp !== "yes") {
    throw new ParlorRuleError("Say you will attend before taking a seat.");
  }
  const next = clone(state);
  const slot = next.schedule.find((item) => item.id === slotId);
  if (!slot) throw new ParlorRuleError("That hour is no longer on the schedule.");
  if (!slot.title.trim()) {
    throw new ParlorRuleError("That table is still open. Offer a game instead.");
  }
  if (slot.seatLimit == null) {
    throw new ParlorRuleError("This part of the evening is drop-in.");
  }
  if (slot.reservations.some((reservation) => reservation.guestId === guest.id)) return next;
  if (slot.reservations.length >= slot.seatLimit) {
    throw new ParlorRuleError("That table is full.");
  }
  slot.reservations.push({ id: reservationId, guestId: guest.id, guestName: guest.name });
  return next;
}

export function releaseSeat(state: ParlorState, token: string, slotId: string): ParlorState {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  const next = clone(state);
  const slot = next.schedule.find((item) => item.id === slotId);
  if (!slot) throw new ParlorRuleError("That hour is no longer on the schedule.");
  slot.reservations = slot.reservations.filter((reservation) => reservation.guestId !== guest.id);
  return next;
}

export function proposeSlot(
  state: ParlorState,
  token: string,
  slotId: string,
  input: { title: string; note: string },
  proposalId: string,
  createdAt: string,
): ParlorState {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  if (guest.rsvp !== "yes") {
    throw new ParlorRuleError("Say you will attend before offering a game.");
  }
  const title = required(input.title, "What would you like to host?", 80);
  const note = input.note.trim().slice(0, 280);
  const next = clone(state);
  const slot = next.schedule.find((item) => item.id === slotId);
  if (!slot) throw new ParlorRuleError("That hour is no longer on the schedule.");
  if (slot.title.trim()) throw new ParlorRuleError("That hour already has a plan.");
  if (slot.proposals.some((proposal) => proposal.guestId === guest.id && proposal.status === "pending")) {
    throw new ParlorRuleError("You already have a proposal waiting for this hour.");
  }
  slot.proposals.push({
    id: proposalId,
    guestId: guest.id,
    guestName: guest.name,
    title,
    note,
    status: "pending",
    createdAt,
  });
  return next;
}

export function toGuestView(state: ParlorState, token: string): GuestView {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  const availability = (category: Category) => ({
    open: categoryHasRoom(state, category, guest.id),
    closedMessage: closedPlusOneMessage(category),
  });
  return {
    event: state.event,
    guest: {
      name: guest.name,
      rsvp: guest.rsvp,
      plusOne: guest.plusOne,
      asks: guest.asks,
    },
    plusOneAvailability: {
      gentleman: availability("gentleman"),
      lady: availability("lady"),
    },
    bounties: state.bounties
      .filter((bounty) => bounty.active)
      .map((bounty) => ({ id: bounty.id, title: bounty.title, description: bounty.description })),
    referrals: state.referrals
      .filter((referral) => referral.guestId === guest.id)
      .map((referral) => ({
        id: referral.id,
        name: referral.name,
        contact: referral.contact,
        why: referral.why,
        bountyTitle: state.bounties.find((bounty) => bounty.id === referral.bountyId)?.title ?? null,
      })),
    schedule: state.schedule.map((slot) => {
      const room = state.event.evening.rooms.find((item) => item.id === slot.roomId);
      const mine = slot.proposals.filter((proposal) => proposal.guestId === guest.id);
      const yours = mine.at(-1) ?? null;
      const open = slot.title.trim().length === 0;
      const seated = !open && slot.seatLimit != null;
      return {
        id: slot.id,
        roomName: room?.name ?? "A room",
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        title: slot.title,
        description: slot.description,
        kind: open ? "open" : seated ? "seated" : "drop-in",
        seatsLeft:
          slot.seatLimit == null ? null : Math.max(0, slot.seatLimit - slot.reservations.length),
        seatLimit: slot.seatLimit,
        reservedByYou: slot.reservations.some((reservation) => reservation.guestId === guest.id),
        yourProposal: yours ? { title: yours.title, status: yours.status } : null,
      };
    }),
  };
}

function validEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const at = normalized.indexOf("@");
  if (at <= 0 || at !== normalized.lastIndexOf("@") || at === normalized.length - 1) {
    throw new ParlorRuleError("Enter a real email address.");
  }
  if (normalized.length > 200) throw new ParlorRuleError("That email is too long.");
  return normalized;
}

export function upsertGuest(
  state: ParlorState,
  input: { id?: string; name: string; email: string; category: Category },
  ids: { id: string; token: string },
): ParlorState {
  const name = required(input.name, "A guest needs a name.", 80);
  const email = validEmail(input.email);
  const category = asCategory(input.category);
  const next = clone(state);
  const conflict = next.guests.find((guest) => guest.email === email && guest.id !== input.id);
  if (conflict) throw new ParlorRuleError("That email already has an invitation.");
  if (!input.id) {
    next.guests.push({
      id: ids.id,
      token: ids.token,
      name,
      email,
      category,
      rsvp: null,
      plusOne: null,
      asks: [],
      example: false,
    });
    return next;
  }
  const index = next.guests.findIndex((guest) => guest.id === input.id);
  if (index < 0) throw new ParlorRuleError("That guest is no longer on the list.");
  next.guests[index] = { ...next.guests[index], name, email, category };
  return next;
}

export function removeGuest(state: ParlorState, guestId: string): ParlorState {
  const next = clone(state);
  if (!next.guests.some((guest) => guest.id === guestId)) {
    throw new ParlorRuleError("That guest is no longer on the list.");
  }
  next.guests = next.guests.filter((guest) => guest.id !== guestId);
  return releaseReservations(next, guestId);
}

export function addAsk(
  state: ParlorState,
  guestId: string,
  ask: { id: string; title: string; message: string },
): ParlorState {
  const title = required(ask.title, "An ask needs a title.", 80);
  const message = required(ask.message, "An ask needs a note to the guest.", 600);
  return updateGuestById(state, guestId, (guest) => ({
    ...guest,
    asks: [...guest.asks, { id: ask.id, title, message, response: null, note: "" }],
  }));
}

export function updateAsk(
  state: ParlorState,
  guestId: string,
  askId: string,
  title: string,
  message: string,
): ParlorState {
  const nextTitle = required(title, "An ask needs a title.", 80);
  const nextMessage = required(message, "An ask needs a note to the guest.", 600);
  return updateGuestById(state, guestId, (guest) => {
    if (!guest.asks.some((ask) => ask.id === askId)) {
      throw new ParlorRuleError("That ask is no longer on the card.");
    }
    return {
      ...guest,
      asks: guest.asks.map((ask) =>
        ask.id === askId ? { ...ask, title: nextTitle, message: nextMessage } : ask,
      ),
    };
  });
}

export function removeAsk(state: ParlorState, guestId: string, askId: string): ParlorState {
  return updateGuestById(state, guestId, (guest) => ({
    ...guest,
    asks: guest.asks.filter((ask) => ask.id !== askId),
  }));
}

export function setPlusOneStatus(
  state: ParlorState,
  guestId: string,
  status: "accepted" | "waitlist" | "clear",
): ParlorState {
  return updateGuestById(state, guestId, (guest) => {
    if (status === "clear") return { ...guest, plusOne: null };
    if (!guest.plusOne) throw new ParlorRuleError("This guest has not asked to bring someone.");
    return { ...guest, plusOne: { ...guest.plusOne, status } };
  });
}

export function updateCapacity(
  state: ParlorState,
  capacity: { gentleman: number; lady: number },
): ParlorState {
  for (const value of [capacity.gentleman, capacity.lady]) {
    if (!Number.isInteger(value) || value < 0 || value > 500) {
      throw new ParlorRuleError("Capacity is a whole number from 0 to 500.");
    }
  }
  const next = clone(state);
  next.capacity = { gentleman: capacity.gentleman, lady: capacity.lady };
  return next;
}

function clock(value: string, label: string): string {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new ParlorRuleError(`${label} needs a time like 19:30.`);
  }
  return value;
}

function roomText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function updateEvent(state: ParlorState, input: ParlorEvent): ParlorState {
  const rooms = Array.isArray(input.evening?.rooms) ? input.evening.rooms : [];
  if (rooms.length < 1 || rooms.length > 8) {
    throw new ParlorRuleError("Keep between one and eight rooms.");
  }
  const seen = new Set<string>();
  const nextRooms = rooms.map((room) => {
    const id = roomText(room?.id, 40);
    if (!/^[a-z0-9-]{1,40}$/.test(id) || seen.has(id)) {
      throw new ParlorRuleError("Each room needs its own short id.");
    }
    seen.add(id);
    return {
      id,
      name: required(roomText(room?.name, 60), "Each room needs a name.", 60),
      description: roomText(room?.description, 400),
    };
  });
  const evening = input.evening ?? { arrival: "", games: "", rooms: [] };
  const event: ParlorEvent = {
    name: required(roomText(input.name, 80), "The evening needs a name.", 80),
    workingTitle: roomText(input.workingTitle, 80),
    dateLabel: required(roomText(input.dateLabel, 80), "The evening needs a date.", 80),
    dateIsTentative: Boolean(input.dateIsTentative),
    alternateDateLabel: roomText(input.alternateDateLabel, 80),
    timeLabel: required(roomText(input.timeLabel, 80), "The evening needs a time.", 80),
    location: required(roomText(input.location, 80), "The evening needs a place.", 80),
    invitationNote: required(roomText(input.invitationNote, 600), "Write a short note of invitation.", 600),
    phonesNote: roomText(input.phonesNote, 400),
    donationNote: roomText(input.donationNote, 400),
    scheduleNote: roomText(input.scheduleNote, 400),
    evening: {
      arrival: roomText(evening.arrival, 1200),
      games: roomText(evening.games, 1200),
      rooms: nextRooms,
    },
  };
  const next = clone(state);
  next.event = event;
  return next;
}

export function upsertBounty(state: ParlorState, bounty: Bounty): ParlorState {
  const title = required(bounty.title, "A role needs a name.", 80);
  const description = bounty.description.trim().slice(0, 280);
  const next = clone(state);
  const index = next.bounties.findIndex((item) => item.id === bounty.id);
  const saved: Bounty = { id: bounty.id, title, description, active: Boolean(bounty.active) };
  if (index < 0) next.bounties.push(saved);
  else next.bounties[index] = saved;
  return next;
}

export function removeBounty(state: ParlorState, bountyId: string): ParlorState {
  const next = clone(state);
  next.bounties = next.bounties.filter((bounty) => bounty.id !== bountyId);
  return next;
}

export function removeReferral(state: ParlorState, referralId: string): ParlorState {
  const next = clone(state);
  next.referrals = next.referrals.filter((referral) => referral.id !== referralId);
  return next;
}

export function resolveProposal(
  state: ParlorState,
  slotId: string,
  proposalId: string,
  decision: "approved" | "declined",
): ParlorState {
  const next = clone(state);
  const slot = requireSlot(next, slotId);
  const proposal = slot.proposals.find((item) => item.id === proposalId);
  if (!proposal) throw new ParlorRuleError("That proposal is no longer waiting.");
  if (decision === "declined") {
    proposal.status = "declined";
    return next;
  }
  proposal.status = "approved";
  slot.title = proposal.title;
  if (proposal.note.trim()) slot.description = proposal.note.trim();
  for (const other of slot.proposals) {
    if (other.id !== proposal.id && other.status === "pending") other.status = "declined";
  }
  return next;
}

function requireSlot(state: ParlorState, slotId: string): ScheduleSlot {
  const slot = state.schedule.find((item) => item.id === slotId);
  if (!slot) throw new ParlorRuleError("That hour is no longer on the schedule.");
  return slot;
}

export function updateSlot(
  state: ParlorState,
  slotId: string,
  input: {
    startsAt: string;
    endsAt: string;
    title: string;
    description: string;
    seatLimit: number | null;
  },
): ParlorState {
  const next = clone(state);
  const slot = requireSlot(next, slotId);
  slot.startsAt = clock(input.startsAt, "The start");
  slot.endsAt = clock(input.endsAt, "The end");
  slot.title = input.title.trim().slice(0, 80);
  slot.description = input.description.trim().slice(0, 400);
  slot.seatLimit = cleanSeatLimit(input.seatLimit);
  if (slot.seatLimit != null && slot.reservations.length > slot.seatLimit) {
    throw new ParlorRuleError("That seat limit is smaller than the seats already taken.");
  }
  return next;
}

function cleanSeatLimit(value: number | null): number | null {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 200) {
    throw new ParlorRuleError("A seat limit is a whole number, or empty for drop-in.");
  }
  return value;
}

export function createSlot(
  state: ParlorState,
  input: { id: string; roomId: string; startsAt: string; endsAt: string; seatLimit: number | null },
): ParlorState {
  const next = clone(state);
  if (!next.event.evening.rooms.some((room) => room.id === input.roomId)) {
    throw new ParlorRuleError("Choose one of the evening's rooms.");
  }
  next.schedule.push({
    id: input.id,
    roomId: input.roomId,
    startsAt: clock(input.startsAt, "The start"),
    endsAt: clock(input.endsAt, "The end"),
    title: "",
    description: "",
    seatLimit: cleanSeatLimit(input.seatLimit),
    reservations: [],
    proposals: [],
  });
  return next;
}

export function removeSlot(state: ParlorState, slotId: string): ParlorState {
  const next = clone(state);
  if (!next.schedule.some((slot) => slot.id === slotId)) {
    throw new ParlorRuleError("That hour is no longer on the schedule.");
  }
  next.schedule = next.schedule.filter((slot) => slot.id !== slotId);
  return next;
}
