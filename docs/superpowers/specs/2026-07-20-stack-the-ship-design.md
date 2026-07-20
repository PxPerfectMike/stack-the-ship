# Stack the Ship — Design Spec

*2026-07-20 · working title (alternates: Overboard!, Heave Ho, Last Crate Standing)*

An async-multiplayer physics stacking duel built on the Game Production
Playbook (guides 01–07). Two players alternate catapulting absurd cargo onto
a docked ship; the first toss that puts cargo in the sea loses. Flat-SVG
diorama presentation, Dumb Ways to Die-grade minimalism and personality.
Art, style, and animation timing are explicitly the top priority of this
project — the game is simple; the *feel* is the product.

---

## 1. Art direction (top priority)

**Reference point: Dumb Ways to Die.** Flat vector shapes, rounded geometry,
no outlines (or single-weight minimal ones), dot eyes, tiny limbs, huge
readable silhouettes, cheerful palette against deadpan disaster. Comedy comes
from timing and reaction, never from detail density.

Rules:

- **Silhouette first.** Every cargo item must be identifiable at 48px from
  shape alone. If it needs interior detail to read, redesign the shape.
- **Restricted palette per scene state.** One palette per time-of-day
  (day/dusk/night), few hues, flat fills, at most one gradient (sky).
  Palettes live in design tokens; canvas/JS mirrors per guide 01.
- **Faces on things that shouldn't have them, sparingly.** The pig has a
  face. The piano does not. One or two "alive" items per manifest keeps the
  gag potent.
- **Motion is characterization.** Squash/stretch via `transform: scale` only,
  anticipation before the crane releases, overshoot on landings, a beat of
  stillness before a topple begins. All easing/durations come from one
  named-constants module (`timing.ts`) — no inline magic numbers, so the
  whole game's feel can be tuned in one file.
- **Quality gate:** every new visual goes through the guide-04 screenshot
  loop AND human visual approval before merge. No exceptions; the human
  gates all visuals (playbook meta-rule 2). Motion sync is verified
  numerically (guide 04), not by eye alone.

## 2. Core loop

Portrait harbor diorama. A cargo ship docks using the big-subject
choreography (guide 03): cropped larger than frame, ease-out arrival, dwell,
ease-in departure.

Match flow:

1. Players alternate turns. Each turn deals one cargo item —
   deterministically seeded from `matchId + turnNumber`, so both players
   face the same fate order and replays are exact.
2. The crane swings in dangling the item. Player aims with one thumb:
   drag back → faint arc hint → release to toss.
3. Physics settles (velocity-epsilon rest detection + hard timeout so a
   rocking item can never hang the game).
4. **Sudden death:** if any body rests below the waterline after settle,
   the tossing player loses immediately. Ship horns, departs with the
   surviving stack, match over. Rematch = new ship docks.

The absurd manifest (initial set, ~12 items): crates, barrels, tires, a
grand piano, a moai head, a bathtub, a wardrobe, an anchor (dense), a
beach ball (light/bouncy), a long plank, an anxious pig (the mascot), a
kitchen sink. Mostly rigid, weird-shaped; no soft bodies in v1.

## 3. The bird system (first-class feature)

Birds are the personality engine: reactive scenery agents that make the
world feel alive and provide the comedy chorus.

- Gulls land on the stack, the ship rails, the crane arm, mooring posts.
  Perch choice weights toward the newest/highest stack item.
- They **react to game events** via a lightweight event bus fed by pure
  game-state transitions (`toss-launched`, `impact`, `settle`, `topple`,
  `ship-departing`): scatter on launch, startle-hop on impact, all heads
  swivel to track a flying piano, mass panic + fly-off on a topple, one
  bird always returns first afterward (the brave one).
- Reaction latency is a tuned constant (startle ≈ 80–120 ms after impact) —
  timing sells the illusion of attention.
- Strictly scenery: **no physics bodies, `pointer-events: none`**, exclusive
  vertical zones respected (guide 03 traps). They *appear* to stand on
  cargo by reading the settled rest state, never by collision.
- Rare events worth waiting for: a whale surfacing, an aurora night, a
  bird stealing a small item off the stack cosmetically.
- `prefers-reduced-motion`: static tableau — birds perched, no loops.

## 4. Physics

- **Matter.js**, 2D rigid bodies, polygon/compound shapes for the absurd
  items. Physics sim isolated in its own module; it never leaks into
  `src/lib/game/` pure logic.
- Pure, unit-tested functions (guide 02 pattern) for: deal order, turn
  validity, loss detection (`anyBodyBelowWaterline(restState)`), bot
  targeting, and all monetization/flow gates.
- Settle detection: all bodies under velocity epsilon for N frames, hard
  timeout fallback.

## 5. Multiplayer (PartyKit, async-first)

- **One PartyKit room per match**; room ID = invite code. Room storage:
  player IDs/names, turn log, current rest-state snapshot, whose turn,
  deadlines. Server timestamps only.
- **Identity:** anonymous UUID minted on first launch + chosen display
  name, kept in the versioned save. No accounts.
- **Invite flow:** "Challenge a friend" → create room → native share sheet
  with link → friend deep-links in (web landing page prompts install).
- **Turn payload:** input + compressed trajectory recording (~20 Hz
  keyframes of all bodies) + final rest state. Opponent **replays the
  recording** — no cross-device physics determinism required, ever. Sim
  runs once on the tosser's phone; the replay is the opponent's cinematic.
- **Turn expiry:** nudge state at 24 h, auto-forfeit at 72 h.
- **Extensibility seam:** future random matchmaking = one additional
  "lobby" room that pairs queued players and mints match rooms. Additive;
  match flow untouched.
- All network calls use the fail-safe wrapper pattern (guide 02): offline
  still allows solo play; match list renders cached state; sends retry on
  next app open. Multiplayer infrastructure must never break the game.
- **Conscious v1 gap:** no push notifications — turn badges appear on app
  open. FCM push is the first fast-follow, kept off the critical path.

## 6. Solo mode: the Dockmaster

Same duel rules vs a bot, three difficulty tiers (aim noise + how
adversarially it targets stack weak points). Seeded-deterministic — which
makes it the demo-video cast (guide 07) for free and the tutorial: the
first-ever match is vs the Dockmaster with a gentle deal order. Solo win
streak is the score-chase stat.

## 7. Scene & personality (playbook checklist applied)

- Per-session time-of-day + weather rolled once, shared across scenes
  (guide 02 shared-session ambience).
- Slow ambient loops: harbor lights, a distant ferry, water shimmer.
- Rare events: whale, aurora (see birds §3).
- Deadpan text details: ship names (*MV Barely Adequate*, *SS Probably
  Fine*), a manifest clipboard listing the cargo, the Dockmaster's
  one-line remarks.
- Dev URL params force every state from day one (`?tod=night&wx=rain`,
  `&phase=docked`, `&fast=1`) per guide 04.

## 8. Monetization

Standard playbook loadout, adapted for PvP fairness:

- Interstitial on *leaving* a finished match; pure frequency gate
  (every 2nd match end, ≥90 s gap, never after a first-ever win).
- **Rewarded ads solo-only:** once-per-match "steady hands" re-toss vs the
  Dockmaster. No paid advantage in PvP, ever.
- $0.99 `remove_ads` non-consumable; keeps solo rewarded option.
- All gates pure + unit-tested; all SDK calls wrapped fail-silent;
  console bureaucracy sequenced weeks early (guide 05).

## 9. Testing & QA

- Unit tests for all pure logic with seeded-RNG invariants (deal order,
  loss detection, bot targeting, gates, PartyKit room logic — plain TS,
  testable server-side: turn ordering, expiry, forfeit).
- Browser-driving via Playwright module-import trick (guide 04) for the
  toss → settle → send → replay loop.
- **Replay-fidelity test:** record a toss, replay the recording, assert
  final positions equal the recorded rest state.
- Dev route rendering the full cargo catalog in a grid; tap-safety and
  overlap audits; speed-sync measured numerically.
- Screenshot loop with human approval on every visual change.

## 10. Out of scope for v1

Random matchmaking, push notifications, live real-time spectating,
soft-body items, themed cargo sets, leaderboards, iOS.
