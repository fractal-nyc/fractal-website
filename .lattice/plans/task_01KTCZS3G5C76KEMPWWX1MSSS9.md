# FRAC-37: PC label + dark photos

## Part A — Label
In OctahedronHero.tsx tooltip render for comingSoon nodes:
- Remove the "Political Club" first-line text
- Show only "Coming Soon" — same styling as previous subline OR upgrade to the primary label slot
- Choose whichever reads better; the visual goal is a single short caption

## Part B — Dark photos investigation
1. Confirm tex.colorSpace = SRGBColorSpace is still on master (FRAC-35 commit d13c754)
2. Check gl.outputColorSpace in FractalCityScene Canvas onCreated — is it set explicitly?
3. Look at material setup — any opacity, alphaTest, blending shifts?
4. If FRAC-35 is correct and renderer is correct: report back. User may want to revert, or apply a brightness multiplier.
5. If misconfigured: fix.

Prefer investigation report over silent revert.

## Acceptance
- Label fix shipped (only "Coming Soon")
- Photo darkness either fixed with rationale OR diagnosed with options surfaced

## Reset 2026-06-06 by agent:claude-opus-4-7
