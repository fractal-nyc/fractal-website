# FRAC-28: prefers-reduced-motion coverage

## Plan
Extract the existing usePrefersReducedMotion hook from OctahedronHero.tsx:32-45 to a shared module, then consume across all motion sites.

1. Branch from master: `git checkout master && git pull && git checkout -b frac-28-reduced-motion`
2. Create `src/hooks/usePrefersReducedMotion.ts`:
   ```ts
   import { useState, useEffect } from "react";

   export function usePrefersReducedMotion(): boolean {
     const [reduced, setReduced] = useState(() => {
       if (typeof window === "undefined" || !window.matchMedia) return false;
       return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     });
     useEffect(() => {
       if (typeof window === "undefined" || !window.matchMedia) return;
       const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
       const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
       mq.addEventListener?.("change", handler);
       return () => mq.removeEventListener?.("change", handler);
     }, []);
     return reduced;
   }
   ```
3. Replace OctahedronHero's local `usePrefersReducedMotion` (lines 32-45) with `import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"`.
4. **Apply guards** in OctahedronHero:
   - Auto-rotation (`:796-800`): if reduced, skip the rotation delta
   - Edge-text scroll (`:249-253`): if reduced, skip the offset update
   - Center scale-breathing (`:561-567`): if reduced, lock at neutral scale
   - Node scale-pulse (`:656-663`): already gated for glow; extend to scale
5. **FadeIn** (`src/components/ui/FadeIn.tsx`): consume hook. If reduced, render with `initial="visible"` (skip animation entirely — show final state).
6. **Navbar** (`src/components/layout/Navbar.tsx`): scroll/overlay motion (`:128,345` area). If reduced, render the final state directly without transition.
7. **SierpinskiCarpet** (`src/components/sections/SierpinskiCarpet.tsx:230-264`): if reduced, render once and skip the RAF loop.
8. **index.css**: add to `.animate-blink` rule a guard via media query:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .animate-blink { animation: none; opacity: 1; }
   }
   ```
9. Verify: build passes, tests match baseline. Manual smoke via macOS Reduce Motion would confirm but isn't a blocker.

## Acceptance
- Shared hook at src/hooks/usePrefersReducedMotion.ts
- OctahedronHero imports from shared (local copy removed)
- FadeIn skips animation when reduced-motion is true
- Octahedron rotation, edge text, breathing, node pulse halt under reduced-motion
- Navbar scroll motion respects pref
- SierpinskiCarpet animation halts
- .animate-blink has @media guard
- Build passes
