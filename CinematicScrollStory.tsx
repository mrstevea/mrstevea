import * as React from "react"
import {
    addPropertyControls,
    ControlType,
    useMotionValue,
} from "framer"
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    AnimatePresence,
    useMotionValueEvent,
} from "framer-motion"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContentItem {
    title: string
    description: string
    image: string
    accentColor?: string
}

interface CinematicScrollStoryProps {
    // Content
    items: ContentItem[]

    // Layout
    imagePosition: "left" | "right"
    stickyTopOffset: number
    backgroundColor: string
    textColor: string

    // Motion
    transitionDuration: number
    parallaxIntensity: number
    blurIntensity: number
    scaleAmount: number
    perspectiveDepth: number

    // Atmosphere
    enableVignette: boolean
    enableGlow: boolean
    enableGrain: boolean
    enableParallax: boolean
}

// ─── Spring Config ───────────────────────────────────────────────────────────

const SPRING_CONFIG = { stiffness: 100, damping: 30, mass: 0.5 }
const SPRING_SOFT = { stiffness: 60, damping: 20, mass: 0.8 }

// ─── Debounced Index Hook ────────────────────────────────────────────────────

function useDebouncedIndex(
    scrollYProgress: any,
    itemCount: number,
    threshold = 0.02
): number {
    const [activeIndex, setActiveIndex] = React.useState(0)
    const lastRaw = React.useRef(0)

    useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
        const raw = Math.round(latest * (itemCount - 1))
        const clamped = Math.max(0, Math.min(itemCount - 1, raw))
        const diff = Math.abs(latest - lastRaw.current)

        if (clamped !== activeIndex && diff > threshold) {
            lastRaw.current = latest
            setActiveIndex(clamped)
        }
    })

    return activeIndex
}

// ─── Parallax Layer ──────────────────────────────────────────────────────────

function ParallaxLayer({
    scrollYProgress,
    segmentStart,
    segmentEnd,
    image,
    layer,
    parallaxIntensity,
    blurIntensity,
    scaleAmount,
    isActive,
    perspectiveDepth,
}: {
    scrollYProgress: any
    segmentStart: number
    segmentEnd: number
    image: string
    layer: "background" | "main" | "foreground"
    parallaxIntensity: number
    blurIntensity: number
    scaleAmount: number
    isActive: boolean
    perspectiveDepth: number
}) {
    const intensity = parallaxIntensity / 100

    // Background parallax
    const bgY = useTransform(
        scrollYProgress,
        [segmentStart, segmentEnd],
        [50 * intensity, -50 * intensity]
    )
    const bgYSpring = useSpring(bgY, SPRING_SOFT)

    // Main layer scale
    const mainScale = useTransform(
        scrollYProgress,
        [segmentStart, (segmentStart + segmentEnd) / 2, segmentEnd],
        [1, 1 + scaleAmount * 0.01, 1]
    )
    const mainScaleSpring = useSpring(mainScale, SPRING_CONFIG)

    // Main layer subtle rotation
    const mainRotateY = useTransform(
        scrollYProgress,
        [segmentStart, segmentEnd],
        [-1.5 * intensity, 1.5 * intensity]
    )
    const mainRotateYSpring = useSpring(mainRotateY, SPRING_SOFT)

    // Foreground parallax (faster)
    const fgY = useTransform(
        scrollYProgress,
        [segmentStart, segmentEnd],
        [30 * intensity, -70 * intensity]
    )
    const fgYSpring = useSpring(fgY, SPRING_SOFT)

    const blurActive = isActive ? 0 : blurIntensity * 0.4

    if (layer === "background") {
        return (
            <motion.div
                style={{
                    position: "absolute",
                    inset: "-20px",
                    y: bgYSpring,
                    filter: `blur(${isActive ? blurIntensity * 0.5 : blurIntensity}px)`,
                    transition: "filter 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "transform, filter",
                }}
            >
                <img
                    src={image}
                    alt=""
                    loading="lazy"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.4,
                    }}
                />
            </motion.div>
        )
    }

    if (layer === "main") {
        return (
            <motion.div
                style={{
                    position: "absolute",
                    inset: 0,
                    scale: mainScaleSpring,
                    rotateY: mainRotateYSpring,
                    filter: `blur(${blurActive}px)`,
                    transition: "filter 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "transform, filter",
                    perspective: perspectiveDepth,
                }}
            >
                <img
                    src={image}
                    alt=""
                    loading="lazy"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                    }}
                />
            </motion.div>
        )
    }

    // Foreground
    return (
        <motion.div
            style={{
                position: "absolute",
                inset: 0,
                y: fgYSpring,
                willChange: "transform",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.3) 100%)",
                    borderRadius: "12px",
                }}
            />
        </motion.div>
    )
}

// ─── Image Group (with AnimatePresence) ──────────────────────────────────────

function ImageGroup({
    scrollYProgress,
    item,
    index,
    totalItems,
    isActive,
    parallaxIntensity,
    blurIntensity,
    scaleAmount,
    perspectiveDepth,
    transitionDuration,
    accentColor,
    enableGlow,
}: {
    scrollYProgress: any
    item: ContentItem
    index: number
    totalItems: number
    isActive: boolean
    parallaxIntensity: number
    blurIntensity: number
    scaleAmount: number
    perspectiveDepth: number
    transitionDuration: number
    accentColor: string
    enableGlow: boolean
}) {
    const segmentSize = 1 / Math.max(totalItems - 1, 1)
    const segmentStart = Math.max(0, index * segmentSize - segmentSize * 0.5)
    const segmentEnd = Math.min(1, index * segmentSize + segmentSize * 0.5)

    const image = item.image

    return (
        <motion.div
            key={`img-group-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: transitionDuration,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                position: "absolute",
                inset: 0,
                willChange: "transform, opacity",
            }}
        >
            {/* Background layer */}
            <ParallaxLayer
                scrollYProgress={scrollYProgress}
                segmentStart={segmentStart}
                segmentEnd={segmentEnd}
                image={image}
                layer="background"
                parallaxIntensity={parallaxIntensity}
                blurIntensity={blurIntensity}
                scaleAmount={scaleAmount}
                isActive={isActive}
                perspectiveDepth={perspectiveDepth}
            />

            {/* Main layer */}
            <ParallaxLayer
                scrollYProgress={scrollYProgress}
                segmentStart={segmentStart}
                segmentEnd={segmentEnd}
                image={image}
                layer="main"
                parallaxIntensity={parallaxIntensity}
                blurIntensity={blurIntensity}
                scaleAmount={scaleAmount}
                isActive={isActive}
                perspectiveDepth={perspectiveDepth}
            />

            {/* Foreground layer */}
            <ParallaxLayer
                scrollYProgress={scrollYProgress}
                segmentStart={segmentStart}
                segmentEnd={segmentEnd}
                image={image}
                layer="foreground"
                parallaxIntensity={parallaxIntensity}
                blurIntensity={blurIntensity}
                scaleAmount={scaleAmount}
                isActive={isActive}
                perspectiveDepth={perspectiveDepth}
            />

            {/* Accent glow */}
            {enableGlow && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "80%",
                        height: "120px",
                        background: `radial-gradient(ellipse, ${accentColor}33 0%, transparent 70%)`,
                        filter: "blur(30px)",
                        opacity: isActive ? 0.8 : 0,
                        transition:
                            "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                        pointerEvents: "none",
                    }}
                />
            )}
        </motion.div>
    )
}

// ─── Text Block ──────────────────────────────────────────────────────────────

function TextBlock({
    item,
    isActive,
    textColor,
    accentColor,
}: {
    item: ContentItem
    isActive: boolean
    textColor: string
    accentColor: string
}) {
    return (
        <motion.div
            animate={{
                opacity: isActive ? 1 : 0.35,
                y: isActive ? 0 : 30,
                scale: isActive ? 1 : 0.98,
            }}
            transition={{
                ...SPRING_CONFIG,
                opacity: { duration: 0.5 },
            }}
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "40px 0",
                willChange: "transform, opacity",
            }}
        >
            <motion.h2
                animate={{
                    letterSpacing: isActive ? "-0.02em" : "0em",
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    fontSize: "clamp(28px, 4vw, 56px)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    margin: "0 0 24px 0",
                    color: textColor,
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                }}
            >
                {item.title}
            </motion.h2>

            {/* Accent line */}
            <motion.div
                animate={{
                    width: isActive ? "60px" : "0px",
                    opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    height: "3px",
                    background: accentColor,
                    borderRadius: "2px",
                    marginBottom: "24px",
                }}
            />

            <motion.p
                animate={{
                    opacity: isActive ? 0.85 : 0.3,
                }}
                transition={{ duration: 0.5 }}
                style={{
                    fontSize: "clamp(16px, 1.5vw, 20px)",
                    lineHeight: 1.7,
                    margin: 0,
                    color: textColor,
                    maxWidth: "480px",
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                    fontWeight: 400,
                }}
            >
                {item.description}
            </motion.p>
        </motion.div>
    )
}

// ─── Atmosphere Overlays ─────────────────────────────────────────────────────

function AtmosphereOverlays({
    enableVignette,
    enableGrain,
}: {
    enableVignette: boolean
    enableGrain: boolean
}) {
    return (
        <>
            {/* Vignette */}
            {enableVignette && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
                        pointerEvents: "none",
                        borderRadius: "12px",
                    }}
                />
            )}

            {/* Grain */}
            {enableGrain && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.04,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "128px 128px",
                        pointerEvents: "none",
                        borderRadius: "12px",
                        mixBlendMode: "overlay",
                    }}
                />
            )}

            {/* Top/Bottom fade masks */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "80px",
                    background:
                        "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)",
                    pointerEvents: "none",
                    borderRadius: "12px 12px 0 0",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "80px",
                    background:
                        "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)",
                    pointerEvents: "none",
                    borderRadius: "0 0 12px 12px",
                }}
            />
        </>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const DEFAULT_ITEMS: ContentItem[] = [
    {
        title: "Designed for Clarity",
        description:
            "Every pixel is placed with intention. A visual language that communicates instantly and stays out of your way.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        accentColor: "#6366f1",
    },
    {
        title: "Built for Speed",
        description:
            "Performance isn't an afterthought — it's the foundation. Sub-second responses, zero lag, pure momentum.",
        image: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80",
        accentColor: "#8b5cf6",
    },
    {
        title: "Crafted with Care",
        description:
            "Details matter. From micro-interactions to layout shifts, every transition is tuned by hand.",
        image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
        accentColor: "#ec4899",
    },
    {
        title: "Ready to Scale",
        description:
            "From prototype to production. One component system that grows with your ambition.",
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
        accentColor: "#06b6d4",
    },
]

export default function CinematicScrollStory(props: CinematicScrollStoryProps) {
    const {
        items = DEFAULT_ITEMS,
        imagePosition = "right",
        stickyTopOffset = 0,
        backgroundColor = "#000000",
        textColor = "#ffffff",
        transitionDuration = 0.8,
        parallaxIntensity = 80,
        blurIntensity = 6,
        scaleAmount = 5,
        perspectiveDepth = 1200,
        enableVignette = true,
        enableGlow = true,
        enableGrain = true,
        enableParallax = true,
    } = props

    const sectionRef = React.useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    })

    const effectiveParallax = enableParallax ? parallaxIntensity : 0
    const activeIndex = useDebouncedIndex(scrollYProgress, items.length)

    // Mobile detection
    const [isMobile, setIsMobile] = React.useState(false)
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    const textColumn = (
        <div
            style={{
                flex: isMobile ? "none" : "0 0 45%",
                padding: isMobile ? "0 24px" : "0 60px",
                position: "relative",
                zIndex: 2,
            }}
        >
            {items.map((item, i) => (
                <TextBlock
                    key={i}
                    item={item}
                    isActive={activeIndex === i}
                    textColor={textColor}
                    accentColor={item.accentColor || "#6366f1"}
                />
            ))}
        </div>
    )

    const imageColumn = (
        <div
            style={{
                flex: isMobile ? "none" : "0 0 55%",
                position: isMobile ? "relative" : "relative",
                height: isMobile ? "60vh" : "auto",
            }}
        >
            <div
                style={{
                    position: isMobile ? "relative" : "sticky",
                    top: isMobile ? 0 : `${stickyTopOffset}px`,
                    height: isMobile ? "60vh" : "100vh",
                    overflow: "hidden",
                    perspective: `${perspectiveDepth}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: isMobile ? "20px" : "40px",
                }}
            >
                {/* Image container */}
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: isMobile ? "100%" : "75%",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    <AnimatePresence mode="wait">
                        <ImageGroup
                            key={activeIndex}
                            scrollYProgress={scrollYProgress}
                            item={items[activeIndex]}
                            index={activeIndex}
                            totalItems={items.length}
                            isActive={true}
                            parallaxIntensity={effectiveParallax}
                            blurIntensity={blurIntensity}
                            scaleAmount={scaleAmount}
                            perspectiveDepth={perspectiveDepth}
                            transitionDuration={transitionDuration}
                            accentColor={
                                items[activeIndex]?.accentColor || "#6366f1"
                            }
                            enableGlow={enableGlow}
                        />
                    </AnimatePresence>

                    {/* Atmosphere overlays */}
                    <AtmosphereOverlays
                        enableVignette={enableVignette}
                        enableGrain={enableGrain}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <section
            ref={sectionRef}
            style={{
                position: "relative",
                width: "100%",
                backgroundColor,
                overflow: "hidden",
            }}
        >
            {isMobile ? (
                <div>
                    {imageColumn}
                    {textColumn}
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            imagePosition === "left" ? "row-reverse" : "row",
                        position: "relative",
                    }}
                >
                    {textColumn}
                    {imageColumn}
                </div>
            )}
        </section>
    )
}

// ─── Framer Property Controls ────────────────────────────────────────────────

addPropertyControls(CinematicScrollStory, {
    items: {
        type: ControlType.Array,
        title: "Content",
        maxCount: 10,
        defaultValue: [
            {
                title: "Designed for Clarity",
                description:
                    "Every pixel is placed with intention. A visual language that communicates instantly.",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
                accentColor: "#6366f1",
            },
            {
                title: "Built for Speed",
                description:
                    "Performance isn't an afterthought — it's the foundation.",
                image: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80",
                accentColor: "#8b5cf6",
            },
            {
                title: "Crafted with Care",
                description:
                    "Details matter. Every transition is tuned by hand.",
                image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
                accentColor: "#ec4899",
            },
            {
                title: "Ready to Scale",
                description:
                    "From prototype to production. One system that grows with your ambition.",
                image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
                accentColor: "#06b6d4",
            },
        ],
        control: {
            type: ControlType.Object,
            controls: {
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Section Title",
                },
                description: {
                    type: ControlType.String,
                    title: "Description",
                    defaultValue: "Section description text goes here.",
                },
                image: {
                    type: ControlType.Image,
                    title: "Image",
                },
                accentColor: {
                    type: ControlType.Color,
                    title: "Accent Color",
                    defaultValue: "#6366f1",
                },
            },
        },
    },

    // Layout Controls
    imagePosition: {
        type: ControlType.Enum,
        title: "Image Position",
        options: ["left", "right"],
        optionTitles: ["Left", "Right"],
        defaultValue: "right",
    },
    stickyTopOffset: {
        type: ControlType.Number,
        title: "Sticky Top Offset",
        defaultValue: 0,
        min: 0,
        max: 200,
        step: 1,
        unit: "px",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#000000",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#ffffff",
    },

    // Motion Controls
    transitionDuration: {
        type: ControlType.Number,
        title: "Transition Duration",
        defaultValue: 0.8,
        min: 0.3,
        max: 2,
        step: 0.1,
        unit: "s",
    },
    parallaxIntensity: {
        type: ControlType.Number,
        title: "Parallax Intensity",
        defaultValue: 80,
        min: 0,
        max: 200,
        step: 5,
        unit: "%",
    },
    blurIntensity: {
        type: ControlType.Number,
        title: "Blur Intensity",
        defaultValue: 6,
        min: 0,
        max: 20,
        step: 1,
        unit: "px",
    },
    scaleAmount: {
        type: ControlType.Number,
        title: "Scale Amount",
        defaultValue: 5,
        min: 0,
        max: 15,
        step: 1,
        unit: "%",
    },
    perspectiveDepth: {
        type: ControlType.Number,
        title: "Perspective Depth",
        defaultValue: 1200,
        min: 400,
        max: 3000,
        step: 100,
        unit: "px",
    },

    // Atmosphere Toggles
    enableVignette: {
        type: ControlType.Boolean,
        title: "Vignette",
        defaultValue: true,
    },
    enableGlow: {
        type: ControlType.Boolean,
        title: "Glow",
        defaultValue: true,
    },
    enableGrain: {
        type: ControlType.Boolean,
        title: "Grain",
        defaultValue: true,
    },
    enableParallax: {
        type: ControlType.Boolean,
        title: "Parallax",
        defaultValue: true,
    },
})
