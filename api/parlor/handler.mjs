// src/parlor/http.ts
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// src/parlor/logic.ts
var ParlorRuleError = class extends Error {
  status;
  constructor(message, status = 400) {
    super(message);
    this.name = "ParlorRuleError";
    this.status = status;
  }
};
var CLOSED_PLUS_ONE = {
  gentleman: "There isn't room for another gentleman this evening. Please invite a lady \u2014 and bring your gentleman next time.",
  lady: "There isn't room for another lady this evening. Please invite a gentleman \u2014 and bring your lady next time."
};
function closedPlusOneMessage(category2) {
  return CLOSED_PLUS_ONE[category2];
}
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
function clone(state) {
  return structuredClone(state);
}
function required(value, message, max) {
  const trimmed = value.trim().slice(0, max);
  if (!trimmed) throw new ParlorRuleError(message);
  return trimmed;
}
function asCategory(value) {
  if (value !== "gentleman" && value !== "lady") {
    throw new ParlorRuleError("Choose gentleman or lady.");
  }
  return value;
}
function guestByToken(state, token) {
  return state.guests.find((guest) => guest.token === token);
}
function guestByEmail(state, email) {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return void 0;
  return state.guests.find((guest) => guest.email === normalized);
}
function seatsTaken(state, category2, exceptGuestId) {
  let taken = 0;
  for (const guest of state.guests) {
    if (guest.rsvp !== "yes") continue;
    if (guest.category === category2) taken += 1;
    if (guest.id === exceptGuestId) continue;
    if (guest.plusOne?.status === "accepted" && guest.plusOne.category === category2) {
      taken += 1;
    }
  }
  return taken;
}
function attendanceSummary(state) {
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
        capacity: state.capacity.gentleman
      },
      lady: { taken: seatsTaken(state, "lady"), capacity: state.capacity.lady }
    }
  };
}
function updateGuest(state, token, change) {
  const next = clone(state);
  const index = next.guests.findIndex((guest) => guest.token === token);
  if (index < 0) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  next.guests[index] = change(next.guests[index]);
  return next;
}
function updateGuestById(state, guestId, change) {
  const next = clone(state);
  const index = next.guests.findIndex((guest) => guest.id === guestId);
  if (index < 0) throw new ParlorRuleError("That guest is no longer on the list.");
  next.guests[index] = change(next.guests[index]);
  return next;
}
function releaseReservations(state, guestId) {
  state.schedule = state.schedule.map((slot) => ({
    ...slot,
    reservations: slot.reservations.filter((reservation) => reservation.guestId !== guestId)
  }));
  return state;
}
function categoryHasRoom(state, category2, guestId) {
  return seatsTaken(state, category2, guestId) < state.capacity[category2];
}
function setRsvp(state, token, rsvp) {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  let next = updateGuest(state, token, (current) => ({ ...current, rsvp }));
  if (rsvp === "no") {
    next = updateGuest(next, token, (current) => ({
      ...current,
      plusOne: current.plusOne ? { ...current.plusOne, status: "waitlist" } : null
    }));
    return releaseReservations(next, guest.id);
  }
  const refreshed = guestByToken(next, token);
  if (refreshed?.plusOne) {
    const open = categoryHasRoom(next, refreshed.plusOne.category, refreshed.id);
    next = updateGuest(next, token, (current) => ({
      ...current,
      plusOne: current.plusOne ? { ...current.plusOne, status: open ? "accepted" : "waitlist" } : null
    }));
  }
  return next;
}
function setAskResponse(state, token, askId, response, note) {
  const trimmed = note.trim().slice(0, 280);
  return updateGuest(state, token, (guest) => {
    if (!guest.asks.some((ask) => ask.id === askId)) {
      throw new ParlorRuleError("That request is no longer on your card.");
    }
    return {
      ...guest,
      asks: guest.asks.map(
        (ask) => ask.id === askId ? { ...ask, response, note: trimmed } : ask
      )
    };
  });
}
function setPlusOne(state, token, request) {
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
  const category2 = asCategory(request.category);
  const plusOne = {
    name: request.name.trim().slice(0, 80),
    category: category2,
    status: categoryHasRoom(state, category2, guest.id) ? "accepted" : "waitlist"
  };
  return updateGuest(state, token, (current) => ({ ...current, plusOne }));
}
function addReferral(state, token, input, id, createdAt) {
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
  let bountyId = null;
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
    createdAt
  });
  return next;
}
function reserveSeat(state, token, slotId, reservationId) {
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
function releaseSeat(state, token, slotId) {
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
function proposeSlot(state, token, slotId, input, proposalId, createdAt) {
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
    createdAt
  });
  return next;
}
function toGuestView(state, token) {
  const guest = guestByToken(state, token);
  if (!guest) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  const availability = (category2) => ({
    open: categoryHasRoom(state, category2, guest.id),
    closedMessage: closedPlusOneMessage(category2)
  });
  return {
    event: state.event,
    guest: {
      name: guest.name,
      rsvp: guest.rsvp,
      plusOne: guest.plusOne,
      asks: guest.asks
    },
    plusOneAvailability: {
      gentleman: availability("gentleman"),
      lady: availability("lady")
    },
    bounties: state.bounties.filter((bounty) => bounty.active).map((bounty) => ({ id: bounty.id, title: bounty.title, description: bounty.description })),
    referrals: state.referrals.filter((referral) => referral.guestId === guest.id).map((referral) => ({
      id: referral.id,
      name: referral.name,
      contact: referral.contact,
      why: referral.why,
      bountyTitle: state.bounties.find((bounty) => bounty.id === referral.bountyId)?.title ?? null
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
        seatsLeft: slot.seatLimit == null ? null : Math.max(0, slot.seatLimit - slot.reservations.length),
        seatLimit: slot.seatLimit,
        reservedByYou: slot.reservations.some((reservation) => reservation.guestId === guest.id),
        yourProposal: yours ? { title: yours.title, status: yours.status } : null
      };
    })
  };
}
function validEmail(email) {
  const normalized = normalizeEmail(email);
  const at = normalized.indexOf("@");
  if (at <= 0 || at !== normalized.lastIndexOf("@") || at === normalized.length - 1) {
    throw new ParlorRuleError("Enter a real email address.");
  }
  if (normalized.length > 200) throw new ParlorRuleError("That email is too long.");
  return normalized;
}
function upsertGuest(state, input, ids) {
  const name = required(input.name, "A guest needs a name.", 80);
  const email = validEmail(input.email);
  const category2 = asCategory(input.category);
  const next = clone(state);
  const conflict = next.guests.find((guest) => guest.email === email && guest.id !== input.id);
  if (conflict) throw new ParlorRuleError("That email already has an invitation.");
  if (!input.id) {
    next.guests.push({
      id: ids.id,
      token: ids.token,
      name,
      email,
      category: category2,
      rsvp: null,
      plusOne: null,
      asks: [],
      example: false
    });
    return next;
  }
  const index = next.guests.findIndex((guest) => guest.id === input.id);
  if (index < 0) throw new ParlorRuleError("That guest is no longer on the list.");
  next.guests[index] = { ...next.guests[index], name, email, category: category2 };
  return next;
}
function removeGuest(state, guestId) {
  const next = clone(state);
  if (!next.guests.some((guest) => guest.id === guestId)) {
    throw new ParlorRuleError("That guest is no longer on the list.");
  }
  next.guests = next.guests.filter((guest) => guest.id !== guestId);
  return releaseReservations(next, guestId);
}
function addAsk(state, guestId, ask) {
  const title = required(ask.title, "An ask needs a title.", 80);
  const message = required(ask.message, "An ask needs a note to the guest.", 600);
  return updateGuestById(state, guestId, (guest) => ({
    ...guest,
    asks: [...guest.asks, { id: ask.id, title, message, response: null, note: "" }]
  }));
}
function updateAsk(state, guestId, askId, title, message) {
  const nextTitle = required(title, "An ask needs a title.", 80);
  const nextMessage = required(message, "An ask needs a note to the guest.", 600);
  return updateGuestById(state, guestId, (guest) => {
    if (!guest.asks.some((ask) => ask.id === askId)) {
      throw new ParlorRuleError("That ask is no longer on the card.");
    }
    return {
      ...guest,
      asks: guest.asks.map(
        (ask) => ask.id === askId ? { ...ask, title: nextTitle, message: nextMessage } : ask
      )
    };
  });
}
function removeAsk(state, guestId, askId) {
  return updateGuestById(state, guestId, (guest) => ({
    ...guest,
    asks: guest.asks.filter((ask) => ask.id !== askId)
  }));
}
function setPlusOneStatus(state, guestId, status) {
  return updateGuestById(state, guestId, (guest) => {
    if (status === "clear") return { ...guest, plusOne: null };
    if (!guest.plusOne) throw new ParlorRuleError("This guest has not asked to bring someone.");
    return { ...guest, plusOne: { ...guest.plusOne, status } };
  });
}
function updateCapacity(state, capacity) {
  for (const value of [capacity.gentleman, capacity.lady]) {
    if (!Number.isInteger(value) || value < 0 || value > 500) {
      throw new ParlorRuleError("Capacity is a whole number from 0 to 500.");
    }
  }
  const next = clone(state);
  next.capacity = { gentleman: capacity.gentleman, lady: capacity.lady };
  return next;
}
function clock(value, label) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new ParlorRuleError(`${label} needs a time like 19:30.`);
  }
  return value;
}
function roomText(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}
function updateEvent(state, input) {
  const rooms = Array.isArray(input.evening?.rooms) ? input.evening.rooms : [];
  if (rooms.length < 1 || rooms.length > 8) {
    throw new ParlorRuleError("Keep between one and eight rooms.");
  }
  const seen = /* @__PURE__ */ new Set();
  const nextRooms = rooms.map((room) => {
    const id = roomText(room?.id, 40);
    if (!/^[a-z0-9-]{1,40}$/.test(id) || seen.has(id)) {
      throw new ParlorRuleError("Each room needs its own short id.");
    }
    seen.add(id);
    return {
      id,
      name: required(roomText(room?.name, 60), "Each room needs a name.", 60),
      description: roomText(room?.description, 400)
    };
  });
  const evening = input.evening ?? { arrival: "", games: "", rooms: [] };
  const event = {
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
      rooms: nextRooms
    }
  };
  const next = clone(state);
  next.event = event;
  return next;
}
function upsertBounty(state, bounty) {
  const title = required(bounty.title, "A role needs a name.", 80);
  const description = bounty.description.trim().slice(0, 280);
  const next = clone(state);
  const index = next.bounties.findIndex((item) => item.id === bounty.id);
  const saved = { id: bounty.id, title, description, active: Boolean(bounty.active) };
  if (index < 0) next.bounties.push(saved);
  else next.bounties[index] = saved;
  return next;
}
function removeBounty(state, bountyId) {
  const next = clone(state);
  next.bounties = next.bounties.filter((bounty) => bounty.id !== bountyId);
  return next;
}
function removeReferral(state, referralId) {
  const next = clone(state);
  next.referrals = next.referrals.filter((referral) => referral.id !== referralId);
  return next;
}
function resolveProposal(state, slotId, proposalId, decision) {
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
function requireSlot(state, slotId) {
  const slot = state.schedule.find((item) => item.id === slotId);
  if (!slot) throw new ParlorRuleError("That hour is no longer on the schedule.");
  return slot;
}
function updateSlot(state, slotId, input) {
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
function cleanSeatLimit(value) {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 200) {
    throw new ParlorRuleError("A seat limit is a whole number, or empty for drop-in.");
  }
  return value;
}
function createSlot(state, input) {
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
    proposals: []
  });
  return next;
}
function removeSlot(state, slotId) {
  const next = clone(state);
  if (!next.schedule.some((slot) => slot.id === slotId)) {
    throw new ParlorRuleError("That hour is no longer on the schedule.");
  }
  next.schedule = next.schedule.filter((slot) => slot.id !== slotId);
  return next;
}

// src/parlor/store.ts
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  put
} from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

// src/parlor/templates.ts
var HOUSE_STAFF_ASK = {
  title: "House staff",
  message: "Would you join the house staff for a stretch of the evening \u2014 the door, the coats, the donations, the drinks, and the phone custom? Actor types are especially welcome."
};

// src/parlor/seed.ts
function createSeed() {
  return {
    schemaVersion: 1,
    version: 1,
    event: {
      name: "Parlor",
      workingTitle: "New York Parlor",
      dateLabel: "Friday, November 20, 2026",
      dateIsTentative: true,
      alternateDateLabel: "Friday, November 13, 2026",
      timeLabel: "Friday evening",
      location: "Fractal Campus",
      invitationNote: "You are invited to a Friday evening of games at Fractal Campus. Play, put on a small show for one another, wander from room to room, and step a little out of your shell.",
      phonesNote: "Leave your phone in your coat. If you need it, step outside at the front \u2014 or into the phone room, should the weather turn.",
      donationNote: "A voluntary donation of $20 is suggested, for complimentary drinks and the small accoutrements of the evening.",
      scheduleNote: "A draft of the rooms and hours. Open tables are waiting for someone to claim them.",
      evening: {
        arrival: "You will be met at the door, and the evening begins with a small ceremony. Are you checking in for the evening? May I take your name? May I take your coat? A short spoken guide follows, and then the house is yours to wander. Phones go with the coat. You may be asked: Will you be making a voluntary donation to the Parlor this evening? We suggest $20 per person to cover complimentary beverages and accoutrements. Declining is perfectly graceful.",
        games: "Poker is welcome. Blackjack is not \u2014 this is not a gambling parlor. Bring classics, party games, games of nerve and of humor, cooperative games, competitive games, and the odd ones that borrow a little intelligence from a machine. If a spare board game is gathering dust at home, bring it. The house is starting a Fractal game shelf, and the shelf begins with what you donate.",
        rooms: [
          {
            id: "main",
            name: "Main room",
            description: "Board games from the shelf, and free play all evening."
          },
          {
            id: "office",
            name: "The Office",
            description: "A pop-up fortune teller, a therapist, and a Change Your Life room. Be warned: if you enter, you will be dared to take a risk."
          },
          {
            id: "roof",
            name: "The Roof",
            description: "Still being decided."
          },
          {
            id: "back",
            name: "The Back room",
            description: "Still being decided."
          }
        ]
      }
    },
    capacity: { gentleman: 8, lady: 8 },
    guests: [
      {
        id: "guest_daniel",
        token: "MdojZFEW6dsU7YUcsDZp4uuZ",
        name: "Daniel",
        email: "daniel@example.com",
        category: "gentleman",
        rsvp: null,
        plusOne: null,
        example: true,
        asks: [
          {
            id: "ask_daniel_butler",
            title: "Head Butler",
            message: "Would you be Head Butler for the evening? Train the volunteer staff, and keep the little scripts \u2014 the door, the coats, the welcome \u2014 running with grace.",
            response: null,
            note: ""
          }
        ]
      },
      {
        id: "guest_janita",
        token: "1Htd8NUZS_8g-hkm2725QnOH",
        name: "Janita",
        email: "janita@example.com",
        category: "lady",
        rsvp: null,
        plusOne: null,
        example: true,
        asks: [
          {
            id: "ask_janita_alien",
            title: "The AI-alien game",
            message: "Would you host the AI-alien game you and your friends invented, and teach the room how it is played?",
            response: null,
            note: ""
          }
        ]
      },
      {
        id: "guest_jay",
        token: "9uW9yrLKxWO1yvJu6QrNn6lz",
        name: "Jay",
        email: "jay@example.com",
        category: "gentleman",
        rsvp: null,
        plusOne: null,
        example: true,
        asks: [
          {
            id: "ask_jay_catan",
            title: "A Catan table",
            message: "Would you host a table of Catan? Claim a corner of the main room and deal the first tiles.",
            response: null,
            note: ""
          }
        ]
      },
      {
        id: "guest_jasmine",
        token: "as498SS68ftkeEd2_6949QB0",
        name: "Jasmine",
        email: "jasmine@example.com",
        category: "lady",
        rsvp: null,
        plusOne: null,
        example: true,
        asks: [
          {
            id: "ask_jasmine_staff",
            title: HOUSE_STAFF_ASK.title,
            message: HOUSE_STAFF_ASK.message,
            response: null,
            note: ""
          }
        ]
      }
    ],
    bounties: [
      {
        id: "bounty_jester",
        title: "A jester",
        description: "Someone who will keep a room laughing.",
        active: true
      },
      {
        id: "bounty_boisterous",
        title: "Someone boisterous",
        description: "A person who can warm a quiet room.",
        active: true
      },
      {
        id: "bounty_courageous",
        title: "Someone courageous",
        description: "A person willing to go first.",
        active: true
      }
    ],
    referrals: [],
    schedule: [
      {
        id: "slot_main_arrival",
        roomId: "main",
        startsAt: "19:30",
        endsAt: "20:15",
        title: "Arrival",
        description: "Coats, names, and the welcome.",
        seatLimit: null,
        reservations: [],
        proposals: []
      },
      {
        id: "slot_main_shelf",
        roomId: "main",
        startsAt: "20:15",
        endsAt: "21:45",
        title: "Open shelf",
        description: "Board games, free play.",
        seatLimit: null,
        reservations: [],
        proposals: []
      },
      {
        id: "slot_office_change",
        roomId: "office",
        startsAt: "20:15",
        endsAt: "21:45",
        title: "Change Your Life",
        description: "The fortune teller, the therapist, and a dare.",
        seatLimit: null,
        reservations: [],
        proposals: []
      },
      {
        id: "slot_main_open",
        roomId: "main",
        startsAt: "21:45",
        endsAt: "23:15",
        title: "",
        description: "An open table.",
        seatLimit: 4,
        reservations: [],
        proposals: []
      },
      {
        id: "slot_office_open",
        roomId: "office",
        startsAt: "21:45",
        endsAt: "23:15",
        title: "",
        description: "An open hour.",
        seatLimit: 4,
        reservations: [],
        proposals: []
      },
      {
        id: "slot_roof_open",
        roomId: "roof",
        startsAt: "20:15",
        endsAt: "23:15",
        title: "",
        description: "Still being decided.",
        seatLimit: null,
        reservations: [],
        proposals: []
      },
      {
        id: "slot_back_open",
        roomId: "back",
        startsAt: "20:15",
        endsAt: "23:15",
        title: "",
        description: "Still being decided.",
        seatLimit: null,
        reservations: [],
        proposals: []
      }
    ]
  };
}

// src/parlor/store.ts
function databaseUrl() {
  const value = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  return value.trim() ? value.trim() : null;
}
function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}
function storeDriver() {
  if (process.env.PARLOR_STORE === "file") return "file";
  if (databaseUrl()) return "postgres";
  if (blobConfigured()) return "blob";
  return "file";
}
function storeInfo() {
  const driver = storeDriver();
  if (driver === "postgres") {
    return {
      driver,
      persistent: true,
      note: "Responses are saved to Neon Postgres."
    };
  }
  if (driver === "blob") {
    return {
      driver,
      persistent: true,
      note: "Responses are saved to a private Vercel Blob."
    };
  }
  const persistent = !process.env.VERCEL;
  return {
    driver,
    persistent,
    note: persistent ? "Responses are saved in a local file (.data/parlor.json). See docs/parlor.md for the Vercel store." : "This deployment has no ledger store, so a response can disappear when the function sleeps."
  };
}
function filePath() {
  if (process.env.PARLOR_DATA_FILE) return process.env.PARLOR_DATA_FILE;
  if (process.env.VERCEL) return "/tmp/parlor-state.json";
  return path.join(process.cwd(), ".data", "parlor.json");
}
function parseState(value) {
  const doc = typeof value === "string" ? JSON.parse(value) : value;
  if (!doc || typeof doc !== "object") throw new Error("Parlor ledger is unreadable.");
  const state = doc;
  if (state.schemaVersion !== 1 || !Array.isArray(state.guests) || !state.event?.name) {
    throw new Error("Parlor ledger is unreadable.");
  }
  return state;
}
var queue = Promise.resolve();
function enqueue(work) {
  const run = queue.then(work, work);
  queue = run.then(
    () => void 0,
    () => void 0
  );
  return run;
}
function fileStore() {
  const file = filePath();
  async function persist(state) {
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(state, null, 2));
    await rename(temporary, file);
  }
  async function read() {
    try {
      return parseState(await readFile(file, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const seed = createSeed();
      await persist(seed);
      return seed;
    }
  }
  return {
    read: () => enqueue(read),
    write: (update) => enqueue(async () => {
      const current = await read();
      const next = update(structuredClone(current));
      next.version = current.version + 1;
      await persist(next);
      return next;
    })
  };
}
var sqlSingleton = null;
var schemaReady = null;
function sql() {
  if (!sqlSingleton) {
    const url = databaseUrl();
    if (!url) throw new Error("DATABASE_URL is not set.");
    sqlSingleton = neon(url);
  }
  return sqlSingleton;
}
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql().query(
        `CREATE TABLE IF NOT EXISTS parlor_state (
          id text PRIMARY KEY,
          version integer NOT NULL,
          doc jsonb NOT NULL
        )`
      );
      const seed = createSeed();
      await sql().query(
        `INSERT INTO parlor_state (id, version, doc)
         VALUES ('current', $1, $2::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [seed.version, JSON.stringify(seed)]
      );
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
async function readRow() {
  await ensureSchema();
  const rows = await sql().query("SELECT version, doc FROM parlor_state WHERE id = 'current'");
  const row = rows[0];
  if (!row) throw new Error("Parlor ledger is missing.");
  const state = parseState(row.doc);
  state.version = Number(row.version);
  return state;
}
function postgresStore() {
  return {
    read: () => enqueue(readRow),
    write: (update) => enqueue(async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const current = await readRow();
        const next = update(structuredClone(current));
        next.version = current.version + 1;
        const rows = await sql().query(
          `UPDATE parlor_state
             SET version = $1, doc = $2::jsonb
             WHERE id = 'current' AND version = $3
             RETURNING version`,
          [next.version, JSON.stringify(next), current.version]
        );
        if (rows.length > 0) return next;
      }
      throw new Error("The ledger was busy. Try again.");
    })
  };
}
var BLOB_PATH = "parlor/state.json";
function normalizeEtag(etag) {
  const weak = etag.trim().replace(/^W\//, "");
  if (weak.startsWith('"') && weak.endsWith('"')) return weak.slice(1, -1);
  return weak;
}
function blobStore() {
  async function loadBlob() {
    try {
      const result = await get(BLOB_PATH, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const text2 = await new Response(result.stream).text();
      return { state: parseState(text2), etag: normalizeEtag(result.blob.etag) };
    } catch (error) {
      if (error instanceof BlobNotFoundError) return null;
      throw error;
    }
  }
  async function readBlob() {
    const existing = await loadBlob();
    if (existing) return existing;
    const seed = createSeed();
    try {
      const saved = await put(BLOB_PATH, JSON.stringify(seed), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 60
      });
      return { state: seed, etag: normalizeEtag(saved.etag) };
    } catch (error) {
      const raced = await loadBlob();
      if (raced) return raced;
      throw error;
    }
  }
  return {
    read: () => enqueue(async () => (await readBlob()).state),
    write: (update) => enqueue(async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const current = await readBlob();
        const next = update(structuredClone(current.state));
        next.version = current.state.version + 1;
        const conditional = attempt < 4 && current.etag.length > 0;
        try {
          await put(BLOB_PATH, JSON.stringify(next), {
            access: "private",
            contentType: "application/json",
            addRandomSuffix: false,
            allowOverwrite: true,
            ...conditional ? { ifMatch: current.etag } : {},
            cacheControlMaxAge: 60
          });
          return next;
        } catch (error) {
          if (error instanceof BlobPreconditionFailedError) continue;
          throw error;
        }
      }
      throw new Error("The ledger was busy. Try again.");
    })
  };
}
var cached = null;
function getStore() {
  if (!cached) {
    const driver = storeDriver();
    cached = driver === "postgres" ? postgresStore() : driver === "blob" ? blobStore() : fileStore();
  }
  return cached;
}

// src/parlor/http.ts
var COOKIE = "parlor_admin";
var AuthError = class extends Error {
  constructor() {
    super("The desk is locked.");
    this.name = "AuthError";
  }
};
function newId(prefix) {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}
function password() {
  const value = process.env.PARLOR_ADMIN_PASSWORD?.trim();
  return value ? value : null;
}
function signSession() {
  const secret = password();
  if (!secret) throw new Error("PARLOR_ADMIN_PASSWORD is not set.");
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1e3 })).toString(
    "base64url"
  );
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
function sessionValid(token) {
  const secret = password();
  if (!secret || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof body.exp === "number" && body.exp > Date.now();
  } catch {
    return false;
  }
}
function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
function cookieHeader(request, value, maxAge) {
  const secure = request.headers.get("x-forwarded-proto") === "https" || new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${encodeURIComponent(value)}; HttpOnly; Path=/api/parlor; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
function json(body, status = 200, setCookie) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  if (setCookie) headers.append("set-cookie", setCookie);
  return new Response(JSON.stringify(body), { status, headers });
}
function assertAdmin(request) {
  if (!sessionValid(readCookie(request.headers.get("cookie"), COOKIE))) throw new AuthError();
}
async function adminPayload() {
  const state = await getStore().read();
  return { state, store: storeInfo(), summary: attendanceSummary(state) };
}
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ParlorRuleError("The house could not read that.");
  }
  return value;
}
function text(value) {
  return typeof value === "string" ? value : "";
}
function category(value) {
  if (value !== "gentleman" && value !== "lady") {
    throw new ParlorRuleError("Choose gentleman or lady.");
  }
  return value;
}
function tokenOf(value) {
  const token = text(value).trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  return token;
}
async function readJson(request) {
  const raw = await request.text();
  if (raw.length > 1e5) throw new ParlorRuleError("That note is too long.");
  if (!raw) return {};
  try {
    return record(JSON.parse(raw));
  } catch (error) {
    if (error instanceof ParlorRuleError) throw error;
    throw new ParlorRuleError("The house could not read that.");
  }
}
async function guestResponse(token) {
  const state = await getStore().read();
  return json(toGuestView(state, token));
}
async function mutateGuest(token, update) {
  const state = await getStore().write(update);
  return json(toGuestView(state, token));
}
async function handleParlorRequest(request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method.toUpperCase();
    if (pathname === "/api/parlor/lookup" && method === "POST") {
      const body = await readJson(request);
      const email = text(body.email).trim();
      if (!email.includes("@")) {
        return json({ error: "Enter the email address on your invitation." }, 400);
      }
      const state = await getStore().read();
      const guest = guestByEmail(state, email);
      return json(guest ? { found: true, token: guest.token } : { found: false });
    }
    if (pathname === "/api/parlor/invitation" && method === "GET") {
      return guestResponse(tokenOf(url.searchParams.get("g")));
    }
    if (pathname === "/api/parlor/invitation" && method === "POST") {
      const body = await readJson(request);
      const token = tokenOf(body.token);
      const type = text(body.type);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      if (type === "rsvp") {
        if (body.rsvp !== "yes" && body.rsvp !== "no") {
          throw new ParlorRuleError("Choose whether you will attend.");
        }
        return mutateGuest(token, (state) => setRsvp(state, token, body.rsvp));
      }
      if (type === "ask") {
        if (body.response !== "accept" && body.response !== "decline") {
          throw new ParlorRuleError("Accept or decline the request.");
        }
        return mutateGuest(
          token,
          (state) => setAskResponse(state, token, text(body.askId), body.response, text(body.note))
        );
      }
      if (type === "plus-one") {
        if (body.plusOne == null) {
          return mutateGuest(token, (state) => setPlusOne(state, token, null));
        }
        const plus = record(body.plusOne);
        return mutateGuest(
          token,
          (state) => setPlusOne(state, token, { name: text(plus.name), category: category(plus.category) })
        );
      }
      if (type === "referral") {
        return mutateGuest(
          token,
          (state) => addReferral(
            state,
            token,
            {
              name: text(body.name),
              contact: text(body.contact),
              why: text(body.why),
              bountyId: text(body.bountyId) || null
            },
            newId("ref"),
            now
          )
        );
      }
      if (type === "reserve") {
        return mutateGuest(token, (state) => reserveSeat(state, token, text(body.slotId), newId("rsv")));
      }
      if (type === "release") {
        return mutateGuest(token, (state) => releaseSeat(state, token, text(body.slotId)));
      }
      if (type === "propose") {
        return mutateGuest(
          token,
          (state) => proposeSlot(
            state,
            token,
            text(body.slotId),
            { title: text(body.title), note: text(body.note) },
            newId("prp"),
            now
          )
        );
      }
      throw new ParlorRuleError("The house could not read that.");
    }
    if (pathname === "/api/parlor/admin/login" && method === "POST") {
      if (!password()) {
        return json(
          { error: "The desk has no password yet. Set PARLOR_ADMIN_PASSWORD." },
          503
        );
      }
      const body = await readJson(request);
      const attempt = text(body.password);
      const expected = password() ?? "";
      const left = Buffer.from(attempt);
      const right = Buffer.from(expected);
      const match = left.length === right.length && timingSafeEqual(left, right);
      if (!match) return json({ error: "That is not the word for the desk." }, 401);
      return json({ ok: true }, 200, cookieHeader(request, signSession(), 12 * 60 * 60));
    }
    if (pathname === "/api/parlor/admin/logout" && method === "POST") {
      return json({ ok: true }, 200, cookieHeader(request, "", 0));
    }
    if (pathname === "/api/parlor/admin" && method === "GET") {
      assertAdmin(request);
      return json(await adminPayload());
    }
    if (pathname === "/api/parlor/admin" && method === "POST") {
      assertAdmin(request);
      const body = await readJson(request);
      const type = text(body.type);
      const state = await getStore().write((current) => {
        if (type === "event") {
          if (!body.event || typeof body.event !== "object") {
            throw new ParlorRuleError("The house could not read that.");
          }
          return updateEvent(current, body.event);
        }
        if (type === "capacity") {
          return updateCapacity(current, {
            gentleman: Number(body.gentleman),
            lady: Number(body.lady)
          });
        }
        if (type === "guest-upsert") {
          return upsertGuest(
            current,
            {
              id: text(body.id) || void 0,
              name: text(body.name),
              email: text(body.email),
              category: category(body.category)
            },
            { id: newId("guest"), token: randomBytes(18).toString("base64url") }
          );
        }
        if (type === "guest-remove") return removeGuest(current, text(body.guestId));
        if (type === "ask-add") {
          return addAsk(current, text(body.guestId), {
            id: newId("ask"),
            title: text(body.title),
            message: text(body.message)
          });
        }
        if (type === "ask-update") {
          return updateAsk(current, text(body.guestId), text(body.askId), text(body.title), text(body.message));
        }
        if (type === "ask-remove") return removeAsk(current, text(body.guestId), text(body.askId));
        if (type === "plus-one") {
          const status = text(body.status);
          if (status !== "accepted" && status !== "waitlist" && status !== "clear") {
            throw new ParlorRuleError("Choose what to do with the plus-one.");
          }
          return setPlusOneStatus(current, text(body.guestId), status);
        }
        if (type === "bounty-upsert") {
          return upsertBounty(current, {
            id: text(body.id) || newId("bounty"),
            title: text(body.title),
            description: text(body.description),
            active: Boolean(body.active)
          });
        }
        if (type === "bounty-remove") return removeBounty(current, text(body.bountyId));
        if (type === "referral-remove") return removeReferral(current, text(body.referralId));
        if (type === "proposal") {
          if (body.decision !== "approved" && body.decision !== "declined") {
            throw new ParlorRuleError("Approve or decline the proposal.");
          }
          return resolveProposal(current, text(body.slotId), text(body.proposalId), body.decision);
        }
        if (type === "slot-update") {
          return updateSlot(current, text(body.slotId), {
            startsAt: text(body.startsAt),
            endsAt: text(body.endsAt),
            title: text(body.title),
            description: text(body.description),
            seatLimit: body.seatLimit == null || body.seatLimit === "" ? null : Number(body.seatLimit)
          });
        }
        if (type === "slot-create") {
          return createSlot(current, {
            id: newId("slot"),
            roomId: text(body.roomId),
            startsAt: text(body.startsAt),
            endsAt: text(body.endsAt),
            seatLimit: body.seatLimit == null || body.seatLimit === "" ? null : Number(body.seatLimit)
          });
        }
        if (type === "slot-remove") return removeSlot(current, text(body.slotId));
        throw new ParlorRuleError("The house could not read that.");
      });
      return json({ state, store: storeInfo(), summary: attendanceSummary(state) });
    }
    return json({ error: "Not found." }, 404);
  } catch (error) {
    if (error instanceof ParlorRuleError) return json({ error: error.message }, error.status);
    if (error instanceof AuthError) return json({ error: error.message }, 401);
    console.error(error);
    return json({ error: "The house ledger is unavailable." }, 500);
  }
}

// src/parlor/node-adapter.ts
var SKIP_HEADERS = /* @__PURE__ */ new Set(["host", "connection", "content-length", "transfer-encoding"]);
async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length > 0 && Buffer.concat(chunks).length > 0) return Buffer.concat(chunks);
  if (typeof req.body === "string") return Buffer.from(req.body);
  if (req.body != null && typeof req.body === "object") return Buffer.from(JSON.stringify(req.body));
  return Buffer.alloc(0);
}
async function handleNodeParlor(req, res) {
  const host = req.headers.host ?? "localhost";
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) ?? "http";
  const url = new URL(req.url ?? "/", `${proto}://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null || SKIP_HEADERS.has(key.toLowerCase())) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const method = req.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? void 0 : await rawBody(req);
  const request = new Request(url, {
    method,
    headers,
    body: body && body.byteLength > 0 ? new Uint8Array(body) : void 0
  });
  const response = await handleParlorRequest(request);
  res.statusCode = response.status;
  const cookies = response.headers.getSetCookie?.() ?? [];
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    res.setHeader(key, value);
  });
  if (cookies.length > 0) res.setHeader("set-cookie", cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}
export {
  handleNodeParlor,
  handleParlorRequest
};
