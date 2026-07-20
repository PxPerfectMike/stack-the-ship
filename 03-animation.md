# 03 — The Diorama Method (Scenes & Animation)

How every animated scene (gate window, scanner belt, security office,
floor machine) was built. Art-style agnostic: these are the mechanics.

## Principles

1. **Layered flat depth.** Depth comes from stacked layers and relative
   scale, never 3D: sky gradient → distant silhouettes/light dots → the big
   subject → glass tint + reflection streaks → frame/mullions → interior →
   foreground UI. Each layer is its own absolutely-positioned element.
2. **Transform/opacity only.** All motion is `transform` / `opacity` (CSS
   transitions, keyframes) — GPU-cheap, battery-safe, no per-frame JS. If a
   scene needs sequencing, JS sets *targets and durations*; CSS does the
   moving.
3. **Occlusion is free.** To make something disappear "into" a machine or
   tunnel, just draw the machine on top (later in DOM). No masking logic.
4. **`prefers-reduced-motion` = a static tableau**, decided at mount: parked
   subject, no loops, no particles. Design each scene's "freeze frame"
   deliberately.
5. **Big subjects read better cropped.** The most-loved visual was a subject
   so large its edges left the frame (nose off one side, tail off the other).
   Crop sells scale; showing the whole thing shrinks it.

## Techniques that carried the project

- **JS-sequenced CSS transitions** for one-off journeys (arrive → dwell →
  depart): set `transition: transform Xms cubic-bezier(…)` + target
  `translateX` per phase from a setTimeout state machine. Ease-out for
  arrivals (fast entry, long glide), ease-in for departures.
- **Negative `animation-delay`** to start a looping crossing mid-scene:
  `animation-delay: -{duration * 0.38}s` puts the subject 38% across at
  mount. Essential when a screen opens onto an in-progress moment.
- **Seamless particle/tread loops**: element at 200% height/width containing
  two stacked copies of the pattern, keyframe translates by exactly 50%.
  Rain = two SVG `<line>` layers (short dashes, round caps, slight slant) at
  different speeds/opacities for parallax; snow = layered radial-gradient
  dots; belt tread = repeating-linear-gradient strip.
- **One speed constant for coupled motion.** Anything that must move
  together (objects riding a belt + the belt's tread) derives every duration
  from a single px/s constant, computed per spawn from live viewport width.
  Never eyeball two animations into agreement — they will drift on other
  screen sizes. Verify with a measurement snippet (see guide 04).
- **State-class conditions in markup** (`{#if wx === 'rain'}`), state classes
  on the scene root (`tod-night`, `wx-rain`) for CSS theming, and dev URL
  params to force any state (see guide 04).
- **Blink/pulse fixtures**: model as lamp + halo. Halo animates
  opacity+scale; lamp animates fill. `steps(1)` timing for hard electrical
  blinks, ease for glows.

## The traps (each cost real debugging time)

- **Class-name collisions between state classes and element classes.** Root
  had `class="gate {weather}"` while a child was `class="snow"` → the child's
  `inset`/animation rules matched the ROOT and flung the whole scene
  off-screen. **Namespace state classes** (`wx-snow`, `tod-night`) so they can
  never equal an element class.
- **SVG `preserveAspectRatio` starves height when art is very wide.** A long
  viewBox in a wide container scales by width and renders skinny. Fix: give
  the viewBox roughly the container's aspect and use
  `preserveAspectRatio="none"` (uniform when aspects match, tolerable ~10%
  stretch across devices), sizing features in on-screen-proportional units.
- **Layout-viewport math beats CSS zoom.** Anything that "scales the page"
  (zoom tricks) fights container/viewport calculations. Render at native CSS
  size and upscale the captured output instead (guide 07).
- **Fixed pixel coordinates don't survive bigger screens.** Any content
  placed in a fixed layout space (e.g. 240×110 item coordinates) must be
  *mapped* onto the actual rendered rect — scale positions by W/H ratios and
  sprites by `min(sx, sy)`. Found via tablet screenshots: everything
  clustered in a corner.
- **Vertical-band layouts need `clamp()`** for fonts/paddings and a
  small-screen pass (≈360×640). Percent bands + clamp() text survived every
  aspect ratio; fixed rem stacks did not.
- **Reserve exclusive vertical zones for UI vs scenery** (controls anchored
  under band X; figures below band Y) *and* make scenery `pointer-events:
  none` anyway. Belt and braces — the braces caught a device we never tested.

## Personality checklist for any new scene

Per-visit randomization (what varies every time you look?) · a slow ambient
loop (something is always quietly happening) · a rare event worth waiting
for (the red lamp, the blizzard) · one deadpan text detail (a label, a
caption) · a shared-session thread tying scenes together (guide 02).
