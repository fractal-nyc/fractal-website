import type { AdminPayload, GuestView } from "@/parlor/types";

async function read(response: Response): Promise<unknown> {
  const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
  if (!response.ok) {
    const message = data && typeof data.error === "string" ? data.error : "The house could not save that.";
    throw new Error(message);
  }
  return data;
}

async function post(url: string, body: unknown): Promise<unknown> {
  return read(
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function lookupInvitation(
  email: string,
): Promise<{ found: true; token: string } | { found: false }> {
  return (await post("/api/parlor/lookup", { email })) as { found: true; token: string } | { found: false };
}

export async function loadInvitation(token: string): Promise<GuestView> {
  return (await read(
    await fetch(`/api/parlor/invitation?g=${encodeURIComponent(token)}`, {
      headers: { accept: "application/json" },
    }),
  )) as GuestView;
}

export async function postInvitation(
  token: string,
  body: Record<string, unknown>,
): Promise<GuestView> {
  return (await post("/api/parlor/invitation", { token, ...body })) as GuestView;
}

export async function loginDesk(password: string): Promise<void> {
  await post("/api/parlor/admin/login", { password });
}

export async function logoutDesk(): Promise<void> {
  await post("/api/parlor/admin/logout", {});
}

export async function loadDesk(): Promise<AdminPayload> {
  return (await read(
    await fetch("/api/parlor/admin", { headers: { accept: "application/json" } }),
  )) as AdminPayload;
}

export async function saveDesk(body: Record<string, unknown>): Promise<AdminPayload> {
  return (await post("/api/parlor/admin", body)) as AdminPayload;
}
