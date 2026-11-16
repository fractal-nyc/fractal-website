/**
 * Parlor invitation ledger.
 *
 * One document holds the evening, the guest list, per-guest asks, referrals,
 * and the room schedule. Guests only ever receive a redacted view.
 */

export type Category = "gentleman" | "lady";

export type Rsvp = "yes" | "no" | null;

export type AskResponse = "accept" | "decline" | null;

export type PlusOneStatus = "accepted" | "waitlist";

export type ProposalStatus = "pending" | "approved" | "declined";

export type ParlorRoom = {
  id: string;
  name: string;
  description: string;
};

export type ParlorEvening = {
  arrival: string;
  games: string;
  rooms: ParlorRoom[];
};

/** Editable copy. Seed values are placeholders until the host saves new ones. */
export type ParlorEvent = {
  name: string;
  workingTitle: string;
  dateLabel: string;
  dateIsTentative: boolean;
  alternateDateLabel: string;
  timeLabel: string;
  location: string;
  invitationNote: string;
  phonesNote: string;
  donationNote: string;
  scheduleNote: string;
  evening: ParlorEvening;
};

export type GuestAsk = {
  id: string;
  title: string;
  message: string;
  response: AskResponse;
  note: string;
};

export type PlusOne = {
  name: string;
  category: Category;
  status: PlusOneStatus;
};

export type Guest = {
  id: string;
  /** Unguessable link secret. Never sent to other guests. */
  token: string;
  name: string;
  email: string;
  category: Category;
  rsvp: Rsvp;
  plusOne: PlusOne | null;
  asks: GuestAsk[];
  /** Sample people shipped so the preview can be walked through. */
  example: boolean;
};

export type Bounty = {
  id: string;
  title: string;
  description: string;
  active: boolean;
};

export type Referral = {
  id: string;
  guestId: string;
  guestName: string;
  name: string;
  contact: string;
  why: string;
  bountyId: string | null;
  createdAt: string;
};

export type ScheduleReservation = {
  id: string;
  guestId: string;
  guestName: string;
};

export type ScheduleProposal = {
  id: string;
  guestId: string;
  guestName: string;
  title: string;
  note: string;
  status: ProposalStatus;
  createdAt: string;
};

/**
 * A cell in the room-by-time grid.
 * An empty title is an open hour guests may propose into.
 * A title with a numeric seatLimit can be reserved.
 * A title with a null seatLimit is drop-in.
 */
export type ScheduleSlot = {
  id: string;
  roomId: string;
  /** 24-hour `HH:MM`, so the desk can sort and edit with a time input. */
  startsAt: string;
  endsAt: string;
  title: string;
  description: string;
  seatLimit: number | null;
  reservations: ScheduleReservation[];
  proposals: ScheduleProposal[];
};

export type ParlorState = {
  schemaVersion: 1;
  version: number;
  event: ParlorEvent;
  capacity: Record<Category, number>;
  guests: Guest[];
  bounties: Bounty[];
  referrals: Referral[];
  schedule: ScheduleSlot[];
};

export type StoreInfo = {
  driver: "postgres" | "blob" | "file";
  persistent: boolean;
  note: string;
};

export type AttendanceSummary = {
  coming: number;
  declined: number;
  waiting: number;
  seats: Record<Category, { taken: number; capacity: number }>;
};

export type PlusOneAvailability = {
  open: boolean;
  closedMessage: string;
};

export type GuestScheduleSlot = {
  id: string;
  roomName: string;
  startsAt: string;
  endsAt: string;
  title: string;
  description: string;
  kind: "drop-in" | "seated" | "open";
  seatsLeft: number | null;
  seatLimit: number | null;
  reservedByYou: boolean;
  yourProposal: { title: string; status: ProposalStatus } | null;
};

export type GuestReferral = {
  id: string;
  name: string;
  contact: string;
  why: string;
  bountyTitle: string | null;
};

/** What one guest is allowed to see. No other names, emails, or tokens. */
export type GuestView = {
  event: ParlorEvent;
  guest: {
    name: string;
    rsvp: Rsvp;
    plusOne: PlusOne | null;
    asks: GuestAsk[];
  };
  plusOneAvailability: Record<Category, PlusOneAvailability>;
  bounties: Array<Pick<Bounty, "id" | "title" | "description">>;
  referrals: GuestReferral[];
  schedule: GuestScheduleSlot[];
};

export type AdminPayload = {
  state: ParlorState;
  store: StoreInfo;
  summary: AttendanceSummary;
};
