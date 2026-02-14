import { addPropertyControls, ControlType } from "framer"
import React, { useRef, useEffect, useState } from "react"
import type { CSSProperties } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
    richText: React.ReactNode
    textColor: string
    fontSize: number
    highlightColor: string
    maxWidth: number
    borderRadius: number
    highlightPadding: number
    animationDuration: number
    highlightInterval: number
    highlightDuration: number
    style?: CSSProperties
}

interface HighlightRect {
    x: number
    y: number
    width: number
    height: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BLOCK_SELECTOR =
    "p, h1, h2, h3, h4, h5, h6, li, blockquote, dt, dd, figcaption"

function getBlockElements(root: HTMLElement): HTMLElement[] {
    const blocks: HTMLElement[] = []
    const els = root.querySelectorAll(BLOCK_SELECTOR)
    els.forEach((el) => {
        if (!el.closest("[aria-hidden]")) {
            blocks.push(el as HTMLElement)
        }
    })
    return blocks
}

// ─── Component ───────────────────────────────────────────────────────────────

function CustomHighlightText({
    richText,
    textColor = "#1a1a2e",
    fontSize = 18,
    highlightColor = "#FEF9C3",
    maxWidth = 640,
    borderRadius = 12,
    highlightPadding = 16,
    animationDuration = 400,
    highlightInterval = 3000,
    highlightDuration = 2000,
    style,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    const [rect, setRect] = useState<HighlightRect | null>(null)
    const [fading, setFading] = useState(false)

    // ── Auto-highlight loop ──────────────────────────────────────────────

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let cycleTimer: ReturnType<typeof setTimeout>
        let fadeTimer: ReturnType<typeof setTimeout>
        let clearTimer: ReturnType<typeof setTimeout>
        let cancelled = false

        const runCycle = () => {
            if (cancelled) return

            const blocks = getBlockElements(container)
            if (blocks.length === 0) {
                cycleTimer = setTimeout(runCycle, highlightInterval)
                return
            }

            const block =
                blocks[Math.floor(Math.random() * blocks.length)]

            const containerBox = container.getBoundingClientRect()
            const blockBox = block.getBoundingClientRect()

            const newRect: HighlightRect = {
                x: blockBox.left - containerBox.left - highlightPadding,
                y: blockBox.top - containerBox.top - highlightPadding,
                width: blockBox.width + highlightPadding * 2,
                height: blockBox.height + highlightPadding * 2,
            }

            setFading(false)
            setRect(newRect)

            fadeTimer = setTimeout(() => {
                if (cancelled) return
                setFading(true)

                clearTimer = setTimeout(() => {
                    if (cancelled) return
                    setRect(null)
                    setFading(false)
                }, animationDuration)
            }, highlightDuration)

            cycleTimer = setTimeout(runCycle, highlightInterval)
        }

        cycleTimer = setTimeout(runCycle, 500)

        return () => {
            cancelled = true
            clearTimeout(cycleTimer)
            clearTimeout(fadeTimer)
            clearTimeout(clearTimer)
        }
    }, [
        highlightInterval,
        highlightDuration,
        highlightPadding,
        animationDuration,
    ])

    // ── Derived values ───────────────────────────────────────────────────

    const showOverlay = rect !== null || fading

    const scopeId = useRef(
        `cht-${Math.random().toString(36).slice(2, 8)}`
    ).current

    const containerStyle: CSSProperties = {
        maxWidth: maxWidth > 0 ? `${maxWidth}px` : "none",
        width: "100%",
        color: textColor,
        fontSize: `${fontSize}px`,
        position: "relative",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        ...style,
    }

    return (
        <>
            <style>{`
                .${scopeId} p {
                    margin: 0;
                }
            `}</style>
            <div
                ref={containerRef}
                className={scopeId}
                style={containerStyle}
            >
                {showOverlay && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            zIndex: 0,
                        }}
                        aria-hidden="true"
                    >
                        {rect && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: rect.x,
                                    top: rect.y,
                                    width: rect.width,
                                    height: rect.height,
                                    background: highlightColor,
                                    borderRadius: `${borderRadius}px`,
                                    opacity: rect && !fading ? 1 : 0,
                                    transform:
                                        rect && !fading
                                            ? "scale(1)"
                                            : "scale(0.98)",
                                    transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
                                }}
                            />
                        )}
                    </div>
                )}

                <div style={{ position: "relative", zIndex: 1 }}>
                    {richText}
                </div>
            </div>
        </>
    )
}

// ─── Framer Property Controls ────────────────────────────────────────────────

addPropertyControls(CustomHighlightText, {
    richText: {
        type: ControlType.RichText,
        title: "Text",
        defaultValue:
            '<h2 style="font-weight:700;margin-bottom:12px">Custom Highlight Text</h2><p style="line-height:1.7">Highlight any portion of this text to see a beautiful custom selection effect. This component replaces the default browser highlight with a smooth, animated gradient overlay that feels premium and modern.</p><p style="line-height:1.7">Try selecting across <strong>bold text</strong>, <em>italic text</em>, or even <a href="#">links</a> — the highlight adapts seamlessly to inline formatting.</p>',
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#1a1a2e",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 18,
        min: 10,
        max: 72,
        step: 1,
        unit: "px",
    },
    highlightColor: {
        type: ControlType.Color,
        title: "Highlight Color",
        defaultValue: "#FEF9C3",
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 640,
        min: 0,
        max: 1400,
        step: 10,
        unit: "px",
        description: "Set to 0 for no max width",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Corner Radius",
        defaultValue: 12,
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
    },
    highlightPadding: {
        type: ControlType.Number,
        title: "Highlight Padding",
        defaultValue: 16,
        min: 0,
        max: 40,
        step: 2,
        unit: "px",
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Anim Duration",
        defaultValue: 400,
        min: 100,
        max: 1000,
        step: 50,
        unit: "ms",
    },
    highlightInterval: {
        type: ControlType.Number,
        title: "Interval",
        defaultValue: 3000,
        min: 500,
        max: 10000,
        step: 100,
        unit: "ms",
        description: "Time between each new highlight",
    },
    highlightDuration: {
        type: ControlType.Number,
        title: "Hold Duration",
        defaultValue: 2000,
        min: 200,
        max: 8000,
        step: 100,
        unit: "ms",
        description: "How long each highlight stays visible",
    },
})

export default CustomHighlightText
