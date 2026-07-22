# Stack the Ship — Cargo Drawing Spec

Parameters for drawing cargo items in Procreate (or any tool). The game is a
flat side-view diorama: every item is seen dead side-on.

## Global rules (apply to every item)

1. **Flat side view.** No perspective, no 3/4 angle, no floor ellipse. Pure
   orthographic side-on, like Dumb Ways to Die.
2. **No baked shadows or glows.** No drop shadow, no cast shadow, no outer
   glow. The scene lighting/palette handles mood.
3. **Flat color fills.** Solid shapes, no gradients, no airbrush shading, no
   texture brushes. If you want depth, use a second flat tone (e.g. a darker
   band on the bottom third). Flat traces to clean SVG; painterly does not.
4. **Transparent background.** One item per canvas.
5. **Draw big.** Longest side of the item ≥ 2000 px. I rescale by the art's
   bounding box, so exact canvas size doesn't matter — **aspect ratio does.**
6. **Aspect ratio is law.** Each item below lists its physics footprint
   (width × height in game units). Your drawing's tight bounding box must
   match that ratio. Overhanging soft details (ears, tap handles, tails) may
   poke slightly outside — but see rule 7.
7. **Load-bearing edges must be true.** Bottom edges that rest on the deck
   must be flat and span the full physics width. Top surfaces that other
   cargo stacks onto must sit at the silhouette's top edge. If the art lies
   about where the collision box is, the game looks broken.
8. **Relative scale matters between items.** A crate is 60 units; a wardrobe
   is 130 tall. Keep detail density similar so a small item isn't fancier
   than a big one.
9. **Faces & personality:** your call per item — that's the fun. Current rule
   of thumb: most items are deadpan objects; a select few (pig, gnome, duck)
   are alive. Eyes/mouths on separate Procreate layers, please (rule 10).
10. **Layers = animation.** Anything that should move independently — eyes,
    eyelids, ears, lids, doors, wheels, tongues — keep on its own layer and
    export the PSD (or per-layer PNGs) alongside the flat PNG. I rig those
    parts to blink/wobble/react in-game.

## Delivery

Drop files in `art/drawn/` named by id (`pig.png`, `pig.psd`, …). PNG at full
res + PSD if layered. SVG from Canva is welcome too but optional — I can
vectorize.

---

## Current items (12)

Footprints are width × height in game units. Diagrams show the physics
silhouette your art must fill.

### crate — 60 × 60 (square)
Single box. All four edges load-bearing (it stacks every way).

### barrel — 50 × 66
Single rounded rect, standing upright. Flat top and bottom.

### tire — 56 × 56 (perfect circle)
Circle, radius 28. Art must be circular — it rolls.

### plank — 160 × 18
One long thin board. Dead flat top and bottom — it's the bridge piece.

### piano — 120 × 90
```
############  <- body: full width, top 2/3 (120×60)
############
##        ##  <- two legs 12 wide at the outer edges, bottom 1/3
```
Ground contact only at the two legs. Keyboard side faces… your choice.

### moai — 70 × 100
```
  ######      <- topknot 50 wide × 20 tall, centered
##########    <- head: full width, lower 80
##########
```
Flat bottom (it stands), flat topknot top (things stack on his head).

### bathtub — 110 × 50 (open-top U)
```
##      ##    <- walls 12 wide × 40 tall at each end
##      ##
##########    <- floor: full width × 16, at the bottom
```
The hollow is real — cargo can land inside the tub.

### wardrobe — 70 × 130
Single tall box. Flat top and bottom. The tippy tower piece.

### anchor — 80 × 90
```
   ####       <- shank: 16 wide × 40, upper half, centered
   ####
##########    <- fluke: full width × 24, lower portion
```
Classic anchor reads fine; keep the wide part at the bottom.

### beachball — 52 × 52 (perfect circle)
Circle, radius 26. It's the bouncy menace — keep it friendly.

### pig — 84 × 60
```
      ####    <- head: 24 wide × 26 tall, upper RIGHT
##########    <- body: 64 wide × 44 tall, sitting LEFT of center
##########
```
Faces right. The only current item with a face — it's anxious. Eyes,
ears, snout on separate layers.

### sink — 76 × 46
```
##      ##    <- two taps 14 wide × 26 tall near each end, top
##########    <- basin: full width × 20, bottom
```
"Everything and the kitchen sink."

---

## Wave 2 — proposed new items (physics not built yet; I'll match your art)

| id | footprint | silhouette | notes |
|---|---|---|---|
| `gnome` | 46 × 88 | hat cone-ish top 1/3, body lower 2/3, flat base | alive; smug |
| `duck` | 90 × 78 | body full width lower 2/3, head upper right | giant rubber duck; alive |
| `cone` | 60 × 70 | narrow top (18 wide), full-width base slab 60×14 | traffic cone |
| `washer` | 70 × 82 | single box, round window | washing machine, flat top |
| `sofa` | 140 × 62 | seat slab bottom half full width, backrest left or right half top | comfy |
| `safe` | 70 × 74 | single dense box, dial | the new heaviest item |
| `mattress` | 130 × 30 | single soft slab | squishy — I'll give it low stiffness feel |
| `cake` | 90 × 86 | 3 tiers: 90×30 / 64×28 / 40×28, centered | wedding cake, topper on own layer |
| `potty` | 64 × 110 | single tall box, door seam | porta-potty; comedy gold |
| `disco` | 50 × 50 | perfect circle | disco ball; faceted flats, no gradient sparkle |

Draw any/all of these — send whatever's fun, I build the physics def to match.
