import { addPropertyControls, ControlType } from "framer"
import React, { useRef, useEffect, useCallback } from "react"
import type { CSSProperties } from "react"

interface Props {
    richText: React.ReactNode
    highlightColor: string
    gradientStart: string
    gradientEnd: string
    maxWidth: number
    borderRadius: number
    animationDuration: number
    glowIntensity: number
    style?: CSSProperties
}

const HIGHLIGHT_CLASS = "cht-highlight"

function CustomHighlightText({
    richText,
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
    const isAnimatingOut = useRef(false)
    const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const unwrapHighlights = useCallback((container: HTMLElement) => {
        const highlights = container.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
        highlights.forEach((span) => {
            const parent = span.parentNode
            if (!parent) return
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span)
            }
            parent.removeChild(span)
            parent.normalize()
        })
    }, [])

    const clearHighlights = useCallback(
        (animate: boolean) => {
            const container = containerRef.current
            if (!container) return

            const highlights = container.querySelectorAll(
                `.${HIGHLIGHT_CLASS}`
            )
            if (highlights.length === 0) return

            if (animate && !isAnimatingOut.current) {
                isAnimatingOut.current = true
                highlights.forEach((span) => {
                    const el = span as HTMLElement
                    el.style.transition = `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`
                    el.style.opacity = "0"
                    el.style.transform = "scaleY(0.95)"
                })

                if (animationTimer.current) {
                    clearTimeout(animationTimer.current)
                }
                animationTimer.current = setTimeout(() => {
                    unwrapHighlights(container)
                    isAnimatingOut.current = false
                    animationTimer.current = null
                }, animationDuration)
            } else if (!animate) {
                if (animationTimer.current) {
                    clearTimeout(animationTimer.current)
                    animationTimer.current = null
                }
                isAnimatingOut.current = false
                unwrapHighlights(container)
            }
        },
        [animationDuration, unwrapHighlights]
    )

    const applyHighlight = useCallback(
        (range: Range) => {
            const container = containerRef.current
            if (!container) return

            // Prevent nested highlights
            const ancestor = range.commonAncestorContainer
            const ancestorEl =
                ancestor.nodeType === Node.ELEMENT_NODE
                    ? (ancestor as Element)
                    : ancestor.parentElement
            if (ancestorEl?.closest(`.${HIGHLIGHT_CLASS}`)) return

            // Remove existing highlights without animation for quick re-select
            unwrapHighlights(container)

            if (range.collapsed) return

            try {
                const fragment = range.extractContents()

                // Strip any nested highlight spans from extracted content
                const nested = fragment.querySelectorAll(
                    `.${HIGHLIGHT_CLASS}`
                )
                nested.forEach((el) => {
                    const parent = el.parentNode
                    if (!parent) return
                    while (el.firstChild) {
                        parent.insertBefore(el.firstChild, el)
                    }
                    parent.removeChild(el)
                })

                const glowSize = Math.max(2, glowIntensity)
                const glowSmall = Math.max(1, Math.round(glowIntensity / 3))

                const span = document.createElement("span")
                span.className = HIGHLIGHT_CLASS
                Object.assign(span.style, {
                    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: `0 0 ${glowSize}px ${highlightColor}, 0 0 ${glowSmall}px ${highlightColor}`,
                    padding: "2px 4px",
                    margin: "0 -4px",
                    display: "inline",
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                    opacity: "0",
                    transform: "scaleY(0.95)",
                    transformOrigin: "center center",
                    transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
                    position: "relative",
                })

                span.appendChild(fragment)
                range.insertNode(span)

                // Double rAF to ensure the browser has painted the initial state
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        span.style.opacity = "1"
                        span.style.transform = "scaleY(1)"
                    })
                })
            } catch {
                // Cross-boundary wrapping can fail — don't break the DOM
            }
        },
        [
            gradientStart,
            gradientEnd,
            highlightColor,
            borderRadius,
            animationDuration,
            glowIntensity,
            unwrapHighlights,
        ]
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleSelectionEnd = () => {
            if (isAnimatingOut.current) return

            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            if (!container.contains(range.commonAncestorContainer)) return

            const selectedText = selection.toString().trim()
            if (selectedText.length === 0) return

            const clonedRange = range.cloneRange()
            selection.removeAllRanges()
            applyHighlight(clonedRange)
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                clearHighlights(true)
            }
        }

        const handleMouseDown = (e: MouseEvent) => {
            if (container.contains(e.target as Node)) {
                const target = e.target as Element
                if (target.closest(`.${HIGHLIGHT_CLASS}`)) {
                    clearHighlights(true)
                } else {
                    clearHighlights(false)
                }
            }
        }

        container.addEventListener("mouseup", handleSelectionEnd)
        container.addEventListener("touchend", handleSelectionEnd)
        document.addEventListener("mousedown", handleMouseDown)
        document.addEventListener("click", handleClickOutside)

        return () => {
            container.removeEventListener("mouseup", handleSelectionEnd)
            container.removeEventListener("touchend", handleSelectionEnd)
            document.removeEventListener("mousedown", handleMouseDown)
            document.removeEventListener("click", handleClickOutside)
            if (animationTimer.current) {
                clearTimeout(animationTimer.current)
            }
        }
    }, [applyHighlight, clearHighlights])

    // Generate a scoped ID to avoid style collisions across instances
    const scopeId = useRef(
        `cht-${Math.random().toString(36).slice(2, 8)}`
    ).current

    const containerStyle: CSSProperties = {
        maxWidth: maxWidth > 0 ? `${maxWidth}px` : "none",
        width: "100%",
        WebkitUserSelect: "text",
        userSelect: "text",
        cursor: "text",
        position: "relative",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        ...style,
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
            </div>
        </>
    )
}

addPropertyControls(CustomHighlightText, {
    richText: {
        type: ControlType.RichText,
        title: "Text",
        defaultValue:
            '<h2 style="font-size:28px;font-weight:700;margin-bottom:12px">Custom Highlight Text</h2><p style="font-size:18px;line-height:1.7;color:#1a1a2e">Highlight any portion of this text to see a beautiful custom selection effect. This component replaces the default browser highlight with a smooth, animated gradient overlay that feels premium and modern.</p><p style="font-size:18px;line-height:1.7;color:#1a1a2e">Try selecting across <strong>bold text</strong>, <em>italic text</em>, or even <a href="#">links</a> — the highlight adapts seamlessly to inline formatting.</p>',
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
