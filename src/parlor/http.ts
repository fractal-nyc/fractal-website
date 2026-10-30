import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import {
  addAsk,
  addReferral,
  attendanceSummary,
  createSlot,
  guestByEmail,
  ParlorRuleError,
  proposeSlot,
  releaseSeat,
  removeAsk,
  removeBounty,
  removeGuest,
  removeReferral,
  removeSlot,
  reserveSeat,
  resolveProposal,
  setAskResponse,
  setPlusOne,
  setPlusOneStatus,
  setRsvp,
  toGuestView,
  updateAsk,
  updateCapacity,
  updateEvent,
  updateSlot,
  upsertBounty,
  upsertGuest,
} from "./logic";
import { getStore, storeInfo } from "./store";
import type { AdminPayload, Category, ParlorEvent } from "./types";

const COOKIE = "parlor_admin";

class AuthError extends Error {
  constructor() {
    super("The desk is locked.");
    this.name = "AuthError";
  }
}

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}

function password(): string | null {
  const value = process.env.PARLOR_ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

function signSession(): string {
  const secret = password();
  if (!secret) throw new Error("PARLOR_ADMIN_PASSWORD is not set.");
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function sessionValid(token: string | null): boolean {
  const secret = password();
  if (!secret || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: unknown };
    return typeof body.exp === "number" && body.exp > Date.now();
  } catch {
    return false;
  }
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function cookieHeader(request: Request, value: string, maxAge: number): string {
  const secure =
    request.headers.get("x-forwarded-proto") === "https" || new URL(request.url).protocol === "https:"
      ? "; Secure"
      : "";
  return `${COOKIE}=${encodeURIComponent(value)}; HttpOnly; Path=/api/parlor; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function json(body: unknown, status = 200, setCookie?: string): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  if (setCookie) headers.append("set-cookie", setCookie);
  return new Response(JSON.stringify(body), { status, headers });
}

function assertAdmin(request: Request): void {
  if (!sessionValid(readCookie(request.headers.get("cookie"), COOKIE))) throw new AuthError();
}

async function adminPayload(): Promise<AdminPayload> {
  const state = await getStore().read();
  return { state, store: storeInfo(), summary: attendanceSummary(state) };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ParlorRuleError("The house could not read that.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function category(value: unknown): Category {
  if (value !== "gentleman" && value !== "lady") {
    throw new ParlorRuleError("Choose gentleman or lady.");
  }
  return value;
}

function tokenOf(value: unknown): string {
  const token = text(value).trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) {
    throw new ParlorRuleError("This invitation link is not one we recognize.", 404);
  }
  return token;
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.text();
  if (raw.length > 100_000) throw new ParlorRuleError("That note is too long.");
  if (!raw) return {};
  try {
    return record(JSON.parse(raw) as unknown);
  } catch (error) {
    if (error instanceof ParlorRuleError) throw error;
    throw new ParlorRuleError("The house could not read that.");
  }
}

async function guestResponse(token: string): Promise<Response> {
  const state = await getStore().read();
  return json(toGuestView(state, token));
}

async function mutateGuest(token: string, update: (state: Awaited<ReturnType<ReturnType<typeof getStore>["read"]>>) => Awaited<ReturnType<ReturnType<typeof getStore>["read"]>>): Promise<Response> {
  const state = await getStore().write(update);
  return json(toGuestView(state, token));
}

export async function handleParlorRequest(request: Request): Promise<Response> {
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
      // Same shape either way, aside from the token a real guest needs to enter.
      return json(guest ? { found: true, token: guest.token } : { found: false });
    }

    if (pathname === "/api/parlor/invitation" && method === "GET") {
      return guestResponse(tokenOf(url.searchParams.get("g")));
    }

    if (pathname === "/api/parlor/invitation" && method === "POST") {
      const body = await readJson(request);
      const token = tokenOf(body.token);
      const type = text(body.type);
      const now = new Date().toISOString();
      if (type === "rsvp") {
        if (body.rsvp !== "yes" && body.rsvp !== "no") {
          throw new ParlorRuleError("Choose whether you will attend.");
        }
        return mutateGuest(token, (state) => setRsvp(state, token, body.rsvp as "yes" | "no"));
      }
      if (type === "ask") {
        if (body.response !== "accept" && body.response !== "decline") {
          throw new ParlorRuleError("Accept or decline the request.");
        }
        return mutateGuest(token, (state) =>
          setAskResponse(state, token, text(body.askId), body.response as "accept" | "decline", text(body.note)),
        );
      }
      if (type === "plus-one") {
        if (body.plusOne == null) {
          return mutateGuest(token, (state) => setPlusOne(state, token, null));
        }
        const plus = record(body.plusOne);
        return mutateGuest(token, (state) =>
          setPlusOne(state, token, { name: text(plus.name), category: category(plus.category) }),
        );
      }
      if (type === "referral") {
        return mutateGuest(token, (state) =>
          addReferral(
            state,
            token,
            {
              name: text(body.name),
              contact: text(body.contact),
              why: text(body.why),
              bountyId: text(body.bountyId) || null,
            },
            newId("ref"),
            now,
          ),
        );
      }
      if (type === "reserve") {
        return mutateGuest(token, (state) => reserveSeat(state, token, text(body.slotId), newId("rsv")));
      }
      if (type === "release") {
        return mutateGuest(token, (state) => releaseSeat(state, token, text(body.slotId)));
      }
      if (type === "propose") {
        return mutateGuest(token, (state) =>
          proposeSlot(
            state,
            token,
            text(body.slotId),
            { title: text(body.title), note: text(body.note) },
            newId("prp"),
            now,
          ),
        );
      }
      throw new ParlorRuleError("The house could not read that.");
    }

    if (pathname === "/api/parlor/admin/login" && method === "POST") {
      if (!password()) {
        return json(
          { error: "The desk has no password yet. Set PARLOR_ADMIN_PASSWORD." },
          503,
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
          return updateEvent(current, body.event as ParlorEvent);
        }
        if (type === "capacity") {
          return updateCapacity(current, {
            gentleman: Number(body.gentleman),
            lady: Number(body.lady),
          });
        }
        if (type === "guest-upsert") {
          return upsertGuest(
            current,
            {
              id: text(body.id) || undefined,
              name: text(body.name),
              email: text(body.email),
              category: category(body.category),
            },
            { id: newId("guest"), token: randomBytes(18).toString("base64url") },
          );
        }
        if (type === "guest-remove") return removeGuest(current, text(body.guestId));
        if (type === "ask-add") {
          return addAsk(current, text(body.guestId), {
            id: newId("ask"),
            title: text(body.title),
            message: text(body.message),
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
            active: Boolean(body.active),
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
            seatLimit: body.seatLimit == null || body.seatLimit === "" ? null : Number(body.seatLimit),
          });
        }
        if (type === "slot-create") {
          return createSlot(current, {
            id: newId("slot"),
            roomId: text(body.roomId),
            startsAt: text(body.startsAt),
            endsAt: text(body.endsAt),
            seatLimit: body.seatLimit == null || body.seatLimit === "" ? null : Number(body.seatLimit),
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
