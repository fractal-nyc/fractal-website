# FRAC-71: Lab page text fixes

## Scope
Four text/styling fixes on the Lab page:

1. **Add "the lab" subtitle** under the big "L" SectorHeader — add a line below the existing SectorHeader in LabPage.tsx
2. **"Research and Writing" normal case + JetBrains Mono** — remove `uppercase` class, add `font-mono` (JetBrains Mono) on the h2
3. **"Fact Files" CamelCase** — change "The fact files" to "The Fact Files"
4. **Search placeholder ALL CAPS** — change placeholder text to uppercase in ArchiveSearch.tsx

## Files
- `src/pages/LabPage.tsx` — changes 1, 2, 3
- `src/components/lab/ArchiveSearch.tsx` — change 4

## Acceptance criteria
- "the lab" subtitle visible under big L heading
- "Research + Writing" rendered in normal case with JetBrains Mono font
- "Fact Files" has capital F on both words
- Search placeholder text is all caps
