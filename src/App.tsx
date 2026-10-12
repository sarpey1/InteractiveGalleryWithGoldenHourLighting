import { useEffect, useRef, useState } from "react"
import catalog from "./data/golden-goose-cocreation-catalog.csv?raw"

type Card = {
  id: number
  left: number
  top: number
  rotation: number
  scale?: number
  delay: number
  duration: number
  image: string
  alt: string
  category: string
  model: string
  personalization: string
  note: string
}

type Point = { x: number y: number }
type CardLayout = Omit<Card, "image" | "alt" | "category" | "model" | "personalization" | "note">
type FlowStage = "invitation" | "memory" | "reflection" | "direction" | "pinning" | "story"
type DirectionId = "intimate" | "road" | "artistic"
type Direction = {
  id: DirectionId
  shortLabel: string
  optionCopy: string
  models: string[]
}

const assetPathPrefix = "/assets"
const woodTexture = `${assetPathPrefix}/93916.png`
const vignette = `${assetPathPrefix}/76e6d.svg`
const goldenLightOverlay = `${assetPathPrefix}/golden-light-overlay.jpg`
const closeIcon = `${assetPathPrefix}/8d2dd.svg`
const paperTexture = `${assetPathPrefix}/2909b.png`
const invitationArrow = `${assetPathPrefix}/6743f.svg`
const doneStamp = `${assetPathPrefix}/44169.svg`
const resetOval = `${assetPathPrefix}/a4a89.svg`
const fabricRolls = `${assetPathPrefix}/c9886.png`
const pencilTray = `${assetPathPrefix}/2e94a.png`
const ambientAudio = "/audio/atelier-ambience.mp3"

const cardLayouts: CardLayout[] = [
  { id: 1, left: 0, top: -11.6, rotation: -11.52, delay: -1.8, duration: 8.6 },
  { id: 2, left: -6.65, top: 26, rotation: 9.48, delay: -4.2, duration: 9.8 },
  {
    id: 3,
    left: 17.12,
    top: 14.36,
    rotation: 9.48,
    delay: -6.1,
    duration: 10.4,
  },
  { id: 4, left: 25.46, top: -16, rotation: 9.48, delay: -3.3, duration: 9.1 },
  {
    id: 5,
    left: -5.86,
    top: 55.18,
    rotation: -25.16,
    delay: -7.4,
    duration: 11.2,
  },
  {
    id: 6,
    left: 24.09,
    top: 44.53,
    rotation: 0,
    scale: 0.93,
    delay: -2.5,
    duration: 8.9,
  },
  { id: 7, left: 48.18, top: 28.61, rotation: 0, delay: -5.4, duration: 10.1 },
  { id: 8, left: 57.55, top: -8.5, rotation: 0, delay: -8.2, duration: 11.4 },
  { id: 9, left: 49.87, top: 63.77, rotation: 0, delay: -3.8, duration: 9.6 },
  {
    id: 10,
    left: 72.27,
    top: 44.53,
    rotation: -10.27,
    scale: 0.85,
    delay: -6.7,
    duration: 10.8,
  },
  {
    id: 11,
    left: 74.74,
    top: -0.3,
    rotation: -10.27,
    delay: -1.2,
    duration: 9.4,
  },
  {
    id: 12,
    left: -25.2,
    top: 107.37,
    rotation: 30.48,
    delay: -4.9,
    duration: 10.6,
  },
]

const directions: Direction[] = [
  {
    id: "intimate",
    shortLabel: "Quiet, whispered secret",
    optionCopy: "A quiet, whispered secret (handwritten dates, intimate words)",
    models: ["Super-Star", "Ball Star", "Marathon"],
  },
  {
    id: "road",
    shortLabel: "Marks of time and the road",
    optionCopy: "The raw marks of time, asphalt, and open roads",
    models: ["Super-Star", "Ball Star", "Mid Star"],
  },
  {
    id: "artistic",
    shortLabel: "Free, expressive art",
    optionCopy: "A free, expressive stroke of spontaneous art",
    models: ["Super-Star", "Mid Star", "Marathon"],
  },
]

const filteredLayouts = [
  { left: 15, top: -4, rotation: -8 },
  { left: 38, top: 13, rotation: 6 },
  { left: 55, top: 43, rotation: -5 },
]

const parseCsvRow = (row: string) => {
  const fields: string[] = []
  let field = ""
  let quoted = false

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index]
    const nextCharacter = row[index + 1]

    if (character === '"' && quoted && nextCharacter === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === "," && !quoted) {
      fields.push(field.trim())
      field = ""
    } else {
      field += character
    }
  }

  fields.push(field.trim())
  return fields
}

const [, ...catalogRows] = catalog.trim().split(/\r?\n/)
const cards: Card[] = catalogRows
  .filter((row) => row.trim())
  .map((row, index) => {
    const [image, category, model, personalization, note] = parseCsvRow(row)
    const layout = cardLayouts[index % cardLayouts.length]

    return {
      ...layout,
      id: index + 1,
      image: image.trim(),
      alt: `${model} ${category}`,
      category: category.trim(),
      model: model.trim(),
      personalization: personalization.trim(),
      note: note.trim(),
    }
  })

const shoeCardIds = cards
  .filter((card) => card.category.toLowerCase() === "shoe")
  .map((card) => card.id)

const lightParticles = Array.from({ length: 24 }, (_, index) => ({
  left: (index * 37 + 11) % 97,
  top: (index * 53 + 7) % 94,
  size: 2 + (index % 4) * 0.8,
  delay: -(index % 9) * 1.7,
  duration: 10 + (index % 7) * 1.4,
  drift: 10 + (index % 5) * 5,
}))

const entranceDirections = [
  { x: "-48vw", y: "0" },
  { x: "0", y: "-54vh" },
  { x: "46vw", y: "0" },
  { x: "0", y: "54vh" },
  { x: "-38vw", y: "-38vh" },
  { x: "38vw", y: "38vh" },
]

function PolaroidFrame({
  image,
  alt,
  personalization,
}: Pick<Card, "image" | "alt" | "personalization">) {
  const hasLongPersonalization = personalization.length > 32

  return (
    <div className="polaroid" data-node-id="11:197">
      <div className="photo-slot" data-node-id="11:198">
        <img src={image} alt={alt} draggable="false" />
      </div>
      <p
        className={`personalization${
          hasLongPersonalization ? " personalization-long" : ""
        }`}
        data-node-id="11:199"
      >
        {personalization}
      </p>
    </div>
  )
}

function StoryCard({
  memory,
  direction,
  pinnedCards,
  onReset,
  onClose,
}: {
  memory: string
  direction: Direction
  pinnedCards: Card[]
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div className="story-card">
      <p className="story-card-kicker">Your Story Card</p>
      <p className="story-card-memory">“{memory}”</p>
      <p className="story-card-direction">{direction.shortLabel}</p>
      <div
        className="story-card-references"
        aria-label="Pinned Dream Maker references"
      >
        {pinnedCards.map((card) => (
          <div className="story-card-reference" key={card.id}>
            <img src={card.image} alt="" />
            <div>
              <strong>{card.model}</strong>
              <span>{card.personalization}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="story-card-actions">
        <button type="button" onClick={onReset}>
          Reset
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function CoCreationPanel({
  stage,
  memory,
  direction,
  pinnedCards,
  isFiltering,
  isCollapsed,
  onBegin,
  onMemorySubmit,
  onDirectionSelect,
  onDone,
  onReset,
  onCollapse,
  onReopen,
}: {
  stage: FlowStage
  memory: string
  direction: Direction | null
  pinnedCards: Card[]
  isFiltering: boolean
  isCollapsed: boolean
  onBegin: () => void
  onMemorySubmit: (memory: string) => void
  onDirectionSelect: (direction: Direction) => void
  onDone: () => void
  onReset: () => void
  onCollapse: () => void
  onReopen: () => void
}) {
  const [draft, setDraft] = useState("")
  const [memoryError, setMemoryError] = useState("")

  useEffect(() => {
    if (stage === "invitation") {
      setDraft("")
      setMemoryError("")
    }
  }, [stage])

  if (stage === "story" && isCollapsed) {
    return (
      <button
        className="story-saved-tab"
        type="button"
        onClick={onReopen}
        aria-label="Reopen your Story Card"
      >
        <span>Story saved</span>
      </button>
    )
  }

  const submitMemory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextMemory = draft.trim()
    if (!nextMemory) {
      setMemoryError("Write a memory before continuing.")
      return
    }
    setMemoryError("")
    onMemorySubmit(nextMemory)
  }

  return (
    <aside
      className={`co-creation-panel co-creation-${stage}`}
      style={{ backgroundImage: `url(${paperTexture})` }}
      aria-label="Atelier Co-Creation"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="co-creation-content" aria-live="polite">
        {stage === "invitation" && (
          <div className="flow-centered" data-node-id="89:37">
            <p className="flow-title">
              What is a memory you would
              <br />
              like to keep?
            </p>
            <button
              className="invitation-arrow"
              type="button"
              onClick={onBegin}
              aria-label="Begin Co-Creation"
            >
              <img src={invitationArrow} alt="" />
            </button>
          </div>
        )}

        {stage === "memory" && (
          <form
            className="memory-form"
            onSubmit={submitMemory}
            data-node-id="89:43"
          >
            <label className="flow-title" htmlFor="atelier-memory">
              Write your unspoken story
            </label>
            <input
              id="atelier-memory"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={120}
              placeholder="The memory of an endless road trip."
              autoFocus
              aria-describedby={memoryError ? "memory-error" : undefined}
            />
            <button className="sr-only" type="submit">
              Continue
            </button>
            <span id="memory-error" className="sr-only" role="alert">
              {memoryError}
            </span>
          </form>
        )}

        {stage === "reflection" && (
          <div className="flow-centered" data-node-id="89:52">
            <p className="flow-title reflection-copy">
              The most meaningful memories often bloom from the smallest
              fragments.
            </p>
          </div>
        )}

        {stage === "direction" && (
          <div className="direction-step" data-node-id="89:54">
            <p className="flow-title">
              Which of these visual souls speaks closest to your story?
            </p>
            <div className="direction-options">
              {directions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onDirectionSelect(item)}
                  disabled={isFiltering}
                >
                  {String.fromCharCode(65 + index)}) {item.optionCopy}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === "pinning" && (
          <div className="pinning-step" data-node-id="89:60">
            <p className="flow-title">
              Pin the Dream Maker memories
              <br />
              that spark your journey.
            </p>
            <div className="pinning-actions">
              <button
                className="ink-action done-action"
                type="button"
                onClick={onDone}
                disabled={pinnedCards.length === 0}
                aria-label={
                  pinnedCards.length === 0
                    ? "Pin at least one reference before continuing"
                    : `Create Story Card with ${pinnedCards.length} pinned reference${
                        pinnedCards.length === 1 ? "" : "s"
                      }`
                }
              >
                <img src={doneStamp} alt="" />
                <span>DONE</span>
              </button>
              <button
                className="ink-action reset-action"
                type="button"
                onClick={onReset}
              >
                <img src={resetOval} alt="" />
                <span>Reset</span>
              </button>
            </div>
            <span className="sr-only" aria-live="polite">
              {pinnedCards.length} of 3 references pinned
            </span>
          </div>
        )}

        {stage === "story" && direction && (
          <StoryCard
            memory={memory}
            direction={direction}
            pinnedCards={pinnedCards}
            onReset={onReset}
            onClose={onCollapse}
          />
        )}
      </div>
    </aside>
  )
}

function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasAudioError, setHasAudioError] = useState(false)

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio || isLoading) return

    if (isPlaying) {
      audio.pause()
      return
    }

    setIsLoading(true)
    setHasAudioError(false)
    try {
      await audio.play()
    } catch {
      setHasAudioError(true)
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      className="ambient-player"
      aria-label="Atelier ambience player"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={ambientAudio}
        preload="none"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setHasAudioError(true)
          setIsPlaying(false)
          setIsLoading(false)
        }}
      />
      <button
        className="ambient-play"
        type="button"
        onClick={togglePlayback}
        disabled={isLoading}
        aria-label={
          isPlaying ? "Pause atelier ambience" : "Play atelier ambience"
        }
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h4v14H7zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8 5 11 7-11 7z" />
          </svg>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {hasAudioError ? "Ambient audio file is not available yet." : ""}
      </span>
    </section>
  )
}

export default function App() {
  const [isGalleryLoading, setIsGalleryLoading] = useState(true)
  const [positions, setPositions] = useState<Record<number, Point>>({})
  const [topCard, setTopCard] = useState(0)
  const [visibleCardIds, setVisibleCardIds] = useState<number[]>(shoeCardIds)
  const [exitingCardIds, setExitingCardIds] = useState<number[]>([])
  const [pinnedCardIds, setPinnedCardIds] = useState<number[]>([])
  const [flowStage, setFlowStage] = useState<FlowStage>("invitation")
  const [memory, setMemory] = useState("")
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(
    null,
  )
  const [isFiltering, setIsFiltering] = useState(false)
  const [isStoryCollapsed, setIsStoryCollapsed] = useState(false)
  const [fullScreenCardId, setFullScreenCardId] = useState<number | null>(null)
  const dragRef = useRef<{
    id: number
    pointerId: number
    origin: Point
    start: Point
    last: Point
    lastTime: number
    velocity: Point
    moved: boolean
  } | null>(null)
  const suppressClickRef = useRef<number | null>(null)
  const positionsRef = useRef(positions)
  const animationRef = useRef<Record<number, number>>({})
  const reflectionTimerRef = useRef<number | null>(null)
  const filterTimerRef = useRef<number | null>(null)

  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  useEffect(() => {
    let cancelled = false
    const sources = [
      woodTexture,
      fabricRolls,
      pencilTray,
      ...cards
        .filter((card) => shoeCardIds.includes(card.id))
        .map((card) => card.image),
    ]

    Promise.all(
      sources.map(
        (source) =>
          new Promise<void>((resolve) => {
            const image = new Image()
            image.onload = () => resolve()
            image.onerror = () => resolve()
            image.src = source
          }),
      ),
    ).then(() => {
      if (cancelled) return
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setIsGalleryLoading(false)
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(animationRef.current).forEach(cancelAnimationFrame)
      if (reflectionTimerRef.current !== null)
        window.clearTimeout(reflectionTimerRef.current)
      if (filterTimerRef.current !== null)
        window.clearTimeout(filterTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (flowStage !== "reflection") return
    reflectionTimerRef.current = window.setTimeout(() => {
      setFlowStage("direction")
    }, 1600)
    return () => {
      if (reflectionTimerRef.current !== null)
        window.clearTimeout(reflectionTimerRef.current)
    }
  }, [flowStage])

  useEffect(() => {
    if (fullScreenCardId === null) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullScreenCardId(null)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [fullScreenCardId])

  const moveCard = (id: number, point: Point) => {
    positionsRef.current = { ...positionsRef.current, [id]: point }
    setPositions(positionsRef.current)
  }

  const beginDrag = (event: React.PointerEvent<HTMLElement>, id: number) => {
    cancelAnimationFrame(animationRef.current[id])
    event.currentTarget.setPointerCapture(event.pointerId)
    const origin = positionsRef.current[id] ?? { x: 0, y: 0 }
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      origin,
      start: { x: event.clientX, y: event.clientY },
      last: { x: event.clientX, y: event.clientY },
      lastTime: performance.now(),
      velocity: { x: 0, y: 0 },
      moved: false,
    }
    setTopCard(id)
  }

  const dragCard = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const now = performance.now()
    const elapsed = Math.max(now - drag.lastTime, 8)
    if (
      Math.abs(event.clientX - drag.start.x) +
        Math.abs(event.clientY - drag.start.y) >
      4
    ) {
      drag.moved = true
    }
    drag.velocity = {
      x: ((event.clientX - drag.last.x) / elapsed) * 16,
      y: ((event.clientY - drag.last.y) / elapsed) * 16,
    }
    drag.last = { x: event.clientX, y: event.clientY }
    drag.lastTime = now
    moveCard(drag.id, {
      x: drag.origin.x + event.clientX - drag.start.x,
      y: drag.origin.y + event.clientY - drag.start.y,
    })
  }

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (drag.moved) {
      suppressClickRef.current = drag.id
      window.setTimeout(() => {
        if (suppressClickRef.current === drag.id)
          suppressClickRef.current = null
      }, 0)
    }

    let point = positionsRef.current[drag.id] ?? { x: 0, y: 0 }
    let velocity = drag.velocity
    const card = event.currentTarget

    const coast = () => {
      velocity = { x: velocity.x * 0.92, y: velocity.y * 0.92 }
      point = { x: point.x + velocity.x, y: point.y + velocity.y }

      const rect = card.getBoundingClientRect()
      const margin = 56
      if (rect.right < margin && velocity.x < 0) velocity.x *= -0.55
      if (rect.left > window.innerWidth - margin && velocity.x > 0)
        velocity.x *= -0.55
      if (rect.bottom < margin && velocity.y < 0) velocity.y *= -0.55
      if (rect.top > window.innerHeight - margin && velocity.y > 0)
        velocity.y *= -0.55

      moveCard(drag.id, point)
      if (Math.abs(velocity.x) + Math.abs(velocity.y) > 0.12) {
        animationRef.current[drag.id] = requestAnimationFrame(coast)
      }
    }
    animationRef.current[drag.id] = requestAnimationFrame(coast)
  }

  const activateCard = (id: number) => {
    if (suppressClickRef.current === id) {
      suppressClickRef.current = null
      return
    }

    if (flowStage === "pinning") {
      setPinnedCardIds((current) =>
        current.includes(id)
          ? current.filter((cardId) => cardId !== id)
          : [...current, id],
      )
      return
    }

    setFullScreenCardId(id)
  }

  const selectDirection = (direction: Direction) => {
    if (isFiltering) return
    const matchedIds = cards
      .filter(
        (card) =>
          card.category.toLowerCase() === "shoe" &&
          direction.models.includes(card.model),
      )
      .map((card) => card.id)
    if (matchedIds.length === 0) return

    setIsFiltering(true)
    setSelectedDirection(direction)
    setExitingCardIds(visibleCardIds.filter((id) => !matchedIds.includes(id)))
    filterTimerRef.current = window.setTimeout(() => {
      const nextPositions = { ...positionsRef.current }
      matchedIds.forEach((id) => {
        cancelAnimationFrame(animationRef.current[id])
        delete nextPositions[id]
      })
      positionsRef.current = nextPositions
      setPositions(nextPositions)
      setVisibleCardIds(matchedIds)
      setExitingCardIds([])
      setPinnedCardIds([])
      setFlowStage("pinning")
      setIsFiltering(false)
    }, 400)
  }

  const resetExperience = () => {
    if (reflectionTimerRef.current !== null)
      window.clearTimeout(reflectionTimerRef.current)
    if (filterTimerRef.current !== null)
      window.clearTimeout(filterTimerRef.current)
    Object.values(animationRef.current).forEach(cancelAnimationFrame)
    animationRef.current = {}
    positionsRef.current = {}
    setPositions({})
    setTopCard(0)
    setVisibleCardIds(shoeCardIds)
    setExitingCardIds([])
    setPinnedCardIds([])
    setFlowStage("invitation")
    setMemory("")
    setSelectedDirection(null)
    setIsFiltering(false)
    setIsStoryCollapsed(false)
    setFullScreenCardId(null)
  }

  const visibleCards = cards.filter((card) => visibleCardIds.includes(card.id))
  const pinnedCards = cards.filter((card) => pinnedCardIds.includes(card.id))
  const fullScreenCard = cards.find((card) => card.id === fullScreenCardId)
  const isFilteredLayout =
    flowStage === "pinning" || flowStage === "story" || isFiltering

  return (
    <main
      className={`gallery${isGalleryLoading ? " gallery-loading" : ""}`}
      aria-label="Interactive floating photo gallery"
      style={{ backgroundImage: `url(${woodTexture})` }}
    >
      <div className="fabric-rolls" aria-hidden="true">
        <img src={fabricRolls} alt="" draggable="false" />
      </div>
      <img
        className="pencil-tray"
        src={pencilTray}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      {visibleCards.map((card, index) => {
        const position = positions[card.id] ?? { x: 0, y: 0 }
        const entrance = entranceDirections[index % entranceDirections.length]
        const filteredLayout = filteredLayouts[index % filteredLayouts.length]
        const isPinned = pinnedCardIds.includes(card.id)
        const isExiting = exitingCardIds.includes(card.id)
        const cardLeft = isFilteredLayout ? filteredLayout.left : card.left
        const cardTop = isFilteredLayout ? filteredLayout.top : card.top
        const cardRotation = isFilteredLayout
          ? filteredLayout.rotation
          : card.rotation

        return (
          <article
            className={`card-anchor${isFilteredLayout ? " card-filtered" : ""}${
              isExiting ? " card-exiting" : ""
            }${isPinned ? " card-pinned" : ""}`}
            key={card.id}
            onPointerDown={(event) => beginDrag(event, card.id)}
            onPointerMove={dragCard}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={() => activateCard(card.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                activateCard(card.id)
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={flowStage === "pinning" ? isPinned : undefined}
            aria-label={
              flowStage === "pinning"
                ? `${isPinned ? "Unpin" : "Pin"} ${card.alt}`
                : `Open ${card.alt} full screen`
            }
            style={{
              left: `${cardLeft}%`,
              top: `${cardTop}%`,
              zIndex: isPinned ? 48 : topCard === card.id ? 50 : index + 2,
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${card.scale ?? 1})`,
            }}
          >
            {isPinned && <span className="artisan-pin" aria-hidden="true" />}
            <div
              className="card-entrance"
              style={
                {
                  "--entry-x": entrance.x,
                  "--entry-y": entrance.y,
                  "--entry-delay": `${400 + index * 400}ms`,
                } as React.CSSProperties
              }
            >
              <div
                className="wind"
                style={
                  {
                    "--rotation": `${cardRotation}deg`,
                    "--delay": `${card.delay}s`,
                    "--duration": `${card.duration}s`,
                  } as React.CSSProperties
                }
              >
                <PolaroidFrame
                  image={card.image}
                  alt={card.alt}
                  personalization={card.personalization}
                />
              </div>
            </div>
          </article>
        )
      })}
      <div className="sunlight-streaks" aria-hidden="true">
        <span className="sunlight-left" />
        <span className="sunlight-right" />
      </div>
      <div className="warm-color-burn" aria-hidden="true" />
      <img className="ambient-vignette" src={vignette} alt="" />
      <div className="light-particles" aria-hidden="true">
        {lightParticles.map((particle, index) => (
          <span
            key={index}
            style={
              {
                "--particle-left": `${particle.left}%`,
                "--particle-top": `${particle.top}%`,
                "--particle-size": `${particle.size}px`,
                "--particle-delay": `${particle.delay}s`,
                "--particle-duration": `${particle.duration}s`,
                "--particle-drift": `${particle.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <img
        className="golden-light-overlay"
        src={goldenLightOverlay}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <div className="corner-vignette" aria-hidden="true" />
      <div className="edge-blur" aria-hidden="true" />
      <div className="grain-filter" aria-hidden="true" />
      <AmbientPlayer />
      <CoCreationPanel
        stage={flowStage}
        memory={memory}
        direction={selectedDirection}
        pinnedCards={pinnedCards}
        isFiltering={isFiltering}
        isCollapsed={isStoryCollapsed}
        onBegin={() => setFlowStage("memory")}
        onMemorySubmit={(nextMemory) => {
          setMemory(nextMemory)
          setFlowStage("reflection")
        }}
        onDirectionSelect={selectDirection}
        onDone={() => setFlowStage("story")}
        onReset={resetExperience}
        onCollapse={() => setIsStoryCollapsed(true)}
        onReopen={() => setIsStoryCollapsed(false)}
      />
      {fullScreenCard && (
        <div
          className="fullscreen-view"
          role="dialog"
          aria-modal="true"
          aria-label={`${fullScreenCard.alt} full-screen view`}
          onPointerDown={() => setFullScreenCardId(null)}
        >
          <button
            className="fullscreen-close"
            type="button"
            onClick={() => setFullScreenCardId(null)}
            aria-label="Close full-screen view"
          >
            <img src={closeIcon} alt="" />
          </button>
          <div
            className="fullscreen-card"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <PolaroidFrame
              image={fullScreenCard.image}
              alt={fullScreenCard.alt}
              personalization={fullScreenCard.personalization}
            />
          </div>
        </div>
      )}
    </main>
  )
}
