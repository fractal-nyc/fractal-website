# FRAC-55: Campus page: update membership buttons — Full-time $300/mo + Part-time $150/mo

Replace the current membership CTAs on the Campus page with two distinct membership tier buttons/cards:

---
We offer two kinds of membership:

**Full-time** — $300/mo (sign up here)
Unlimited 24/7 access

**Part-time** — $150/mo (sign up here)
Choose your hours (up to 50 hr per week)
---

Open question (needs user input before implementation): the two 'sign up here' URLs. User did not provide them. Options: (a) two separate Stripe/Memberful/etc. checkout URLs (one per tier), (b) a single sign-up flow that lets the user choose the tier on the destination page, (c) email/contact form. Planner: do not start implementation until the URLs (or chosen flow) are confirmed.

Relationship to FRAC-52 button overhaul: these new buttons should adopt the FRAC-52 frost effect + house-accent treatment once that lands — coordinate sequencing so we don't double-rework. If FRAC-52 is far off, ship these with the current button style and refactor later.

Acceptance: (a) two membership tiers rendered on Campus with the price, terms, and CTA shown above; (b) sign-up CTAs open the correct destination(s) once URLs are confirmed; (c) styling consistent with other Campus CTAs and FRAC-48 centering rule; (d) mobile-first: tappable + legible at 375px; (e) any prior membership CTA on the page removed or absorbed.
