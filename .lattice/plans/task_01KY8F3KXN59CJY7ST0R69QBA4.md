# FRAC-22: Stabilize parallel Playwright Hero tap readiness

The trusted projected-node tap test can miss R3F pointer delivery when two headless Chromium WebGL contexts run concurrently, despite passing in serialized/settled runs and on the real S24-class Appium native tap. Reproduce with the phone-reduced-motion project at --workers=2 --repeat-each, distinguish event-source readiness from GPU contention, and make the automated interaction lane deterministic without weakening the native contract.
