# Fractal Campus Member Guide

Unlisted coworking-member guide at `https://members.fractalnyc.com` (SPA route `/members`). Readable sections for using the space, plus Stripe for billing and text links to Luma, Discord, and Cuties. `/members/guide` redirects here.

This repo deploys on **Vercel** (`vercel.json`). There is no Netlify config in the tree.

## Local preview

```sh
pnpm dev
```

Open `http://localhost:5173/members`. The page is not in the public navbar.

## Domain (Vercel Dashboard)

Code already redirects `members.fractalnyc.com/` → `/members`. Remaining operator steps:

1. In the Vercel project, add domain `members.fractalnyc.com`.
2. Create the DNS record Vercel shows (typically a CNAME `members` → `cname.vercel-dns.com`).
3. Confirm `https://members.fractalnyc.com` loads the member home and is not linked from the public nav.

## Stripe Customer Portal (Dashboard-only)

The site has **Payment Links** for signup (`buy.stripe.com` on `/campus`) but no Customer Portal login ID in the repo. Manage membership is wired to Stripe's no-code portal URL:

`https://billing.stripe.com/p/login/{LIVE_ID}`

Until `{LIVE_ID}` is pasted in, the CTA uses the fallback `https://billing.stripe.com/p/login/` (correct pattern, incomplete ID).

### Activate the login link

1. Open [Customer portal settings](https://dashboard.stripe.com/settings/billing/portal) (test mode first, then live).
2. Click **Activate link**.
3. Copy the login URL (`https://billing.stripe.com/p/login/…`).
4. Set Vercel env `VITE_STRIPE_CUSTOMER_PORTAL_URL` to that live URL (or put it in `src/data/member-links.ts`). Redeploy so the client bundle picks it up.
5. Optional: `?prefilled_email=` can be appended when emailing a member directly.

### Portal configuration (MVP)

Set the default redirect / return URL to `https://members.fractalnyc.com`.

Enable:

- Cancellation **at end of the current paid period** (not immediate)
- Cancellation reasons
- Payment-method updates
- Invoice viewing / download
- Billing-information updates as appropriate

Leave **disabled**:

- **Subscription / plan switching** — Campus currently has two Payment Links (full-time $300/mo 24/7 and part-time $150/mo 20 hr/wk). Upgrade, downgrade, and proration have not been verified. Do not turn switching on until that is tested.
- Retention coupons, unless Fractal already has a membership-policy coupon

Do not build a custom cancellation UI.

### Branding

In Stripe **Branding** and **Public account details**, set the public business name, icon/logo, and colors so the portal feels like Fractal.

### Test checklist (test mode, then a live test customer)

- Manage membership reaches the portal login (email → Stripe login email → portal)
- Payment method can be updated
- Invoices are visible / downloadable
- Cancellation is offered and applies at period end
- Return / “back to Fractal” lands on `https://members.fractalnyc.com`
- Unrelated Stripe products are not listed
- If switching is ever enabled, explicitly test upgrade, downgrade, and proration first

## Destinations

Canonical URLs live in `src/data/member-links.ts`. Wi-Fi credentials live in `src/data/member-guide.ts`; the rest of the guide copy is on `src/pages/MembersPage.tsx`.
