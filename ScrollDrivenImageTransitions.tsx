// ScrollDrivenImageTransitions.tsx
// A premium scroll-driven content section for Framer.
// Text scrolls vertically on one side; the corresponding image
// cross-fades on the sticky opposite side as each block becomes active.

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ── Default content ──────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
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

// ── Text block sub-component ─────────────────────────────────────────────────

function TextBlock({
    title,
    description,
    isActive,
    blockHeight,
    isMobile,
    textColor,
    activeOpacity,
    inactiveOpacity,
    innerRef,
}: {
    title: string
    description: string
    isActive: boolean
    blockHeight: number
    isMobile: boolean
    textColor: string
    activeOpacity: number
    inactiveOpacity: number
    innerRef: (el: HTMLDivElement | null) => void
}) {
    return (
        <motion.div
            ref={innerRef}
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
            transition={{ duration: 0.5, ease: "easeOut" }}
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
                {title}
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
                {description}
            </p>
        </motion.div>
    )
}

// ── Image variants ───────────────────────────────────────────────────────────

function getImageVariants(duration: number) {
    return {
        enter: { opacity: 0, scale: 1.05 },
        center: {
            opacity: 1,
            scale: 1,
            transition: {
                opacity: { duration, ease: "easeInOut" },
                scale: { duration: duration * 1.2, ease: "easeOut" },
            },
        },
        exit: {
            opacity: 0,
            scale: 1.02,
            transition: {
                opacity: { duration: duration * 0.6, ease: "easeIn" },
                scale: { duration: duration * 0.8, ease: "easeIn" },
            },
        },
    }
}

// ── Main component ───────────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function ScrollDrivenImageTransitions(props: any) {
    const {
        items = DEFAULT_ITEMS,
        imagePosition = "right",
        backgroundColor = "#000000",
        textColor = "#ffffff",
        activeOpacity = 1,
        inactiveOpacity = 0.35,
        transitionDuration = 0.6,
        stickyTopOffset = 0,
        blockHeight = 85,
        style,
    } = props

    const [activeIndex, setActiveIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const blockRefs = useRef<(HTMLDivElement | null)[]>([])

    // Responsive breakpoint
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    // Intersection Observer — fires when a block crosses 50% visibility
    useEffect(() => {
        const refs = blockRefs.current
        if (!refs.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the entry that is most visible
                let bestIndex = -1
                let bestRatio = 0
                entries.forEach((entry) => {
                    if (
                        entry.isIntersecting &&
                        entry.intersectionRatio > bestRatio
                    ) {
                        const idx = refs.indexOf(
                            entry.target as HTMLDivElement
                        )
                        if (idx !== -1) {
                            bestIndex = idx
                            bestRatio = entry.intersectionRatio
                        }
                    }
                })
                if (bestIndex !== -1) {
                    setActiveIndex(bestIndex)
                }
            },
            { threshold: [0.3, 0.5, 0.7] }
        )

        refs.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [items.length])

    // Ref callback for each text block
    const setBlockRef = useCallback(
        (index: number) => (el: HTMLDivElement | null) => {
            blockRefs.current[index] = el
        },
        []
    )

    const imageVariants = getImageVariants(transitionDuration)
    const currentItem = items[activeIndex] || items[0]

    // ── Image panel ──────────────────────────────────────────────────────────

    const imagePanel = (
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
                flex: 1,
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
                    {currentItem?.image && (
                        <img
                            src={currentItem.image}
                            alt={currentItem.title || ""}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )

    // ── Text column ──────────────────────────────────────────────────────────

    const textColumn = (
        <div style={{ flex: 1, position: "relative" }}>
            {items.map((item: any, i: number) => (
                <TextBlock
                    key={i}
                    title={item.title}
                    description={item.description}
                    isActive={i === activeIndex}
                    blockHeight={blockHeight}
                    isMobile={isMobile}
                    textColor={textColor}
                    activeOpacity={activeOpacity}
                    inactiveOpacity={inactiveOpacity}
                    innerRef={setBlockRef(i)}
                />
            ))}
        </div>
    )

    // ── Layout ───────────────────────────────────────────────────────────────

    return (
        <div
            style={{
                position: "relative",
                backgroundColor,
                width: "100%",
                ...style,
            }}
        >
            {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {imagePanel}
                    {textColumn}
                </div>
            ) : (
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
                    {imagePanel}
                </div>
            )}
        </div>
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
        defaultValue: DEFAULT_ITEMS,
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
