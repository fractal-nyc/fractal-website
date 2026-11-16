# Parlor invitations

Unlisted pages for one evening at Fractal Campus. They are not in the navbar.

- `/parlor` — the gate. A guest types the email on their invitation.
- `/parlor?g=<token>` — that guest's card. The token is unguessable. It is not the email.
- `/parlor/admin` — the host's desk. Password is `PARLOR_ADMIN_PASSWORD`.

The card itself stays short: the date, a note, the phone custom, the suggested donation, the RSVP, a plus-one, and any asks. Arrival, rooms, games, and the draft schedule sit behind **The Evening**. Capacity, categories, and who is staffing what stay on the desk.

## Data model

One ledger document (`schemaVersion: 1`):

| Piece | What it holds |
|---|---|
| `event` | Name, working title, tentative date, place, the short card copy, and the longer evening copy. All of it is editable on the desk. |
| `capacity` | How many gentlemen and how many ladies may be in the room, including accepted plus-ones. Invited guests can still RSVP yes when a category is full. Guests never see the numbers. |
| `guests` | Name, email, category (`gentleman` or `lady`), unguessable `token`, RSVP, optional plus-one, and zero or more asks. |
| `asks` | Per guest. Title, message, accept / decline, optional note. There is no shared assignment object — copy the house-staff ask from the desk when you want it on another card. |
| `bounties` | Roles the host is hoping to meet (a jester, someone boisterous, someone courageous). Guests can attach a nomination to one. |
| `referrals` | "Who should we invite next time?" Name, contact, why, optional bounty. |
| `schedule` | Rooms × hours. A blank title is an open hour guests may propose into. A title with a seat limit can be reserved. A title with no seat limit is drop-in. Proposals wait on the desk; approving one fills the title. |

A plus-one that does not fit is kept as `waitlist` and the guest sees a plain sentence, for example: "There isn't room for another gentleman this evening. Please invite a lady — and bring your gentleman next time." Saying no to the evening releases that plus-one's seat and any reserved chair. The request is not promoted automatically if a seat opens later.

## Storage

The site had no party database. Sanity is only the Fractal University catalog. The ledger is one JSON document. The code picks a store in this order:

1. `PARLOR_STORE=file` — always the JSON file.
2. `DATABASE_URL` or `POSTGRES_URL` — Neon Postgres, one `parlor_state` row (`id`, `version`, `doc jsonb`) with an optimistic version check. Neon is already installed on the Fractal NYC team, but this checkout could not finish `vercel integration add` (the CLI had no credentials). Connect a Neon database when you want SQL; it takes over from Blob automatically.
3. `BLOB_READ_WRITE_TOKEN` — a private Vercel Blob named `parlor-ledger`, already created and linked to the `fractal-website` project (preview, development, and production). Writes use the blob etag so two RSVPs don't clobber each other.
4. Otherwise `.data/parlor.json` locally, or `/tmp` on Vercel, which does not last. The desk says so.

| Environment | What it uses today |
|---|---|
| `pnpm dev` | `.data/parlor.json` (gitignored). Delete it and restart to reseed. |
| Vercel Preview | The private Blob. `PARLOR_ADMIN_PASSWORD` is already set for Preview and Development. |
| Production (`fractalnyc.com`) | The Blob token is already on the project, so responses will persist after this merges. The desk password is **not** set on Production yet — set `PARLOR_ADMIN_PASSWORD` there before you use `/parlor/admin` on the live site. |

Seed data is written only when the ledger is missing, so later edits in `seed.ts` do not overwrite responses. Change the live copy on the desk.

The Vercel functions load `api/parlor/handler.mjs`, a committed bundle of `src/parlor`. After changing that server code, regenerate it locally (esbuild's binary is not available in the Vercel install):

```sh
node_modules/.bin/esbuild src/parlor/node-adapter.ts --bundle --platform=node --format=esm --target=node22 --outfile=api/parlor/handler.mjs --external:@vercel/blob --external:@neondatabase/serverless
```

### Environment variables

| Name | Where | Purpose |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Already set by the `parlor-ledger` Blob store | Private ledger. Do not copy it into git. |
| `DATABASE_URL` or `POSTGRES_URL` | Optional | Neon. Preferred over Blob when present. |
| `PARLOR_ADMIN_PASSWORD` | Preview and Development are set. Add Production yourself. | Desk password. Never commit it. |
| `PARLOR_STORE` | Optional | `file` ignores Blob and Neon. |
| `PARLOR_DATA_FILE` | Optional | Override the local JSON path. |

```sh
# When you want the live desk, from a linked checkout:
npx vercel env add PARLOR_ADMIN_PASSWORD production

# Optional, if you would rather use Postgres than Blob:
npx vercel integration add neon --name parlor-rsvp -m region=iad1 -m auth=false -e preview -e production
```

## Example guests

These exist only in a fresh ledger. Emails are for the gate. Tokens are the personalized links.

| Guest | Email | Ask |
|---|---|---|
| Daniel | daniel@example.com | Head Butler |
| Janita | janita@example.com | The AI-alien game |
| Jay | jay@example.com | A Catan table |
| Jasmine | jasmine@example.com | House staff |

Remove them from the desk before real invitations go out. Caps start at 8 and 8 and are placeholders.

## Schedule

Guests can read the draft, reserve a seat at a scheduled table, and propose a game for an open hour. The host approves or declines proposals on the desk. That is enough to react to. A fuller room-by-room grid (drag between rooms, public seat names, automatic promotion off the waitlist) can wait until the evening's shape settles.
