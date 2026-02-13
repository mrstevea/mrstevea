import { addPropertyControls, ControlType } from "framer"
import React, {
    useRef,
    useEffect,
    useCallback,
    useState,
    useMemo,
} from "react"
import type { CSSProperties } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
    richText: React.ReactNode
    textColor: string
    fontSize: number
    highlightColor: string
    gradientStart: string
    gradientEnd: string
    maxWidth: number
    borderRadius: number
    animationDuration: number
    glowIntensity: number
    style?: CSSProperties
}

interface HighlightRect {
    x: number
    y: number
    width: number
    height: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Merge adjacent / overlapping rects on the same line into single spans. */
function mergeRects(rects: HighlightRect[]): HighlightRect[] {
    if (rects.length <= 1) return rects

    const sorted = [...rects].sort((a, b) => a.y - b.y || a.x - b.x)
    const merged: HighlightRect[] = [{ ...sorted[0] }]

    for (let i = 1; i < sorted.length; i++) {
        const cur = sorted[i]
        const last = merged[merged.length - 1]

        const sameLine =
            Math.abs(cur.y - last.y) < 3 &&
            Math.abs(cur.height - last.height) < 3
        const adjacent = cur.x <= last.x + last.width + 2

        if (sameLine && adjacent) {
            const right = Math.max(
                last.x + last.width,
                cur.x + cur.width
            )
            last.width = right - last.x
        } else {
            merged.push({ ...cur })
        }
    }

    return merged
}

// ─── Component ───────────────────────────────────────────────────────────────

function CustomHighlightText({
    richText,
    textColor = "#1a1a2e",
    fontSize = 18,
    highlightColor = "rgba(124, 58, 237, 0.15)",
    gradientStart = "rgba(124, 58, 237, 0.18)",
    gradientEnd = "rgba(59, 130, 246, 0.18)",
    maxWidth = 640,
    borderRadius = 8,
    animationDuration = 300,
    glowIntensity = 12,
    style,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isSelecting = useRef(false)
    const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [rects, setRects] = useState<HighlightRect[]>([])
    const [fading, setFading] = useState(false)

    // ── Compute overlay rects from current browser selection ──────────────

    const computeRects = useCallback((): HighlightRect[] => {
        const container = containerRef.current
        if (!container) return []

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
            return []

        const range = selection.getRangeAt(0)
        if (!container.contains(range.commonAncestorContainer)) return []

        const containerBox = container.getBoundingClientRect()
        const clientRects = range.getClientRects()

        const mapped: HighlightRect[] = []
        for (let i = 0; i < clientRects.length; i++) {
            const r = clientRects[i]
            if (r.width < 1) continue
            mapped.push({
                x: r.left - containerBox.left,
                y: r.top - containerBox.top,
                width: r.width,
                height: r.height,
            })
        }

        return mergeRects(mapped)
    }, [])

    // ── Clear helpers ────────────────────────────────────────────────────

    const clearAnimated = useCallback(() => {
        if (fadeTimer.current) clearTimeout(fadeTimer.current)
        setFading(true)
        fadeTimer.current = setTimeout(() => {
            setRects([])
            setFading(false)
            fadeTimer.current = null
        }, animationDuration)
    }, [animationDuration])

    const clearInstant = useCallback(() => {
        if (fadeTimer.current) {
            clearTimeout(fadeTimer.current)
            fadeTimer.current = null
        }
        setFading(false)
        setRects([])
    }, [])

    // ── Live selection tracking ──────────────────────────────────────────

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const updateFromSelection = () => {
            const newRects = computeRects()
            if (newRects.length > 0) {
                // Cancel any in-progress fade-out — new selection takes over
                if (fadeTimer.current) {
                    clearTimeout(fadeTimer.current)
                    fadeTimer.current = null
                }
                setFading(false)
                setRects(newRects)
            }
        }

        // ── selectionchange: fires in real-time during drag ──────────

        const handleSelectionChange = () => {
            updateFromSelection()
        }

        // ── mousedown inside: begin new selection ────────────────────

        const handleMouseDown = (e: MouseEvent) => {
            if (container.contains(e.target as Node)) {
                isSelecting.current = true
                // Don't clearInstant here — let the new selection
                // rects replace the old ones seamlessly.
                // If user just clicks (no drag), mouseup handles cleanup.
            }
        }

        // ── mouseup: finalise selection or clean up a plain click ────

        const handleMouseUp = () => {
            if (!isSelecting.current) return
            isSelecting.current = false

            // Small delay so the browser's final selectionchange fires first
            requestAnimationFrame(() => {
                const selection = window.getSelection()
                if (!selection || selection.isCollapsed) {
                    // Plain click inside — fade out existing highlight
                    clearAnimated()
                } else if (container.contains(selection.anchorNode)) {
                    // Drag completed — snapshot final rects
                    updateFromSelection()
                }
            })
        }

        // ── click outside: fade out and dismiss ──────────────────────

        const handleClickOutside = (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                window.getSelection()?.removeAllRanges()
                clearAnimated()
            }
        }

        // ── touch support ────────────────────────────────────────────

        const handleTouchStart = (e: TouchEvent) => {
            if (container.contains(e.target as Node)) {
                isSelecting.current = true
            }
        }

        const handleTouchEnd = () => {
            if (!isSelecting.current) return
            isSelecting.current = false
            requestAnimationFrame(() => {
                const selection = window.getSelection()
                if (!selection || selection.isCollapsed) {
                    clearAnimated()
                } else if (container.contains(selection.anchorNode)) {
                    updateFromSelection()
                }
            })
        }

        document.addEventListener("selectionchange", handleSelectionChange)
        document.addEventListener("mousedown", handleMouseDown)
        document.addEventListener("mouseup", handleMouseUp)
        document.addEventListener("click", handleClickOutside)
        container.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        })
        container.addEventListener("touchend", handleTouchEnd)

        return () => {
            document.removeEventListener(
                "selectionchange",
                handleSelectionChange
            )
            document.removeEventListener("mousedown", handleMouseDown)
            document.removeEventListener("mouseup", handleMouseUp)
            document.removeEventListener("click", handleClickOutside)
            container.removeEventListener("touchstart", handleTouchStart)
            container.removeEventListener("touchend", handleTouchEnd)
            if (fadeTimer.current) clearTimeout(fadeTimer.current)
        }
    }, [computeRects, clearAnimated, clearInstant])

    // ── Derived values ───────────────────────────────────────────────────

    const hasRects = rects.length > 0
    const showOverlay = hasRects || fading

    const glowSize = Math.max(2, glowIntensity)
    const glowSmall = Math.max(1, Math.round(glowIntensity / 3))

    const gradient = useMemo(
        () => `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        [gradientStart, gradientEnd]
    )
    const glow = useMemo(
        () =>
            `0 0 ${glowSize}px ${highlightColor}, 0 0 ${glowSmall}px ${highlightColor}`,
        [glowSize, glowSmall, highlightColor]
    )

    // Scoped class ID to avoid style collisions between instances
    const scopeId = useRef(
        `cht-${Math.random().toString(36).slice(2, 8)}`
    ).current

    const containerStyle: CSSProperties = {
        maxWidth: maxWidth > 0 ? `${maxWidth}px` : "none",
        width: "100%",
        color: textColor,
        fontSize: `${fontSize}px`,
        WebkitUserSelect: "text",
        userSelect: "text",
        cursor: "text",
        position: "relative",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        ...style,
    }

    // ── Overlay wrapper: animates opacity for enter / leave ──────────────

    const overlayStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: hasRects && !fading ? 1 : 0,
        transform: hasRects && !fading ? "scaleY(1)" : "scaleY(0.98)",
        transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
        willChange: showOverlay ? "opacity, transform" : "auto",
    }

    return (
        <>
            <style>{`
                .${scopeId}::selection,
                .${scopeId} *::selection {
                    background: transparent !important;
                    color: inherit !important;
                }
                .${scopeId}::-moz-selection,
                .${scopeId} *::-moz-selection {
                    background: transparent !important;
                    color: inherit !important;
                }
                .${scopeId} p {
                    margin: 0;
                }
            `}</style>
            <div
                ref={containerRef}
                className={scopeId}
                style={containerStyle}
            >
                {richText}

                {showOverlay && (
                    <div style={overlayStyle} aria-hidden="true">
                        {rects.map((rect, i) => (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    left: rect.x - 3,
                                    top: rect.y,
                                    width: rect.width + 6,
                                    height: rect.height,
                                    background: gradient,
                                    borderRadius: `${borderRadius}px`,
                                    boxShadow: glow,
                                    boxDecorationBreak: "clone" as const,
                                    WebkitBoxDecorationBreak:
                                        "clone" as const,
                                }}
                            />
                        ))}
                    </div>
                )}
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
        title: "Glow Color",
        defaultValue: "rgba(124, 58, 237, 0.15)",
    },
    gradientStart: {
        type: ControlType.Color,
        title: "Gradient Start",
        defaultValue: "rgba(124, 58, 237, 0.18)",
    },
    gradientEnd: {
        type: ControlType.Color,
        title: "Gradient End",
        defaultValue: "rgba(59, 130, 246, 0.18)",
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
        title: "Highlight Radius",
        defaultValue: 8,
        min: 0,
        max: 20,
        step: 1,
        unit: "px",
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Anim Duration",
        defaultValue: 300,
        min: 100,
        max: 800,
        step: 50,
        unit: "ms",
    },
    glowIntensity: {
        type: ControlType.Number,
        title: "Glow Size",
        defaultValue: 12,
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
    },
})

export default CustomHighlightText
