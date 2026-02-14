import { addPropertyControls, ControlType } from "framer"
import React, { useMemo, CSSProperties } from "react"

// ─────────────────────────────────────────────────────────────
// Cinematic Logo Animation
//
// Upload an SVG/PNG logo → a soft light beam sweeps across the
// logo shape (not the bounding box) from left to right, then
// loops seamlessly with a pause between each pass.
//
// Uses pure CSS @keyframes animation on the compositor thread
// for buttery smooth 60fps motion — no JS animation ticks.
//
// The beam is CSS-masked to the logo's alpha channel so it only
// appears on the actual letterforms / icon, not empty space.
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

    // Total cycle = sweep + pause. The sweep occupies a fraction
    // of the full cycle so the pause is handled inside the keyframe
    // (the beam sits offscreen for the remaining %).
    const totalDuration = speed + delay
    const sweepPct = (speed / totalDuration) * 100

    // Unique ID so multiple instances don't clash
    const id = useMemo(
        () => "beam_" + Math.random().toString(36).slice(2, 8),
        []
    )

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
                Upload a logo image
            </div>
        )
    }

    // Beam gradient — wide, soft feathered edges
    const beam = `linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,${intensity * 0.1}) 15%,
        rgba(255,255,255,${intensity * 0.35}) 35%,
        rgba(255,255,255,${intensity}) 50%,
        rgba(255,255,255,${intensity * 0.35}) 65%,
        rgba(255,255,255,${intensity * 0.1}) 85%,
        transparent 100%
    )`

    // CSS keyframes: sweep from -50% to 150%, then hold offscreen
    // for the pause portion. Uses translate3d for GPU compositing.
    const keyframes = `
        @keyframes ${id} {
            0% {
                transform: translate3d(-50%, 0, 0);
            }
            ${sweepPct}% {
                transform: translate3d(150%, 0, 0);
            }
            100% {
                transform: translate3d(150%, 0, 0);
            }
        }
    `

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
            <style>{keyframes}</style>

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
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "45%",
                        height: "100%",
                        background: beam,
                        mixBlendMode: "overlay",
                        filter: "blur(10px)",
                        backfaceVisibility: "hidden",
                        willChange: "transform",
                        animation: `${id} ${totalDuration}s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`,
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
