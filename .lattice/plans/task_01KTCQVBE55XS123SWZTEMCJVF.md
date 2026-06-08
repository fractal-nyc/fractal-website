# FRAC-30: Delete .dark block from index.css

## Plan
Per locked decision: dark mode not planned. Delete the entire `.dark { ... }` block at `src/index.css:75-103` (lines 75-103 inclusive, including the surrounding blank lines as appropriate).

Verify build passes, tests pass, no live `.dark` toggle anywhere broke (there isn't one — that's the point).

## Acceptance
- `.dark` block removed from src/index.css
- Build passes
- No test regressions
- No visual change to live (light-mode-only) site
