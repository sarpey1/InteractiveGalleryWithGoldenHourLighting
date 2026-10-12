# Atelier Atmosphere, Chat, and Ambient Player Plan

## Goal
Transform the existing Golden Goose floating Polaroid gallery into a more convincing working atelier while preserving the current card layout, dragging/inertia, entrance and wind animations, lighting stack, shoe-only catalog view, and full-screen card modal.

The finished scene should:
- Feel like a used shoemaker’s workbench rather than a clean wood texture.
- Add photoreal atelier tools/materials around the edges without competing with the Polaroids.
- Provide a compact bottom-right scripted conversation UI.
- Provide a bottom-left looping ambient audio player that is ready for a local track to be added later.

## Current Repository Facts
- The app is a single React component in `src/App.tsx` with global styling in `src/index.css`.
- The current wood background is `public/assets/93916.png` and is visually clean/even.
- Cards occupy z-indexes starting at 2, active cards rise to 50, lighting/effects occupy roughly 60–73, and the full-screen modal is 200.
- There is currently no chat component, no audio code, and no audio file.
- Existing old chat-related assets remain in `public/assets`, but the requested compact chat should be redesigned rather than restoring the former large panel.
- No component library or formal design-system package is installed; extend the existing bespoke Inter/Figma Hand visual language.

## Visual Direction

### Atelier background composition
Keep the current wood photograph as the base and build a noninteractive `atelier-surface` layer above it but below the Polaroids.

Use two locally cached, optimized photographic crops sourced from Unsplash rather than runtime remote URLs:
- A shoemaker/leather tool flat lay based on Haupes’ “assorted shoe tool kit” photo (`photo-1554825959-e9a6670d4f18`).
- A leather/ruler/thread detail based on Dane Deaner’s workbench photo (`photo-1496180317060-d2026272f138`).

During implementation:
- Download and convert/crop the selected images into appropriately sized WebP assets under `public/assets/`.
- Place the darker tool crop partially off the upper-left or left edge and the tan leather/thread crop partially off the lower-right or upper-right edge.
- Use CSS `mask-image`/gradient fades, warm color filtering, low-to-moderate opacity, and blend modes so the rectangular photo bounds disappear into the wood.
- Keep the central card field visually quieter; props should read as peripheral objects discovered around the workbench.
- Set `pointer-events: none` and `aria-hidden="true"` on every decorative layer.

Suggested visible props/details:
- Cobbler’s scissors or shears.
- Awl/punch and worn hand tools.
- Coiled measuring tape/thread.
- Small leather offcuts or swatches.
- A few loose eyelets/hardware details.

### Dirty/imperfect wood treatment
Add separate CSS-driven surface marks so the workbench remains convincing even if photographic crops are subtle:
- Irregular dark oil/dye smudges using overlapping radial gradients.
- One or two incomplete cup/glue-pot rings using masked elliptical borders or pseudo-elements.
- Fine diagonal knife/scratch marks using repeated linear gradients.
- Light chalk/tailor-pencil strokes and rubbed dust near an edge.
- Small paint/glue speckles with varied opacity and blur.
- A restrained darkened patina concentrated around edges and tool zones.

Avoid a uniform grunge overlay. Marks should be asymmetrical and clustered, with the wood grain still visible. The existing film grain and golden lighting remain in place and should continue to affect the full scene.

## Component and Data Structure

Refactor only enough to keep `App.tsx` readable:

### `AtelierSurface`
Create a small local component in `src/App.tsx` responsible only for decorative background markup:
- Photographic prop layers.
- Ring, stain, scratch, chalk, and speckle elements.
- No state and no pointer interaction.

Keep the decorative positioning data static and deterministic; do not randomize on render because visual changes during React renders would be distracting.

### `AtelierChat`
Create a local compact scripted chat component with these states:
- `isOpen: boolean`, initially `false`.
- `draft: string`.
- `messages: ChatMessage[]`, initially containing one assistant welcome message once opened.
- Optional short `isReplying` state to provide a subtle 300–500 ms response delay.

Closed presentation:
- A small fixed launcher in the bottom-right corner with an existing Golden Goose star motif, “Atelier chat” label on wider screens, and accessible `aria-expanded`/`aria-controls` wiring.

Open presentation:
- A compact paper-like panel, approximately 320–350 px wide and no more than about 430 px tall on desktop.
- Header: “Atelier conversation,” a small online/available marker, and close button.
- Scrollable message area with visually distinct assistant and visitor bubbles.
- Two or three prompt chips shown before or beneath the initial exchange.
- A compact free-text form with send control.

Suggested prompt chips and local responses:
1. “Tell me about these details”
   - Explain that wear, handwriting, stars, patches, and patina preserve the owner’s story.
2. “How does Co-Creation work?”
   - Explain the sequence: choose a model, share a memory/direction, then refine it with an artisan.
3. “Choose a mood for me”
   - Suggest a warm, road-worn direction with distressed leather, hand-marked details, and restrained metallic accents.

Free-text response resolver:
- Normalize submitted text to lowercase.
- Match small keyword groups for craft/materials, personalization/memories, process/appointments, and inspiration/mood.
- Return a concise tailored scripted response for the first matching group.
- Return a graceful default response for unmatched input: acknowledge the idea and explain that an artisan would translate it into materials, marks, and finish.
- Keep the chat local-only: no API, persistence, authentication, or gallery filtering.
- Reject blank submissions and clear the draft after successful submission.
- Keep the message history only for the current page session.

### `AmbientPlayer`
Create a local bottom-left player with:
- `audioRef` for the native `<audio>` element.
- `isPlaying`, `volume`, and `hasAudioError` state.
- A source constant pointing to `/audio/atelier-ambience.mp3`.
- `preload="none"` and `loop` to avoid requesting a missing placeholder track before the visitor interacts.

Desktop presentation:
- A compact warm/off-white control card with “Atelier ambience” and “Chill workshop loop.”
- Play/pause button.
- Small animated waveform/equalizer bars active only while playing.
- Volume slider and accessible volume label.

Behavior:
- Never autoplay. Playback begins only after the user presses play, respecting browser media policies.
- Play/pause uses `audio.play()`/`audio.pause()` and updates state only when the promise succeeds.
- Volume updates both React state and `audio.volume`.
- On `error` or rejected playback, stop the active state and show a compact “Add the ambience track” status rather than failing silently.
- Listen for native `play`, `pause`, and `ended` events so UI state stays synchronized.
- The expected future file location is documented directly in the UI/error copy or a concise nearby code comment: `public/audio/atelier-ambience.mp3`.
- Do not create a fake or silent audio file.

## Layering and Interaction Rules
- Base wood: gallery background.
- Dirty surface overlays and photographic props: z-index 1, pointer-events none.
- Polaroid cards: retain current dynamic z-index 2–50.
- Existing sunlight, color burn, vignette, particles, golden overlay, edge blur, and grain: retain current ordering 60–73.
- Music player and chat: fixed above ambient overlays at approximately z-index 100–110 so they remain crisp and usable.
- Full-screen card modal: retain z-index 200 so it covers both controls.
- Ensure chat/player pointer events do not begin card drags beneath them.

## Responsive Behavior

### Desktop/tablet
- Player fixed 24–32 px from the bottom-left.
- Chat launcher/panel fixed 24–32 px from the bottom-right.
- Open chat must not exceed the viewport height; message area scrolls internally.
- Keep enough side padding that neither control touches the frame edge or is obscured by the vignette.

### Mobile (up to the existing 640 px breakpoint)
- Collapse the player to a narrower pill with play/pause, short title, and a volume popover/compact slider treatment.
- Show the chat as an icon-sized launcher; when open, use `width: calc(100vw - 32px)` and anchor 16 px from both sides/bottom as needed.
- If the open chat and player would collide, temporarily hide or visually de-emphasize the player while the chat is open.
- Scale/crop photographic props more aggressively and keep the central card area readable.

## Motion and Accessibility
- Give the chat panel a short opacity/translate entrance and message replies a restrained fade-up.
- Animate waveform bars only while audio is playing.
- Under `prefers-reduced-motion: reduce`, disable chat entrance, message, waveform, and any new prop drift/parallax; keep all controls functional.
- Use semantic buttons/forms, visible focus styles, and meaningful `aria-label`s.
- Use `aria-live="polite"` for new assistant messages and audio error/status text.
- Keep decorative images empty-alt/aria-hidden.
- Ensure chat can be opened, used, and closed entirely by keyboard; closing should return focus to the launcher.
- Keep text contrast readable against the warm paper surfaces.

## Files to Change
- `src/App.tsx`
  - Add asset/audio constants and types.
  - Add `AtelierSurface`, `AtelierChat`, and `AmbientPlayer` local components.
  - Render the surface beneath cards and controls near the end of the gallery, before the full-screen modal.
  - Preserve all existing gallery interaction code.
- `src/index.css`
  - Add atelier surface, stains, props, chat, player, responsive, focus, and reduced-motion styles.
  - Reuse the existing Inter and Figma Hand fonts; do not add another font dependency.
- `public/assets/atelier-tools.webp`
  - New optimized local photographic crop from the selected Unsplash shoemaker toolkit image.
- `public/assets/atelier-materials.webp`
  - New optimized local crop from the selected Unsplash leather/thread image.
- Future user-supplied file, not created in this implementation: `public/audio/atelier-ambience.mp3`.

## Edge Cases and Failure Handling
- Missing audio file: player remains stable, exits playing state, and displays the add-track status.
- Repeated play clicks while loading: disable or guard the play control until the current `play()` promise settles.
- Empty chat message: no new message and no assistant response.
- Very long chat input: cap input length (for example 240 characters) and allow message wrapping.
- Long chat history: scroll within the message area and auto-scroll to the newest message.
- Full-screen Polaroid opened while chat/player is active: modal visually covers controls; audio may continue unless the user pauses it, matching a continuous atelier ambience.
- Image load failure: dirty CSS surface remains sufficient for the workbench effect; decorative image failure must not affect cards or controls.

## Verification
1. Run `pnpm run build` after implementation because this is a broad UI and interaction change.
2. Use the existing supervised preview/hot reload; do not start another development server.
3. Desktop visual check:
   - Workbench looks used and asymmetrical, not uniformly filtered.
   - Props sit at edges and do not obscure key Polaroids.
   - Existing lighting and card animations still read correctly.
   - Both corner controls remain above visual effects.
4. Gallery regression check:
   - Drag/inertia still works.
   - Click-versus-drag suppression still works.
   - Full-screen modal opens/closes and Escape still works.
5. Chat check:
   - Launcher opens/closes and restores focus.
   - Prompt chips and keyword-based free text return the expected scripted replies.
   - Blank and long submissions are handled.
   - Message region auto-scrolls and announces replies.
6. Audio check before file exists:
   - No audio request occurs until play is pressed.
   - Missing file produces the compact error state without an uncaught exception.
7. Audio check after temporarily supplying a valid local MP3 at the documented path:
   - Play/pause, loop, waveform state, and volume all work.
   - Remove the temporary verification file if it is not user-provided/licensed for the project.
8. Mobile/reduced-motion check:
   - Controls do not overlap each other or become unreachable.
   - Open chat fits the viewport and scrolls internally.
   - New decorative motion and waveform animation stop under reduced-motion preferences.
