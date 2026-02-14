import { addPropertyControls, ControlType } from "framer"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import React, { useRef, useEffect, useState, useCallback, CSSProperties } from "react"

// ─────────────────────────────────────────────────────────────
// Cinematic Logo Animation
//
// A premium light-sweep effect that simulates a liquid beam of
// light passing over a logo image or text children.
//
// Layers:
//   1. Soft-core beam  – wide multi-stop gradient
//   2. Glow diffusion  – blurred overlay with blend mode
//   3. Refraction zone – backdrop-filter brightness/contrast
//
// All animation is transform-based (GPU-accelerated, no reflow).
// ─────────────────────────────────────────────────────────────

type Direction = "leftToRight" | "rightToLeft"
type TriggerMode = "auto" | "hover" | "once"

interface Props {
    // Content
    image?: string
    children?: React.ReactNode

    // Animation
    speed: number          // seconds per sweep
    beamWidth: number      // % of container width
    intensity: number      // 0–1 peak opacity
    direction: Direction
    glowAmount: number     // px blur on glow layer
    blurStrength: number   // px blur on core beam edge
    loop: boolean
    triggerMode: TriggerMode
    delayBetweenLoops: number // seconds

    // Advanced polish
    brightnessBoost: number   // e.g. 1.15
    contrastBoost: number     // e.g. 1.08
    colorShift: boolean       // cool-white tint on pass

    // Layout (Framer)
    width: number
    height: number
    style?: CSSProperties
}

const defaultProps: Partial<Props> = {
    speed: 3.5,
    beamWidth: 35,
    intensity: 0.55,
    direction: "leftToRight",
    glowAmount: 30,
    blurStrength: 12,
    loop: true,
    triggerMode: "auto",
    delayBetweenLoops: 1.5,
    brightnessBoost: 1.12,
    contrastBoost: 1.06,
    colorShift: true,
    width: 300,
    height: 120,
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function CinematicLogoAnimation(rawProps: Props) {
    const props = { ...defaultProps, ...rawProps } as Required<Props>
    const {
        image,
        children,
        speed,
        beamWidth,
        intensity,
        direction,
        glowAmount,
        blurStrength,
        loop,
        triggerMode,
        delayBetweenLoops,
        brightnessBoost,
        contrastBoost,
        colorShift,
        width,
        height,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const beamControls = useAnimation()
    const [isHovered, setIsHovered] = useState(false)
    const [hasPlayed, setHasPlayed] = useState(false)

    // Direction multipliers
    const startX = direction === "leftToRight" ? "-120%" : "120%"
    const endX = direction === "leftToRight" ? "120%" : "-120%"

    // ── Animate ────────────────────────────────────────────
    const runSweep = useCallback(async () => {
        if (triggerMode === "once" && hasPlayed) return

        // Reset to start without visible transition
        await beamControls.set({ x: startX, scaleX: 1 })

        // Animate across
        await beamControls.start({
            x: endX,
            scaleX: [1, 1.05, 1],
            transition: {
                x: {
                    duration: speed,
                    ease: [0.4, 0, 0.2, 1],
                },
                scaleX: {
                    duration: speed,
                    ease: "easeInOut",
                },
            },
        })

        setHasPlayed(true)

        // Loop after delay
        if (loop && triggerMode === "auto") {
            await new Promise((r) => setTimeout(r, delayBetweenLoops * 1000))
            runSweep()
        }
    }, [
        beamControls,
        startX,
        endX,
        speed,
        loop,
        triggerMode,
        delayBetweenLoops,
        hasPlayed,
    ])

    // Auto-start
    useEffect(() => {
        if (triggerMode === "auto" || triggerMode === "once") {
            runSweep()
        }
    }, [triggerMode]) // intentionally limited deps to avoid re-triggering

    // Hover trigger
    useEffect(() => {
        if (triggerMode === "hover" && isHovered) {
            runSweep()
        }
    }, [isHovered, triggerMode])

    // ── Gradient strings ───────────────────────────────────
    const peakAlpha = intensity
    const midAlpha = peakAlpha * 0.42
    const tint = colorShift
        ? "220, 230, 255" // cool-white
        : "255, 255, 255"

    const coreGradient = `linear-gradient(
        90deg,
        transparent 0%,
        rgba(${tint}, ${midAlpha * 0.3}) 15%,
        rgba(${tint}, ${midAlpha}) 30%,
        rgba(${tint}, ${peakAlpha}) 50%,
        rgba(${tint}, ${midAlpha}) 70%,
        rgba(${tint}, ${midAlpha * 0.3}) 85%,
        transparent 100%
    )`

    const glowGradient = `linear-gradient(
        90deg,
        transparent 0%,
        rgba(${tint}, ${midAlpha * 0.5}) 25%,
        rgba(${tint}, ${peakAlpha * 0.7}) 50%,
        rgba(${tint}, ${midAlpha * 0.5}) 75%,
        transparent 100%
    )`

    // ── Styles ─────────────────────────────────────────────
    const containerStyle: CSSProperties = {
        position: "relative",
        width,
        height,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
    }

    const contentStyle: CSSProperties = {
        position: "relative",
        zIndex: 1,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }

    const imageStyle: CSSProperties = {
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain" as const,
        display: "block",
    }

    // Shared beam positioning
    const beamBase: CSSProperties = {
        position: "absolute",
        top: "-20%",
        left: 0,
        width: `${beamWidth}%`,
        height: "140%",
        pointerEvents: "none",
        willChange: "transform",
    }

    // Layer 1: soft core beam
    const coreStyle: CSSProperties = {
        ...beamBase,
        background: coreGradient,
        mixBlendMode: "soft-light",
        filter: `blur(${blurStrength}px)`,
        zIndex: 2,
    }

    // Layer 2: glow diffusion
    const glowStyle: CSSProperties = {
        ...beamBase,
        background: glowGradient,
        mixBlendMode: "overlay",
        filter: `blur(${glowAmount}px)`,
        opacity: 0.7,
        zIndex: 3,
    }

    // Layer 3: refraction zone (backdrop-filter)
    const refractionStyle: CSSProperties = {
        ...beamBase,
        width: `${beamWidth * 0.7}%`,
        backdropFilter: `brightness(${brightnessBoost}) contrast(${contrastBoost})`,
        WebkitBackdropFilter: `brightness(${brightnessBoost}) contrast(${contrastBoost})`,
        maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 80%)",
        WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 80%)",
        zIndex: 4,
    }

    // ── Render ─────────────────────────────────────────────
    return (
        <div
            ref={containerRef}
            style={containerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo content */}
            <div style={contentStyle}>
                {image ? (
                    <img src={image} alt="" style={imageStyle} />
                ) : (
                    children
                )}
            </div>

            {/* Layer 1 – Soft Core Beam */}
            <motion.div
                animate={beamControls}
                initial={{ x: startX }}
                style={coreStyle}
            />

            {/* Layer 2 – Glow Diffusion */}
            <motion.div
                animate={beamControls}
                initial={{ x: startX }}
                style={glowStyle}
            />

            {/* Layer 3 – Refraction */}
            <motion.div
                animate={beamControls}
                initial={{ x: startX }}
                style={refractionStyle}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Framer Property Controls
// ─────────────────────────────────────────────────────────────

addPropertyControls(CinematicLogoAnimation, {
    image: {
        type: ControlType.Image,
        title: "Logo Image",
    },
    children: {
        type: ControlType.ComponentInstance,
        title: "Content",
    },
    speed: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 3.5,
        min: 1,
        max: 10,
        step: 0.1,
        unit: "s",
        description: "Duration of one sweep",
    },
    beamWidth: {
        type: ControlType.Number,
        title: "Beam Width",
        defaultValue: 35,
        min: 10,
        max: 80,
        step: 1,
        unit: "%",
        description: "Width of the light beam",
    },
    intensity: {
        type: ControlType.Number,
        title: "Intensity",
        defaultValue: 0.55,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: "Peak brightness of the beam",
    },
    direction: {
        type: ControlType.Enum,
        title: "Direction",
        defaultValue: "leftToRight",
        options: ["leftToRight", "rightToLeft"],
        optionTitles: ["Left → Right", "Right → Left"],
    },
    glowAmount: {
        type: ControlType.Number,
        title: "Glow Amount",
        defaultValue: 30,
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
        description: "Blur radius on glow layer",
    },
    blurStrength: {
        type: ControlType.Number,
        title: "Blur Strength",
        defaultValue: 12,
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        description: "Edge softness of core beam",
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop",
        defaultValue: true,
        description: "Repeat animation continuously",
    },
    triggerMode: {
        type: ControlType.Enum,
        title: "Trigger",
        defaultValue: "auto",
        options: ["auto", "hover", "once"],
        optionTitles: ["Auto Play", "On Hover", "Play Once"],
    },
    delayBetweenLoops: {
        type: ControlType.Number,
        title: "Loop Delay",
        defaultValue: 1.5,
        min: 0,
        max: 10,
        step: 0.1,
        unit: "s",
        description: "Pause between sweeps",
    },
    brightnessBoost: {
        type: ControlType.Number,
        title: "Brightness",
        defaultValue: 1.12,
        min: 1,
        max: 1.5,
        step: 0.01,
        description: "Brightness increase on beam pass",
    },
    contrastBoost: {
        type: ControlType.Number,
        title: "Contrast",
        defaultValue: 1.06,
        min: 1,
        max: 1.3,
        step: 0.01,
        description: "Contrast increase on beam pass",
    },
    colorShift: {
        type: ControlType.Boolean,
        title: "Cool Tint",
        defaultValue: true,
        description: "Subtle cool-white color shift",
    },
})
