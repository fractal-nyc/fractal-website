# FRAC-200 — Prune unused shadcn/Replit scaffold

## Problem

`src/components/ui/` was scaffolded from shadcn/ui (new-york style, `baseColor: neutral`)
during the project's Replit phase. The site then grew a fully custom editorial design and
never used the generic primitives. Result: large amounts of dead code, orphaned npm
dependencies, and confusing neutral design tokens that only exist to feed components the
site never renders.

Verified facts (grep, this session):
- 59 modules in `src/components/ui/`; app imports only 8.
- Of those 8, **4 are custom Fractal components** that merely live in the folder
  (`AvatarBadge`, `FadeIn`, `FractalPattern`, `MandelbrotCorners`) — keep.
- The only genuinely-used shadcn-derived module is **`button.tsx`** (a clean FRAC-27
  rewrite: `cva` + Radix `Slot` shell, fully custom editorial styling). Keep.
- `toast` / `toaster` / `tooltip` + `hooks/use-toast.ts` are mounted in `App.tsx` but
  **inert**: zero `toast()`/`useToast()` call sites, zero `<TooltipTrigger>`/`<TooltipContent>`.
- `@tanstack/react-query` `<QueryClientProvider>` is mounted in `App.tsx` but **unused**:
  zero `useQuery`/`useMutation`.

## Scope

### Delete (dead `ui/` modules — 51)
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button-group,
calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog,
drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp,
item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
spinner, switch, table, tabs, textarea, toggle, toggle-group

### Delete (inert scaffold)
- `src/components/ui/toast.tsx`, `toaster.tsx`, `tooltip.tsx`
- `src/hooks/use-toast.ts`

### Keep (`src/components/ui/`)
`button.tsx`, `AvatarBadge.tsx`, `FadeIn.tsx`, `FractalPattern.tsx`, `MandelbrotCorners.tsx`
(+ any internal deps these pull in — verify closure holds at exactly these).

### Edit `src/App.tsx`
Remove the three dead root providers and their imports:
`QueryClientProvider`/`QueryClient` (`@tanstack/react-query`), `TooltipProvider`
(`ui/tooltip`), `Toaster` (`ui/toaster`). Collapse to the bare `WouterRouter` +
`ScrollToTop` + `Router` tree.

### Edit tests
`src/__tests__/pages.test.tsx` and `src/__tests__/scroll-to-top.test.tsx` reference
`QueryClientProvider` / `TooltipProvider` / `Toaster`. Update their render harnesses to
drop these wrappers so they match the new `App` shape.

### Prune npm deps (empirical)
After deleting files, for each entry in `package.json` `dependencies`, grep surviving
`src/` for an import. Remove any dependency with **zero** remaining imports. Expected
orphans (confirm each): `@tanstack/react-query`, `recharts`, `embla-carousel-react`,
`vaul`, `cmdk`, `react-day-picker`, `input-otp`, `react-resizable-panels`, `sonner`,
`next-themes`, `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns`, and the
unused `@radix-ui/*` (everything except `@radix-ui/react-slot`, which `button.tsx`
needs). Do **not** assume — the grep decides. Keep anything still referenced
(`@react-three/*`, `three`, `framer-motion`, `lucide-react`, `react-icons`, `wouter`,
`clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`, etc. —
verify).

## Approach / order
1. Delete the 54 files.
2. Edit `App.tsx`; edit the 2 tests.
3. Grep-driven dep prune; `npm install` to rewrite the lockfile.
4. Verify (acceptance criteria below). Fix any fallout (e.g. a kept file that imported a
   deleted one — closure says none, but confirm).
5. Commit; move to review; cold review sub-agent; PR.

## Acceptance criteria
- `npm run build` succeeds.
- TypeScript typecheck passes (no references to deleted modules).
- Full test suite is green (same pass/fail baseline as before — FRAC-199 documents
  pre-existing failures; do not regress beyond that).
- `git grep` finds no import of any deleted module anywhere in `src/`.
- `App.tsx` no longer imports react-query / tooltip / toaster.
- No removed dependency is still imported in `src/`; no kept dependency was dropped.
- No change to any rendered output (these were all inert) — the site looks identical.

## Out of scope
- DESIGN.md token-section cleanup (FRAC-198) — downstream; this task makes it honest.
- Any redesign of `button` or the kept components.

## Notes
- Branch `frac-200-prune-shadcn-scaffold` is based on `frac-198-repo-docs` (not master)
  to avoid a Lattice id-counter collision. Merge after #231 or rebase onto master.
