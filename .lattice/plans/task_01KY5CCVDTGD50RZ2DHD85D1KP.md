# FRAC-18: Fix 320px overflow on Protocol, Library, and People routes

FRAC-17's real-browser route sweep reproduced horizontal overflow at simulated touch 320x568 on /the-protocol (+2px), /library (+21px), and /people (+47px). Home, Co-Living, Campus, Events, Political Club, and 404 pass. Diagnose route-specific unbreakable/entrance content and repair without broad clipping; validate at 320x568 and 360x640 in the shared Playwright suite.
