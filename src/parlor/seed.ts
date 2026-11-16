import { HOUSE_STAFF_ASK } from "./templates";
import type { ParlorState } from "./types";

/**
 * First-run ledger. Marked example data throughout.
 * Event copy is a placeholder — the desk can replace every line, and a fresh
 * store (delete `.data/parlor.json`, or an empty database) picks this up again.
 *
 * Tokens are unguessable and stable so a preview link in the pull request
 * keeps working. They are server-side only.
 */
export function createSeed(): ParlorState {
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
      invitationNote:
        "You are invited to a Friday evening of games at Fractal Campus. Play, put on a small show for one another, wander from room to room, and step a little out of your shell.",
      phonesNote:
        "Leave your phone in your coat. If you need it, step outside at the front — or into the phone room, should the weather turn.",
      donationNote:
        "A voluntary donation of $20 is suggested, for complimentary drinks and the small accoutrements of the evening.",
      scheduleNote:
        "A draft of the rooms and hours. Open tables are waiting for someone to claim them.",
      evening: {
        arrival:
          "You will be met at the door, and the evening begins with a small ceremony. Are you checking in for the evening? May I take your name? May I take your coat? A short spoken guide follows, and then the house is yours to wander. Phones go with the coat. You may be asked: Will you be making a voluntary donation to the Parlor this evening? We suggest $20 per person to cover complimentary beverages and accoutrements. Declining is perfectly graceful.",
        games:
          "Poker is welcome. Blackjack is not — this is not a gambling parlor. Bring classics, party games, games of nerve and of humor, cooperative games, competitive games, and the odd ones that borrow a little intelligence from a machine. If a spare board game is gathering dust at home, bring it. The house is starting a Fractal game shelf, and the shelf begins with what you donate.",
        rooms: [
          {
            id: "main",
            name: "Main room",
            description: "Board games from the shelf, and free play all evening.",
          },
          {
            id: "office",
            name: "The Office",
            description:
              "A pop-up fortune teller, a therapist, and a Change Your Life room. Be warned: if you enter, you will be dared to take a risk.",
          },
          {
            id: "roof",
            name: "The Roof",
            description: "Still being decided.",
          },
          {
            id: "back",
            name: "The Back room",
            description: "Still being decided.",
          },
        ],
      },
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
            message:
              "Would you be Head Butler for the evening? Train the volunteer staff, and keep the little scripts — the door, the coats, the welcome — running with grace.",
            response: null,
            note: "",
          },
        ],
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
            message:
              "Would you host the AI-alien game you and your friends invented, and teach the room how it is played?",
            response: null,
            note: "",
          },
        ],
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
            message:
              "Would you host a table of Catan? Claim a corner of the main room and deal the first tiles.",
            response: null,
            note: "",
          },
        ],
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
            note: "",
          },
        ],
      },
    ],
    bounties: [
      {
        id: "bounty_jester",
        title: "A jester",
        description: "Someone who will keep a room laughing.",
        active: true,
      },
      {
        id: "bounty_boisterous",
        title: "Someone boisterous",
        description: "A person who can warm a quiet room.",
        active: true,
      },
      {
        id: "bounty_courageous",
        title: "Someone courageous",
        description: "A person willing to go first.",
        active: true,
      },
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
        proposals: [],
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
        proposals: [],
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
        proposals: [],
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
        proposals: [],
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
        proposals: [],
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
        proposals: [],
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
        proposals: [],
      },
    ],
  };
}
