# Dev QA URL params (guide 04 pattern)

Game route (`/`):
- `?seed=NAME` — deterministic match seed (deals + bot aim)
- `?fast=1` — 4x physics steps per frame, bot thinks in 175ms
- `?difficulty=1|2|3` — Dockmaster tier
- `?gentle=1` — tutorial pool (crate/barrel/tire/plank only)

Routes:
- `/catalog` — every cargo item at true scale (content QA)
