# Dev QA URL params (guide 04 pattern)

Game route (`/`):
- `?seed=NAME` — deterministic match seed (deals + bot aim)
- `?fast=N` — N-x speed multiplier (physics steps, transitions, bot think); bare `?fast` = 4x, `?fast=1` = normal
- `?difficulty=1|2|3` — Dockmaster tier
- `?gentle=1` — tutorial pool (crate/barrel/tire/plank only)
- `?screen=game` — skip the title screen (any `?phase=` also skips it)

Routes:
- `/catalog` — every cargo item at true scale (content QA)
