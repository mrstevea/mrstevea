import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import React, { CSSProperties } from "react"

// ─────────────────────────────────────────────────────────────
// Cinematic Logo Animation
//
// Upload an SVG/PNG logo → a soft light beam sweeps across the
// logo shape (not the bounding box) from left to right, then
// loops seamlessly with a pause between each pass.
//
// The beam is CSS-masked to the logo's alpha channel so it only
// appears on the actual letterforms / icon, not empty space.
//
// GPU-accelerated (transform-only), no layout reflow.
// ─────────────────────────────────────────────────────────────

interface Props {
    image: string
    speed: number
    delay: number
    intensity: number
    width: number
    height: number
    style?: CSSProperties
}

export default function CinematicLogoAnimation(props: Props) {
    const {
        image,
        speed = 3,
        delay = 2,
        intensity = 0.45,
        width = 300,
        height = 120,
        style,
    } = props

    if (!image) {
        return (
            <div
                style={{
                    width,
                    height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 14,
                    fontFamily: "sans-serif",
                    ...style,
                }}
            >
                Upload a logo image →
            </div>
        )
    }

    // Beam gradient — soft feathered edges, subtle peak
    const beam = `linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,${intensity * 0.15}) 20%,
        rgba(255,255,255,${intensity * 0.5}) 40%,
        rgba(255,255,255,${intensity}) 50%,
        rgba(255,255,255,${intensity * 0.5}) 60%,
        rgba(255,255,255,${intensity * 0.15}) 80%,
        transparent 100%
    )`

    // Mask the entire effect layer to the logo silhouette
    const logoMask: CSSProperties = {
        WebkitMaskImage: `url(${image})`,
        maskImage: `url(${image})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
    }

    return (
        <div
            style={{
                position: "relative",
                width,
                height,
                overflow: "hidden",
                ...style,
            }}
        >
            {/* Base logo */}
            <img
                src={image}
                alt=""
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                }}
            />

            {/* Beam layer — masked to logo shape */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                    ...logoMask,
                }}
            >
                <motion.div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "40%",
                        height: "100%",
                        background: beam,
                        mixBlendMode: "overlay",
                        filter: "blur(8px)",
                        willChange: "transform",
                    }}
                    animate={{ x: ["-40%", "280%"] }}
                    transition={{
                        duration: speed,
                        ease: [0.4, 0, 0.2, 1],
                        repeat: Infinity,
                        repeatDelay: delay,
                    }}
                />
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Framer Property Controls
// ─────────────────────────────────────────────────────────────

addPropertyControls(CinematicLogoAnimation, {
    image: {
        type: ControlType.Image,
        title: "Logo",
    },
    speed: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 3,
        min: 1,
        max: 8,
        step: 0.5,
        unit: "s",
    },
    delay: {
        type: ControlType.Number,
        title: "Pause",
        defaultValue: 2,
        min: 0,
        max: 8,
        step: 0.5,
        unit: "s",
    },
    intensity: {
        type: ControlType.Number,
        title: "Intensity",
        defaultValue: 0.45,
        min: 0.1,
        max: 1,
        step: 0.05,
    },
})
