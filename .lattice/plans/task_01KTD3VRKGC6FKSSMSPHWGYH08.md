# Move 'people' to bottom

## Plan
Single edit: swap "people" (currently face 3, upper hemisphere) with "school" (currently face 7, last index / lowest in array).

New FACE_SECTION_MAP:
0: campus
1: events
2: lab
3: school     (was: people)
4: neighborhood
5: story
6: forum
7: people     (was: school)

No other changes. FACE_SECTION_COLORS / FACE_BANNER_IMAGES already keyed by name.
