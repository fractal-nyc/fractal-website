import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { ParlorAdminPage } from "@/pages/ParlorAdminPage";
import { ParlorPage } from "@/pages/ParlorPage";
import type { GuestView } from "@/parlor/types";

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => null,
}));

const view: GuestView = {
  event: {
    name: "Parlor",
    workingTitle: "New York Parlor",
    dateLabel: "Friday, November 20, 2026",
    dateIsTentative: true,
    alternateDateLabel: "Friday, November 13, 2026",
    timeLabel: "Friday evening",
    location: "Fractal Campus",
    invitationNote: "You are invited to a Friday evening of games.",
    phonesNote: "Leave your phone in your coat.",
    donationNote: "A voluntary donation of $20 is suggested.",
    scheduleNote: "A draft of the rooms and hours.",
    evening: {
      arrival: "You will be met at the door.",
      games: "Poker is welcome.",
      rooms: [{ id: "main", name: "Main room", description: "Board games from the shelf." }],
    },
  },
  guest: {
    name: "Daniel",
    rsvp: null,
    plusOne: null,
    asks: [
      {
        id: "ask_daniel_butler",
        title: "Head Butler",
        message: "Would you be Head Butler for the evening?",
        response: null,
        note: "",
      },
    ],
  },
  plusOneAvailability: {
    gentleman: { open: true, closedMessage: "There isn't room for another gentleman this evening." },
    lady: { open: true, closedMessage: "There isn't room for another lady this evening." },
  },
  bounties: [],
  referrals: [],
  schedule: [],
};

function renderAt(path: string, searchPath = "") {
  const { hook, searchHook } = memoryLocation({ path, searchPath, static: true });
  return render(
    <WouterRouter hook={hook} searchHook={searchHook}>
      {path === "/parlor/admin" ? <ParlorAdminPage /> : <ParlorPage />}
    </WouterRouter>,
  );
}

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("parlor pages", () => {
  it("keeps the gate to a single column at 375px and stays quiet when the address is unknown", async () => {
    setViewport(375);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ found: false }),
      ),
    );
    renderAt("/parlor");

    expect(screen.getByRole("heading", { name: "Who goes there?" })).toBeTruthy();
    expect(document.querySelector("[data-site-navbar]")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /parlor/i })).toBeNull();
    const field = screen.getByRole("textbox");
    expect(field.className).toContain("w-full");
    expect(screen.getByTestId("parlor-gate-actions").className).toContain("flex-col");

    fireEvent.change(field, { target: { value: "stranger@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Present yourself" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't find an invitation/i);
  });

  it("greets the guest and stacks the RSVP at phone width", async () => {
    setViewport(375);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(view)));
    renderAt("/parlor", "g=invite-token-000000");

    expect(await screen.findByRole("heading", { name: "Parlor" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Dear Daniel," })).toBeTruthy();
    expect(screen.getByText("Head Butler")).toBeTruthy();
    expect(screen.getByText(/Leave your phone in your coat/)).toBeTruthy();
    const rsvp = screen.getByTestId("parlor-rsvp");
    expect(rsvp.querySelector("div")?.className).toContain("flex-col");
    expect(screen.getByRole("button", { name: "With pleasure" })).toBeTruthy();
  });

  it("shows the desk password at 375px and 1280px", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "The desk is locked." }, { status: 401 })));
    for (const width of [375, 1280]) {
      setViewport(width);
      renderAt("/parlor/admin");
      expect(screen.getByRole("heading", { name: "The desk" })).toBeTruthy();
      expect(screen.getByLabelText("Password").className).toContain("w-full");
      cleanup();
    }
  });
});
