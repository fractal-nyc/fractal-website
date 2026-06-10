# FRAC-68 — bundled with FRAC-60

Bundled with FRAC-60 — single PR `frac-60-68-navbar`. See full plan at `.lattice/plans/task_01KTPZYVHA5GGE833S17WB49TP.md`. The wordmark fix is **Section 1** of that plan.

Summary of the FRAC-68 portion: three variants of the navbar in `src/components/layout/Navbar.tsx` size "Fractal" with a fluid `clamp()` but "Collective" with a fixed `px` value, breaking the desktop ~1.71 height ratio at narrow viewports. Fix is to replace the fixed-px "Collective" sizes with matched `clamp()` values scaled by 1/1.71 off the corresponding "Fractal" clamp, plus a snap-to-canonical-ratio tweak on the all-fixed inner-mobile variant. See Section 1 of the bundled plan for exact line numbers and replacement values.
