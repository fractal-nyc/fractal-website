import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { handleParlorRequest } from "@/parlor/http";
import {
  guestByToken,
  setPlusOne,
  setRsvp,
  toGuestView,
} from "@/parlor/logic";
import { createSeed } from "@/parlor/seed";
import { getStore, resetStoreForTests } from "@/parlor/store";

const danielToken = "MdojZFEW6dsU7YUcsDZp4uuZ";
const jayToken = "9uW9yrLKxWO1yvJu6QrNn6lz";

describe("parlor rules", () => {
  it("lets an invited guest attend even when the category is already full", () => {
    const state = createSeed();
    state.capacity.gentleman = 0;
    const next = setRsvp(state, danielToken, "yes");
    expect(guestByToken(next, danielToken)?.rsvp).toBe("yes");
  });

  it("asks for a lady when a gentleman plus-one will not fit, and hides other guests", () => {
    let state = createSeed();
    state.capacity = { gentleman: 1, lady: 1 };
    state = setRsvp(state, danielToken, "yes");
    state = setRsvp(state, jayToken, "yes");
    state = setPlusOne(state, danielToken, { name: "Ada", category: "gentleman" });

    const daniel = guestByToken(state, danielToken);
    expect(daniel?.plusOne?.status).toBe("waitlist");

    const view = toGuestView(state, danielToken);
    expect(view.plusOneAvailability.gentleman.open).toBe(false);
    expect(view.plusOneAvailability.gentleman.closedMessage).toMatch(/invite a lady/i);
    expect(view.plusOneAvailability.gentleman.closedMessage).not.toMatch(/ratio|balance|quota/i);
    expect(view.plusOneAvailability.lady.open).toBe(true);

    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain("jay@example.com");
    expect(serialized).not.toContain(jayToken);
    expect(serialized).not.toContain("Janita");
    expect(serialized).toContain("Dear".slice(0, 0) + "Daniel");
  });

  it("accepts a plus-one once a seat is free again", () => {
    let state = createSeed();
    state.capacity = { gentleman: 2, lady: 2 };
    state = setRsvp(state, danielToken, "yes");
    state = setRsvp(state, jayToken, "yes");
    state = setPlusOne(state, danielToken, { name: "Ada", category: "gentleman" });
    expect(guestByToken(state, danielToken)?.plusOne?.status).toBe("waitlist");

    state = setRsvp(state, jayToken, "no");
    expect(guestByToken(state, danielToken)?.plusOne?.status).toBe("waitlist");

    state = setPlusOne(state, danielToken, { name: "Ada", category: "gentleman" });
    expect(guestByToken(state, danielToken)?.plusOne?.status).toBe("accepted");
  });
});

describe("parlor http", () => {
  let directory = "";

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "parlor-"));
    process.env.PARLOR_STORE = "file";
    process.env.PARLOR_DATA_FILE = path.join(directory, "state.json");
    process.env.PARLOR_ADMIN_PASSWORD = "correct-horse";
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    delete process.env.VERCEL;
    resetStoreForTests();
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
    resetStoreForTests();
  });

  it("opens a known invitation and stays quiet about unknown addresses", async () => {
    const known = await handleParlorRequest(
      new Request("http://localhost/api/parlor/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "  Daniel@Example.com " }),
      }),
    );
    expect(known.status).toBe(200);
    expect(await known.json()).toEqual({ found: true, token: danielToken });

    const unknown = await handleParlorRequest(
      new Request("http://localhost/api/parlor/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "stranger@example.com" }),
      }),
    );
    const body = await unknown.json();
    expect(unknown.status).toBe(200);
    expect(body).toEqual({ found: false });
    expect(JSON.stringify(body)).not.toContain("@");
  });

  it("saves an RSVP and an ask, then shows them on the desk", async () => {
    const saved = await handleParlorRequest(
      new Request("http://localhost/api/parlor/invitation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: danielToken,
          type: "ask",
          askId: "ask_daniel_butler",
          response: "accept",
          note: "I have the script.",
        }),
      }),
    );
    expect(saved.status).toBe(200);
    const view = await saved.json();
    expect(view.guest.asks[0].response).toBe("accept");

    resetStoreForTests();
    const again = await getStore().read();
    expect(again.guests.find((guest) => guest.id === "guest_daniel")?.asks[0].response).toBe("accept");

    const denied = await handleParlorRequest(new Request("http://localhost/api/parlor/admin"));
    expect(denied.status).toBe(401);

    const login = await handleParlorRequest(
      new Request("http://localhost/api/parlor/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "correct-horse" }),
      }),
    );
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie")?.split(";")[0] ?? "";
    const desk = await handleParlorRequest(
      new Request("http://localhost/api/parlor/admin", { headers: { cookie } }),
    );
    expect(desk.status).toBe(200);
    const payload = await desk.json();
    expect(payload.summary.waiting).toBe(4);
    expect(payload.state.guests.find((guest: { id: string }) => guest.id === "guest_daniel").asks[0].note).toBe(
      "I have the script.",
    );
  });
});
