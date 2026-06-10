# FRAC-61: Campus page: copy edits, membership button restructure, bullet list cleanup, photo replacements

Multiple updates to the Campus page:

COPY CHANGES:
1. Hero/section heading: change display text to 'Be Ambitious at Fractal Campus'
2. Replace 'Want a reduced rate?' with: 'First time here? Drop by for free! Contact Crystal (crystal@fractalnyc.com) for a guided tour.'
3. Apply text-body-lead style to: 'The Fractal Campus is a meeting place in the heart of Williamsburg to do your most ambitious work. We offer 4000+ square feet of both shared office space and private offices, two kitchens, a communal lounge, and a 5000+ square foot private roof deck'
4. Above the bullet points add the lead-in: 'All members have access to:'

MEMBERSHIP BUTTONS:
- Remove the Day Pass option entirely
- Move the membership label/text INSIDE each button (not above it), stacked/wrapped within the button
- Button 1 contents (stacked):
    - Full time membership
    - 24/7 access /mo
- Button 2 contents (stacked):
    - Part time membership
    - 50 hr/wk /mo

BULLET LIST:
- Remove the 'hot desk' bullet
- Remove the 'private startup office' bullet
- Keep remaining bullets unchanged

PHOTOS SECTION:
- Replace placeholder images with actual photos
- Remove the 'Felix loves it here' photo
- Source photos: ~/Desktop/fractal-nyc-photos (move into the Dev folder properly — likely public/images/campus or wherever campus assets currently live)
- Wire up the new photos in the campus page component

Files likely affected: src/app/campus/page.tsx (or campus route) and/or components under src/components/campus/. Verify against current structure.

Acceptance: all copy reads as specified; membership section shows only 2 buttons with stacked labels inside; bullet list has lead-in 'All members have access to:' and excludes hot desk + private startup office; placeholder + Felix photos are replaced with real Williamsburg campus photos that live in the repo (not on Desktop).
