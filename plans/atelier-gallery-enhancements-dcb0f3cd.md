# Atelier Gallery, Guided Co-Creation Flow, and Ambient Player Plan

## Goal
Transform the existing Golden Goose floating Polaroid gallery into a more convincing working atelier while preserving the current drag/inertia behavior, card entrance and wind animations, lighting stack, shoe-only starting view, and full-screen card modal outside the pinning stage.

The finished scene should:
- Feel like a used shoemaker’s workbench rather than a clean wood texture.
- Add photoreal atelier tools/materials around the edges without competing with the Polaroids.
- Add a compact bottom-right guided Co-Creation paper-note flow matching Figma nodes `89:37`, `89:43`, `89:48`, `89:52`, `89:54`, and `89:60` from file `gX5qH0VcGIeJ3vzGMerweG`.
- Filter the board when a direction is chosen, animate nonmatching Polaroids away, let the visitor pin 1–3 matching references, and produce a final Story Card.
- Add a bottom-left looping ambient audio player ready for a local track to be supplied later.

## Confirmed Product Decisions
- The guided flow uses English throughout. Use the emotional English copy from the attached flow brief while preserving the Figma panel’s typography, paper texture, spacing, hand-drawn arrows, and stamp treatment.
- The flow is not a conventional message-thread chat. It is a persistent compact kraft-paper slip fixed at the bottom-right, open by default and advancing through designed conversational states.
- Selecting direction A, B, or C filters the visible board.
- During the pinning state, clicking a matched Polaroid toggles its pinned state instead of opening the full-screen modal.
- `DONE` is disabled until at least one Polaroid is pinned; up to three references may be pinned.
- `DONE` opens a new final Story Card state containing the entered memory, selected direction, and pinned reference thumbnails/captions.
- `Reset` restores the initial invitation, clears memory/direction/pins, restores all starting shoe Polaroids, and resets their dragged offsets.
- The ambient player loops, starts only after user action, exposes volume, and points to a future local MP3.

## Current Repository Facts
- `src/App.tsx` contains the whole React gallery and CSV parsing.
- `src/index.css` contains the complete visual and motion system.
- `public/assets/93916.png` is the current clean wood background.
- The gallery currently derives stable card metadata from `src/data/golden-goose-cocreation-catalog.csv` and initially shows four `Shoe` records.
- Cards use z-indexes 2–50, ambient lighting/effects use roughly 60–73, and the full-screen modal uses 200.
- There is no current chat or audio implementation.
- No component library/design-system package is installed, so new controls should extend the existing bespoke visual system.

## Figma Fidelity Requirements

### Required design assets
Install the Figma asset archives during implementation according to the loaded `figma-design-to-code` procedure, using workspace-local `.figma/design-context/assets.zip` rather than `/tmp`:
- Paper texture/background: `2909b.png`.
- Initial hand-drawn circled arrow: `6743f.svg`.
- DONE stamp: `44169.svg`.
- Reset sketched oval: `a4a89.svg`.

Download with `curl -L`, unzip `assets/*` into `public`, set the runtime prefix to `/assets`, and verify every used asset is non-empty. Do not leave temporary Figma asset URLs in source.

The same `2909b.png` appears across the supplied states; keep one installed copy. Do not redraw or replace the visible SVG assets.

### Required fonts
Resolve the two exact imported faces in one `figma fonts resolve` invocation during implementation:
- `Arial Narrow`, Regular → CSS family `"Arial Narrow:Regular"`.
- `Atkinson Hyperlegible Mono`, Regular → CSS family `"Atkinson Hyperlegible Mono:Regular"`.

Create one JSON input containing both rows, resolve to `public/fonts`, and add exact `@font-face` declarations to `src/index.css` using only returned paths/URLs, style, weight, and format metadata.

If a row is reported in `blocked[]`, do not declare its requested CSS family. Use explicit fallback families instead:
- Arial Narrow fallback: `Arial, sans-serif`.
- Atkinson Hyperlegible Mono fallback: `"Courier New", monospace`.

Preserve the Figma typography in the panel:
- Main conversational text: Arial Narrow Regular, 28 px at the source 480 × 304 size.
- Direction choices: Arial Narrow Regular, 24 px at source size.
- Input text: Atkinson Hyperlegible Mono Regular, 18 px at source size.
- DONE lettering: Arial Narrow Regular, 33.6 px at source size and slightly rotated as supplied by the SVG/composition.
- When the desktop panel is rendered smaller than 480 × 304, scale the complete internal composition proportionally rather than independently changing type relationships.

### Panel geometry and visual language
- Use the Figma’s 480:304 aspect ratio as the canonical component canvas.
- Render it at approximately 340–380 px wide on desktop, fixed 24–32 px from the bottom-right; scale the internal Figma composition as one unit so spacing and typography remain faithful.
- Use `2909b.png` as a full panel background with cover sizing.
- Preserve the warm kraft tone, subtle vertical paper rules, dark ink text, white hand-drawn bordered input, organic arrow/stamp assets, and lack of conventional app chrome.
- Do not add a header, avatar, speech bubbles, online status, or generic chat window controls.

## Atelier Background Direction

### Photographic workbench props
Keep the current wood photograph as the base and add a noninteractive `AtelierSurface` above it but below cards.

Use locally cached, optimized crops sourced from Unsplash rather than runtime remote URLs:
- Haupes’ “assorted shoe tool kit” image (`photo-1554825959-e9a6670d4f18`).
- Dane Deaner’s leather/ruler/thread image (`photo-1496180317060-d2026272f138`).

Implementation treatment:
- Download and convert/crop both to WebP under `public/assets/`.
- Place the darker shoemaker toolkit partially outside the upper-left/left edge.
- Place the tan leather/thread crop partially outside the upper-right or lower-right edge, avoiding the bottom-right conversation panel.
- Fade rectangular bounds with CSS masks/gradients, apply warm filtering and restrained blend modes, and keep the center quieter than the perimeter.
- Use `pointer-events: none` and `aria-hidden="true"`.

Visible details should suggest scissors/shears, awls/punches, thread, measuring tape, leather offcuts, and loose hardware without obscuring the cards.

### Dirty/imperfect wood
Add asymmetrical CSS-driven marks:
- Irregular oil/dye smudges from overlapping radial gradients.
- One or two incomplete glue-pot/cup rings.
- Fine diagonal knife and scratch marks.
- Light chalk/tailor-pencil strokes and rubbed dust.
- Small paint/glue speckles with varied blur and opacity.
- Darker edge patina clustered near tool zones.

Do not apply a uniform dirt filter. Preserve visible grain and let the current golden light, vignette, edge blur, and film grain continue to affect the full scene.

## Component Structure

Keep the implementation in `src/App.tsx`, but split local concerns into focused components/helpers.

### `AtelierSurface`
Stateless decorative component containing:
- Two masked photographic prop layers.
- Stain/ring/scratch/chalk/speckle elements.
- Deterministic markup and positions; no render-time randomness.

### `CoCreationPanel`
Controlled local component receiving the current stage and event callbacks from `App` so gallery filtering/pinning remains owned by the gallery.

Suggested types:
```ts
type FlowStage =
  | "invitation"
  | "memory"
  | "reflection"
  | "direction"
  | "pinning"
  | "story"

type DirectionId = "intimate" | "road" | "artistic"

type Direction = {
  id: DirectionId
  label: string
  optionCopy: string
  models: string[]
}
```

Panel props should include:
- `stage`, `memory`, `direction`, `pinnedCards`.
- `onBegin`, `onMemorySubmit`, `onDirectionSelect`, `onDone`, `onReset`.

### `StoryCard`
Local subcomponent rendered within the same kraft-paper panel in the final `story` stage:
- Title: `Your Story Card`.
- Memory label and entered memory text.
- Direction label and the selected direction’s short English title.
- 1–3 compact pinned card thumbnails using existing catalog images.
- Each thumbnail includes its `model` and `personalization` caption.
- Actions: `Reset` returns to invitation and `Close` collapses the completed panel to a small `Story saved` kraft tab.
- Reopening the saved tab returns to the Story Card without changing the filtered/pinned board.

### `AmbientPlayer`
Local bottom-left component with:
- Native audio ref.
- `isPlaying`, `isLoading`, `volume`, and `hasAudioError` state.
- Source `/audio/atelier-ambience.mp3`.
- `<audio preload="none" loop>`.
- Compact warm paper control showing `Atelier ambience`, `Chill workshop loop`, play/pause, active waveform bars, and volume slider.

## Co-Creation State Machine and Exact Flow

### Stage 1: `invitation` — Figma `89:37`
Copy:
- `What is a memory you would like to keep?`

UI:
- Centered two-line question.
- Exact hand-drawn circled arrow asset below.

Action:
- Arrow click moves to `memory` with a 400 ms ease-out transition.

### Stage 2: `memory` — Figma `89:43` / `89:48`
Copy:
- Title: `Write your unspoken story`
- Input placeholder: `The memory of an endless road trip.`

Behavior:
- Use a real single-line input styled to match the Figma white hand-drawn field.
- Cap memory input at 120 characters.
- Enter submits; a visually hidden submit button keeps form semantics without adding an off-design visible control.
- Blank/whitespace-only memory does not advance and exposes an accessible inline error/announcement without changing the panel layout.
- Successful submission trims and stores the memory, then moves to `reflection`.

### Stage 3: `reflection` — Figma `89:52`
Copy:
- `The most meaningful memories often bloom from the smallest fragments.`

Behavior:
- Centered contemplative state.
- Automatically advances to `direction` after approximately 1.4–1.8 seconds.
- Clear the timeout on stage change/unmount.
- Under reduced motion, retain a short readable pause but remove animated movement.

### Stage 4: `direction` — Figma `89:54`
Copy:
- Title: `Which of these visual souls speaks closest to your story?`
- A: `A quiet, whispered secret (handwritten dates, intimate words)`
- B: `The raw marks of time, asphalt, and open roads`
- C: `A free, expressive stroke of spontaneous art`

Behavior:
- Render all three lines as accessible full-width buttons while visually preserving the plain ink-on-paper treatment.
- No extra boxes, radio circles, or modern selection chrome.

Direction-to-card mapping for the current four-shoe board:
- `intimate`: `Super-Star`, `Ball Star`, `Marathon`.
- `road`: `Super-Star`, `Ball Star`, `Mid Star`.
- `artistic`: `Super-Star`, `Mid Star`, `Marathon`.

Use model names rather than generated numeric IDs so the mapping remains understandable and stable if CSV row order changes.

On selection:
1. Store the chosen direction.
2. Mark nonmatching visible cards as exiting.
3. Animate nonmatching cards drifting outward and fading into shadow for 400 ms ease-out.
4. After the exit animation, set visible IDs to the three matching cards.
5. Clear manual drag offsets for the matched set and apply a compact filtered layout that gathers them around the paper panel without covering it or the music player.
6. Transition the panel to `pinning`.

### Stage 5: `pinning` — Figma `89:60`
Copy:
- `Pin the Dream Maker memories that spark your journey.`
- `DONE`
- `Reset`

Board interaction:
- Clicking a remaining Polaroid toggles its pin state instead of opening the full-screen modal.
- Add a small brass/black artisan pin at the top center of pinned cards.
- Pinned cards stop wind motion, settle with a small scale/rotation transition, rise above unpinned matched cards, and expose `aria-pressed="true"`.
- Clicking a pinned card unpins it and resumes its gentle wind motion.
- Keep drag enabled for matched cards; dragging must not accidentally toggle pinning because the existing click-suppression logic already distinguishes movement.
- Maximum three pinned cards; because each direction yields three matches, all may be selected.

Panel interaction:
- Use the exact supplied black DONE stamp and sketched Reset oval assets.
- DONE remains visibly inactive and disabled while no cards are pinned; implement disabled appearance without modifying the source SVG.
- DONE with 1–3 pins advances to `story`.
- Reset performs the full reset behavior described below.

### Stage 6: `story` — new final state
This state extends the established kraft-paper visual language because no supplied Figma node covers it.

Content:
- `Your Story Card`.
- Entered memory.
- Chosen direction short label:
  - `Quiet, whispered secret`
  - `Marks of time and the road`
  - `Free, expressive art`
- 1–3 pinned reference thumbnails.
- Each reference shows model and personalization text.

Actions:
- `Reset`: full reset to Stage 1.
- `Close`: collapse panel to a small `Story saved` kraft tab; board remains filtered and pinned.
- Clicking the saved tab reopens the Story Card.

## Gallery State and Data Flow

Move gallery filtering into explicit state in `App`:
- `flowStage`.
- `memory`.
- `selectedDirection`.
- `visibleCardIds`, initialized to the four shoe IDs.
- `exitingCardIds` for the 400 ms direction transition.
- `pinnedCardIds`.
- `isStoryCollapsed`.

Derived data:
- `visibleCards` from `visibleCardIds`.
- `matchedCards` from the selected direction’s model list.
- `pinnedCards` from `pinnedCardIds` in visible-card order.

Card click rule:
- If drag suppression applies, do nothing.
- If `flowStage === "pinning"`, toggle the pin.
- Otherwise preserve the current full-screen modal behavior.

Full reset helper:
- Clear any pending direction/reflection timers.
- Set stage to `invitation`.
- Clear memory, direction, exit IDs, pin IDs, and collapsed-story state.
- Restore all shoe IDs.
- Reset `positions` and `topCard`.
- Cancel active inertia animation frames before clearing positions so a coasting card cannot repopulate offsets after reset.

Filtered layout:
- Define three responsive destination slots that sit around/above the bottom-right panel rather than underneath it.
- Apply slot transforms as a separate filtered-layout transform layer so drag offsets remain independent.
- On Reset, remove filtered-layout transforms and let all four shoe cards return to their original layouts with a 400 ms scatter-in transition.

## Ambient Player Behavior
- Never autoplay; playback begins only after pressing play.
- Guard repeated play clicks while the `audio.play()` promise is pending.
- Update UI from native `play`, `pause`, `ended`, and `error` events.
- Volume slider updates both state and `audio.volume`.
- On missing file or rejected playback, stop active/loading state and show `Add public/audio/atelier-ambience.mp3` in a compact accessible status.
- Do not create a fake/silent file.
- Audio may continue while a card modal or Story Card is open to preserve the atelier ambience.

## Layering and Interaction
- Wood background: gallery base.
- Dirty surface and tool photography: z-index 1, pointer-events none.
- Cards: current range 2–50; pinned cards get a deterministic raised value below ambient overlays.
- Existing lighting/effects: preserve 60–73.
- Music player and Co-Creation panel: fixed at approximately 100–110, above lighting so text/controls remain crisp.
- Full-screen card modal: retain 200 and cover both controls.
- Stop pointer propagation inside player/panel so interactions never begin a card drag beneath them.

## Responsive Behavior

### Desktop/tablet
- Player fixed 24–32 px from bottom-left.
- Co-Creation panel fixed 24–32 px from bottom-right, approximately 340–380 px wide with the 480:304 ratio.
- Filtered card destinations avoid both controls.
- Story Card may grow slightly taller than the conversational states but must remain within the viewport and scroll only its reference area if needed.

### Mobile (existing 640 px breakpoint)
- Player collapses to a narrow pill with play/pause, short title, and compact volume control.
- Co-Creation panel uses `width: calc(100vw - 32px)` and remains 16 px from the sides/bottom.
- When the panel is active, move the player above it or reduce it to an icon control; do not overlap the two.
- Stack Story Card thumbnails horizontally with scrolling or in a compact grid.
- Recalculate filtered card slots so at least part of every matched Polaroid remains visible and tappable above the panel.
- Crop/fade decorative atelier props more aggressively on narrow screens.

## Motion and Accessibility
- Use 400 ms ease-out transitions, matching the supplied Smart Animate direction.
- Direction filtering: nonmatches slide outward/fade; matches glide to filtered slots.
- Pinning: pin appears with a short settle motion and wind stops.
- Panel state changes crossfade/slide subtly without resembling a carousel.
- `prefers-reduced-motion: reduce`: remove card drift-out/glide, panel movement, pin settle, waveform motion, and any new prop motion; perform state changes immediately except for the readable reflection pause.
- Direction options and card pins must be keyboard-operable.
- Use visible focus styles compatible with kraft paper.
- Use `aria-live="polite"` for stage guidance, memory validation, Story Card completion, and audio status.
- In pinning state, announce selection count (`1 of 3 references pinned`).
- Preserve semantic form submission for the memory input.
- Decorative assets/images are empty-alt and aria-hidden.

## Files to Change/Add
- `src/App.tsx`
  - Add direction/flow types and model mappings.
  - Add explicit gallery visibility, exit, pin, stage, memory, and Story Card state.
  - Add `AtelierSurface`, `CoCreationPanel`, `StoryCard`, and `AmbientPlayer` local components.
  - Adapt card click behavior for pinning and add pin visual state/classes.
  - Add filter/reset transition helpers while preserving drag/inertia and modal logic.
- `src/index.css`
  - Add resolved Figma font faces.
  - Add atelier surface, dirty wood, Figma-faithful panel, stages, Story Card, pin, filtered-layout, player, responsive, focus, and reduced-motion styles.
- `public/assets/2909b.png`
- `public/assets/6743f.svg`
- `public/assets/44169.svg`
- `public/assets/a4a89.svg`
  - Installed exactly from Figma archives and used without remote references.
- `public/assets/atelier-tools.webp`
  - Optimized local Unsplash shoemaker-tool crop.
- `public/assets/atelier-materials.webp`
  - Optimized local Unsplash leather/thread crop.
- Future user-supplied file, not created now: `public/audio/atelier-ambience.mp3`.

## Edge Cases and Failure Handling
- Missing audio file: stable error state; no uncaught rejection.
- Blank memory: remain on input stage and announce validation.
- Reflection timer: clear on reset/unmount to prevent stale stage jumps.
- Rapid direction clicks: accept only the first while filtering transition is active.
- Reset during card inertia: cancel animation frames before clearing offsets.
- Click after drag in pinning stage: existing suppression prevents accidental pin toggling.
- No pins: DONE remains disabled.
- Image failure in a Story Card thumbnail: retain its text/model block.
- Decorative photo failure: CSS dirt/patina still provides the atelier effect.
- CSV changes that remove a configured model: filter existing matches only; if a direction would yield no cards, leave the board unchanged and announce that no archive match is currently available.
- Full-screen modal is unavailable from card click only during `pinning`; before and after pinning, existing modal behavior remains.

## Verification
1. Run `pnpm run build` because this is a broad state, asset, font, and interaction change.
2. Use the existing supervised preview/hot reload; do not start another server.
3. Asset/font checks:
   - Every Figma asset used is non-empty under `public/assets`.
   - No source references temporary Figma MCP asset URLs or archive paths.
   - Font resolution output is correlated by exact family/style and CSS uses exact returned metadata.
4. Figma visual checks at each state:
   - Compare panel ratio, paper texture, typography, spacing, input, arrow, DONE stamp, and Reset oval to nodes `89:37`, `89:43`, `89:52`, `89:54`, and `89:60`.
   - Confirm all-English copy while retaining the supplied visual hierarchy.
5. Flow checks:
   - Invitation arrow → memory input → timed reflection → A/B/C directions → filtered pinning → Story Card.
   - Each direction leaves exactly the configured three shoe models.
   - Nonmatches animate away over 400 ms; matches gather near the panel.
   - DONE is disabled at zero pins and enabled at 1–3.
   - Story Card accurately reflects memory, direction, and pinned references.
   - Close/reopen preserves the Story Card; Reset restores the original four-shoe board and initial panel.
6. Gallery regression checks:
   - Drag/inertia and click suppression still work.
   - Pin clicks do not open the modal during pinning.
   - Full-screen modal works before pinning and from the completed board after Story Card creation.
   - Escape still closes the modal.
7. Atelier visual checks:
   - Wood looks asymmetrically used/dirty rather than uniformly filtered.
   - Tool photography sits at edges and does not obscure cards or controls.
   - Existing golden lighting/particles/grain remain coherent.
8. Audio checks before the file exists:
   - No request until play is pressed.
   - Play produces the compact add-track state without an exception.
9. Audio checks with a temporary valid local MP3:
   - Play/pause, loop, waveform state, and volume work.
   - Remove the temporary file if it is not user-provided/licensed.
10. Mobile/reduced-motion checks:
   - Panel/player do not overlap or become unreachable.
   - Matched cards remain visible/tappable.
   - Story Card fits and reference overflow is usable.
   - Reduced-motion disables new movement while retaining the reflection reading pause and all functionality.
