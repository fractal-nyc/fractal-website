# Campus Accelerator historical archive

`/cap` is an unlisted, first-party snapshot of <https://fractalcampus.com>, captured on **2026-10-23**. It uses the shared Navbar, with no CAP menu entry. The source domain is unchanged.

## Editing

- Page and archive notice: `src/pages/CapPage.tsx`.
- Reviewed snapshot, including all initially collapsed content: `src/data/cap-archive.html`.
- Scoped historical styling: `src/pages/CapPage.css`.
- Local photographs and publication logos: `public/images/cap/`.
- Route: `src/App.tsx`; content regression checks: `src/__tests__/cap.test.tsx`.

The operator requested the original appearance, so the archive intentionally retains the source's white background, dark `#37352f` text, Inter headings (40/30/24/20px), original pastel HSL highlights, 46px column gap, and approximately 808px desktop reading width. These are an explicit, page-scoped archival exception to the site's ordinary design tokens. No shared tokens, navigation styling, design specification or conformance baseline were changed. Mobile columns stack at 680px; media is constrained to the reading column.

## Snapshot transformation

Only the source main content was copied. Super/Next runtime, tracking scripts, styles, loaders, executable attributes/URLs, and floating application UI were excluded. All 15 disclosure groups (including nested FAQ) use native `details`/`summary`; duplicate source IDs were normalized. The original historical dates, tuition, biographies, testimonials, curriculum, links and captions are retained. The Fillout interest form and signup link are replaced with inactive notices; the reference to the floating Apply button now says applications are closed.

The 24 real source images are downloaded and decoded, converted to WebP at a maximum 1600px width with aspect ratios preserved. Seven data-URL placeholders were already explicitly hidden by the source's own CSS (`.notion-image img[src*="data:image"] { display: none; }`); their empty image blocks were omitted, with surrounding text preserved. The source's empty Twitter widget has a readable link to its original post. YouTube and the separate Neocities photo carousel retain titled lazy embeds plus visible fallback links.

Source-relative links now explicitly resolve at fractalcampus.com; the in-page curriculum link remains local. Historical outbound links may change independently. No application forms are submitted and no source-site runtime is required to read the snapshot. The two media embeds still depend on their third-party hosts.

To refresh, download a new source snapshot, extract the main content, repeat these transformations and compare full text including collapsed sections; do not paste executable Super HTML. Check all local media and the 15 disclosure groups, then run `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm conformance`. Visually verify 375px mobile and desktop, shared menu, keyboard disclosures, and horizontal overflow in the app's built-in browser.

Source HTML SHA-256: `340cbc1f18cca9596de328885369339d7d367f7f85d6e8e48bf8d9a0b12dad89`. Snapshot contains 49 headings, 15 disclosures, and 24 local images.

| Asset | Source |
|---|---|
| cap-01.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/1d19ed5f-6921-40f4-873c-6ad428eeb3ae/image/w=1920,quality=90,fit=scale-down |
| cap-02.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/7fbf297d-9e24-4ff4-ab84-ae7f82886964/image/w=1920,quality=90,fit=scale-down |
| cap-03.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/444c0d02-b0d5-421d-8133-bc26c953cbba/Screenshot_2025-04-21_at_7.14.22_PM/w=1920,quality=90,fit=scale-down |
| cap-04.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/5c775d42-f12a-4203-95e7-e822032b16c1/042d969c-aab3-4b96-8d20-8c4767d1cc70/w=1920,quality=90,fit=scale-down |
| cap-05.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/e360eb18-743b-4d19-b469-854c63653a89/image/w=1920,quality=90,fit=scale-down |
| cap-06.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/5607bdb6-79c2-4223-a786-2ba78ab66782/851a029c-e4cf-40c6-8a90-687b216a4c4a/w=1920,quality=90,fit=scale-down |
| cap-07.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/d456eab9-0787-4668-91f2-df61ec53330e/01F85D4A-A863-4566-88D1-7B0AA6EF59E5/w=1920,quality=90,fit=scale-down |
| cap-08.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/0737f8b1-d91d-4479-ab9a-8e48108660e3/1a515611-f6be-43cc-9f60-cb4f1a8fb507/w=1920,quality=90,fit=scale-down |
| cap-09.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/54b39ae1-118a-4da9-a951-8ae102402f56/image/w=1920,quality=90,fit=scale-down |
| cap-10.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/3001fd33-2978-4ca4-bbdf-947e85942ad1/C41F8881-F894-4F7A-89DA-6C2F5B3A8CF9_1_201_a/w=1920,quality=90,fit=scale-down |
| cap-11.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/81649bf8-37db-4eaa-b604-f8d362124e30/image/w=1920,quality=90,fit=scale-down |
| cap-12.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/d8928e0b-af08-492f-a48a-c579d62ccd29/cf78aaa8-f611-43cf-b2c0-0e50f8e6463a/w=1920,quality=90,fit=scale-down |
| cap-13.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/09165f3f-e9e9-474e-91e3-fa44bffee561/zoe_square/w=1920,quality=90,fit=scale-down |
| cap-14.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/be2d0313-267b-49a6-81fd-ab85f094fa3f/image/w=1920,quality=90,fit=scale-down |
| cap-15.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/a5b95a01-326b-4ce3-8726-69790f279e66/c70b1ff4-d7b2-45f5-9172-ff6e525151d1/w=1920,quality=90,fit=scale-down |
| cap-16.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/2e505e3c-ac59-49b5-8340-dae9be9a8e1a/ad5d0f62-da19-4f32-be46-b807eca66150/w=1920,quality=90,fit=scale-down |
| cap-17.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/33edad11-c280-4260-a03f-2ee7198d3cb8/image/w=1920,quality=90,fit=scale-down |
| cap-18.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/c894764d-a1ab-4ccf-9293-bcd94c186db3/AB5F9430-C1EB-4973-9AFF-411614CBF11B_1_105_c/w=1920,quality=90,fit=scale-down |
| cap-19.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/b86dde80-cb7b-4e08-9be3-669a3caebab1/E756AA88-CA21-483D-BB47-56A4CD4C65B1/w=1920,quality=90,fit=scale-down |
| cap-20.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/2c0adca8-16a3-4eab-b2c9-9217e51b7f30/image/w=1920,quality=90,fit=scale-down |
| cap-21.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/04470233-1c3a-43cc-9e8c-8357346e7638/28C1D381-04BB-462A-A793-2741CAAA7775/w=1920,quality=90,fit=scale-down |
| cap-22.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/a386e025-b24c-4cc7-8e35-867f29e1624a/9D1A0D35-CB1B-4E0A-9945-197DE51B2B12/w=1920,quality=90,fit=scale-down |
| cap-23.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/4f57e661-dcef-4422-bb8b-7642826f4f1c/image/w=1920,quality=90,fit=scale-down |
| cap-24.webp | https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/a34e49fe-6fa7-4946-80cd-c0fa84c7802d/focus/w=1920,quality=90,fit=scale-down |
