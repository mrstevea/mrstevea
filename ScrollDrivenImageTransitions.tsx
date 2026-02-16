// ScrollDrivenImageTransitions.tsx
// A premium scroll-driven content section for Framer.
// Text scrolls vertically on one side; the corresponding image
// cross-fades on the sticky opposite side as each block becomes active.

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react"
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useMotionValueEvent,
} from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ── Types ────────────────────────────────────────────────────────────────────

interface ContentItem {
    title: string
    description: string
    image: string
}

interface Props {
    items: ContentItem[]
    imagePosition: "right" | "left"
    backgroundColor: string
    textColor: string
    activeOpacity: number
    inactiveOpacity: number
    transitionDuration: number
    stickyTopOffset: number
    blockHeight: number // vh units per text block
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultItems: ContentItem[] = [
    {
        title: "Designed for clarity",
        description:
            "Every element serves a purpose. We stripped away the noise so you can focus on what matters most.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    },
    {
        title: "Built for speed",
        description:
            "Performance isn't an afterthought — it's the foundation. Instant feedback, zero lag, always responsive.",
        image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    },
    {
        title: "Crafted with care",
        description:
            "From micro-interactions to typography, every detail has been considered and refined.",
        image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&q=80",
    },
]

// ── Component ────────────────────────────────────────────────────────────────

const ScrollDrivenImageTransitions: React.FC<Props> = ({
    items = defaultItems,
    imagePosition = "right",
    backgroundColor = "#000000",
    textColor = "#ffffff",
    activeOpacity = 1,
    inactiveOpacity = 0.35,
    transitionDuration = 0.6,
    stickyTopOffset = 0,
    blockHeight = 85,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    // Responsive breakpoint detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    // ── Scroll tracking ──────────────────────────────────────────────────────

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    // Derive active index from scroll progress
    const segmentSize = useMemo(
        () => (items.length > 0 ? 1 / items.length : 1),
        [items.length]
    )

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // Clamp to valid range
        const clamped = Math.min(Math.max(latest, 0), 0.999)
        const newIndex = Math.min(
            Math.floor(clamped / segmentSize),
            items.length - 1
        )
        setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev))
    })

    // ── Image transition variants ────────────────────────────────────────────

    const imageVariants = useMemo(
        () => ({
            enter: {
                opacity: 0,
                scale: 1.05,
            },
            center: {
                opacity: 1,
                scale: 1,
                transition: {
                    opacity: { duration: transitionDuration, ease: "easeInOut" },
                    scale: {
                        duration: transitionDuration * 1.2,
                        ease: "easeOut",
                    },
                },
            },
            exit: {
                opacity: 0,
                scale: 1.02,
                transition: {
                    opacity: {
                        duration: transitionDuration * 0.6,
                        ease: "easeIn",
                    },
                    scale: {
                        duration: transitionDuration * 0.8,
                        ease: "easeIn",
                    },
                },
            },
        }),
        [transitionDuration]
    )

    // ── Text block ───────────────────────────────────────────────────────────

    const TextBlock = useCallback(
        ({ item, index }: { item: ContentItem; index: number }) => {
            const isActive = index === activeIndex
            return (
                <motion.div
                    style={{
                        minHeight: `${blockHeight}vh`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: isMobile ? "40px 20px" : "60px 40px",
                        willChange: "opacity, transform",
                    }}
                    animate={{
                        opacity: isActive ? activeOpacity : inactiveOpacity,
                        y: isActive ? 0 : 12,
                        scale: isActive ? 1 : 0.98,
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut",
                    }}
                >
                    <h2
                        style={{
                            fontSize: isMobile ? "28px" : "42px",
                            fontWeight: 600,
                            lineHeight: 1.15,
                            margin: "0 0 20px 0",
                            color: textColor,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {item.title}
                    </h2>
                    <p
                        style={{
                            fontSize: isMobile ? "16px" : "18px",
                            lineHeight: 1.65,
                            margin: 0,
                            color: textColor,
                            opacity: 0.75,
                            maxWidth: "480px",
                        }}
                    >
                        {item.description}
                    </p>
                </motion.div>
            )
        },
        [
            activeIndex,
            activeOpacity,
            inactiveOpacity,
            blockHeight,
            isMobile,
            textColor,
        ]
    )

    // ── Sticky image panel ───────────────────────────────────────────────────

    const ImagePanel = () => (
        <div
            style={{
                position: isMobile ? "relative" : "sticky",
                top: isMobile ? undefined : stickyTopOffset,
                height: isMobile ? "50vh" : "100vh",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{
                        position: "absolute",
                        inset: isMobile ? "20px" : "40px",
                        borderRadius: "16px",
                        overflow: "hidden",
                        willChange: "opacity, transform",
                    }}
                >
                    <img
                        src={items[activeIndex]?.image}
                        alt={items[activeIndex]?.title || ""}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    )

    // ── Scroll progress indicator (thin line at top) ─────────────────────────

    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

    // ── Render ───────────────────────────────────────────────────────────────

    const textColumn = (
        <div
            style={{
                flex: 1,
                position: "relative",
                zIndex: 1,
            }}
        >
            {items.map((item, i) => (
                <TextBlock key={i} item={item} index={i} />
            ))}
        </div>
    )

    const imageColumn = (
        <div
            style={{
                flex: 1,
                position: "relative",
                zIndex: 0,
            }}
        >
            <ImagePanel />
        </div>
    )

    return (
        <section
            ref={containerRef}
            style={{
                position: "relative",
                backgroundColor,
                overflow: "hidden",
                width: "100%",
            }}
        >
            {/* Progress bar */}
            <motion.div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: textColor,
                    transformOrigin: "0%",
                    scaleX,
                    zIndex: 100,
                    opacity: 0.4,
                }}
            />

            {isMobile ? (
                // Mobile: image on top, text below
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {imageColumn}
                    {textColumn}
                </div>
            ) : (
                // Desktop: two-column layout
                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            imagePosition === "left" ? "row-reverse" : "row",
                        alignItems: "flex-start",
                        maxWidth: "1400px",
                        margin: "0 auto",
                    }}
                >
                    {textColumn}
                    {imageColumn}
                </div>
            )}
        </section>
    )
}

// ── Framer Property Controls ─────────────────────────────────────────────────

addPropertyControls(ScrollDrivenImageTransitions, {
    items: {
        type: ControlType.Array,
        title: "Content Items",
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
                    defaultValue: "Describe this section here.",
                },
                image: {
                    type: ControlType.Image,
                    title: "Image",
                },
            },
        },
        defaultValue: defaultItems,
    },
    imagePosition: {
        type: ControlType.Enum,
        title: "Image Position",
        options: ["right", "left"],
        optionTitles: ["Right", "Left"],
        defaultValue: "right",
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
    activeOpacity: {
        type: ControlType.Number,
        title: "Active Opacity",
        min: 0.5,
        max: 1,
        step: 0.05,
        defaultValue: 1,
    },
    inactiveOpacity: {
        type: ControlType.Number,
        title: "Inactive Opacity",
        min: 0.1,
        max: 0.8,
        step: 0.05,
        defaultValue: 0.35,
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Transition (s)",
        min: 0.2,
        max: 1.5,
        step: 0.1,
        defaultValue: 0.6,
    },
    stickyTopOffset: {
        type: ControlType.Number,
        title: "Sticky Offset (px)",
        min: 0,
        max: 200,
        step: 10,
        defaultValue: 0,
    },
    blockHeight: {
        type: ControlType.Number,
        title: "Block Height (vh)",
        min: 50,
        max: 120,
        step: 5,
        defaultValue: 85,
    },
})

export default ScrollDrivenImageTransitions
