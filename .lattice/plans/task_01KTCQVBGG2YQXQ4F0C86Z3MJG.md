# FRAC-31: display-roman utility

## Plan
1. Add to src/index.css @layer utilities:
   ```css
   .display-roman {
     font-weight: 300;
     text-transform: uppercase;
     font-style: normal;
   }
   ```
2. Find every inline triplet with these three properties together:
   `grep -rn 'fontStyle:\s*"normal"' src/ | head -30`
3. For each hit where the surrounding style object has all three (`fontWeight: 300`, `textTransform: "uppercase"`, `fontStyle: "normal"`) — replace with `className="display-roman"` (preserving any other className tokens).
4. If the style object has additional properties beyond the triplet (e.g., `fontFamily`, `letterSpacing`), keep those inline; only strip the three triplet properties.
5. Verify: zero remaining occurrences of the full triplet; build passes; tests match baseline.

## Acceptance
- .display-roman defined
- ~12 sites converted
- No visual change
