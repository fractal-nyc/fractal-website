# FRAC-51: Protocol page: remove Coming Soon, center ASCII art at 60-80% width

## Scope

Single file change to `src/pages/ProtocolPage.tsx`. Remove the "Coming Soon" placeholder section and restructure the Sierpinski carpet container so it is centered on the page at 60-80% width, creating a manifesto-style landing.

## What to Remove

1. **Lines 20-28:** The entire `<section className="py-24 md:py-40">` block containing the FadeIn wrapper, "The Protocol" label, and "Coming soon." paragraph.
2. **Line 3:** The `import { FadeIn }` statement (no longer used).

## What to Change

Replace the current Sierpinski carpet wrapper (lines 12-19):

```tsx
<div className="relative h-[50vh] md:h-[60vh] w-full bg-background">
  <SierpinskiCarpet
    photoUrl={`${import.meta.env.BASE_URL}images/hero-bg.png`}
    autoPlay
    padding={40}
    className="w-full h-full"
  />
</div>
```

With a centered, width-constrained layout:

```tsx
<div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
  <div className="w-[80%] md:w-[70%] lg:w-[60%] aspect-square max-w-[800px]">
    <SierpinskiCarpet
      photoUrl={`${import.meta.env.BASE_URL}images/hero-bg.png`}
      autoPlay
      padding={0}
      className="w-full h-full"
    />
  </div>
</div>
```

## Design Rationale

- **Centering:** Outer div uses `flex items-center justify-center` with `min-h-[calc(100vh-8rem)]` (accounts for navbar pt-32 = 8rem). Carpet sits centered in viewport like a manifesto centerpiece.
- **Width 60-80%:** Mobile-first responsive — `w-[80%]` default (mobile, ~300px on 375px screen), `md:w-[70%]` (tablet), `lg:w-[60%]` (desktop). `max-w-[800px]` caps absolute size on wide screens.
- **Aspect ratio:** `aspect-square` matches the canvas's inherent square shape (81×81 grid).
- **Padding removal:** `padding={0}` on the component since outer container handles spacing. The prop subtracts from available space internally; no longer needed.
- **Manifesto feel:** Generous whitespace + centered art + removal of placeholder text. The streaming Fractal quotes in the carpet cells ("THE GOLDEN AGE IS ALREADY IN THE COMPUTER", etc.) ARE the manifesto content.

## Final Page Structure

```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SierpinskiCarpet } from "@/components/sections/SierpinskiCarpet";

export function ProtocolPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
          <div className="w-[80%] md:w-[70%] lg:w-[60%] aspect-square max-w-[800px]">
            <SierpinskiCarpet
              photoUrl={`${import.meta.env.BASE_URL}images/hero-bg.png`}
              autoPlay
              padding={0}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
```

## Acceptance Criteria

1. "Coming soon." text and "The Protocol" label are removed.
2. `FadeIn` import is removed (no unused imports).
3. Sierpinski carpet is horizontally centered on the page.
4. Carpet width: ~80% on mobile (375px), ~70% on tablet, ~60% on desktop, max 800px.
5. Carpet is vertically centered in the viewport (offset by navbar).
6. Page feels like a contemplative manifesto landing — the art is the content.
7. Mobile-first: 375px baseline looks correct before wider breakpoints.

## Complexity

Low — single file, ~15 lines modified, no new components or dependencies.
