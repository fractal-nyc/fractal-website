# FRAC-52: Button overhaul: frost effect + house-accent decorations + page-matched text color

Major sitewide button restyle, three parts:

(1) FROST EFFECT — apply a frosted-glass effect to buttons and navbar buttons. Reference implementation lives in the Renoverse AI repository at ~/Dev/renoverse-ai-website (and possibly ~/Dev/renoverse-site / ~/Dev/renoverse-prototype). Look at their button component definitions and navbar component definitions — port the backdrop-blur + translucent background + subtle border treatment into Fractal's Button primitives. Should work over any house background.

(2) HOUSE-ACCENT DECORATIVE BORDER + MANDELBROTS — the decorative border around buttons and the corner Mandelbrot PNGs should take the house's highlight/accent color (the non-background color on each house page — same color as the Jacquard letter and eyebrow at the top of each page). This makes the buttons pop against the page background. Each house already has a per-house accent palette (see FRAC-37); reuse those tokens. Buttons in shared/sitewide contexts (footer, home) need a sensible default — probably the cream/foreground default.

(3) DEFAULT TEXT COLOR MATCHES PAGE — for now, button text should default to the same color as the body text on that page (whichever of foreground/background the page uses). I.e., if a page is on a dark background with cream text, button text is cream. Don't introduce a separate button-text token yet — just inherit the page's text color.

Acceptance: (a) buttons sitewide have the frost effect; (b) decorative borders + corner Mandelbrots on each house page take that house's accent color; (c) button text matches body text color on each page; (d) navbar buttons get the frost effect too; (e) mobile 375px still legible; (f) verify on Story, NLA, Political Club, Visit, Events, Lab, Campus, Home, Protocol.
