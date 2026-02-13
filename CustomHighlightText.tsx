import { addPropertyControls, ControlType } from "framer"
import { useRef, useEffect, useCallback } from "react"
import type { CSSProperties } from "react"

interface Props {
    text: string
    fontSize: number
    fontWeight: number
    highlightColor: string
    gradientStart: string
    gradientEnd: string
    textColor: string
    maxWidth: number
    borderRadius: number
    lineHeight: number
    fontFamily: string
}

const HIGHLIGHT_CLASS = "custom-highlight"
const ANIMATION_DURATION = 300

function CustomHighlightText({
    text = "Highlight any portion of this text to see a beautiful custom selection effect. This component replaces the default browser highlight with a smooth, animated gradient overlay that feels premium and modern.",
    fontSize = 18,
    fontWeight = 400,
    highlightColor = "rgba(124, 58, 237, 0.15)",
    gradientStart = "rgba(124, 58, 237, 0.18)",
    gradientEnd = "rgba(59, 130, 246, 0.18)",
    textColor = "#1a1a2e",
    maxWidth = 640,
    borderRadius = 8,
    lineHeight = 1.7,
    fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isAnimatingOut = useRef(false)

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
                    el.style.transition = `opacity ${ANIMATION_DURATION}ms ease-out, transform ${ANIMATION_DURATION}ms ease-out`
                    el.style.opacity = "0"
                    el.style.transform = "scaleY(0.95)"
                })

                setTimeout(() => {
                    unwrapHighlights(container)
                    isAnimatingOut.current = false
                }, ANIMATION_DURATION)
            } else if (!animate) {
                unwrapHighlights(container)
            }
        },
        []
    )

    const unwrapHighlights = (container: HTMLElement) => {
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
    }

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

            // Don't wrap if selection is empty
            if (range.collapsed) return

            try {
                // Handle selections that may span multiple nodes
                const fragment = range.extractContents()

                // Remove any nested highlight spans from the extracted fragment
                const nestedHighlights = fragment.querySelectorAll(
                    `.${HIGHLIGHT_CLASS}`
                )
                nestedHighlights.forEach((nested) => {
                    const parent = nested.parentNode
                    if (!parent) return
                    while (nested.firstChild) {
                        parent.insertBefore(nested.firstChild, nested)
                    }
                    parent.removeChild(nested)
                })

                const highlightSpan = document.createElement("span")
                highlightSpan.className = HIGHLIGHT_CLASS
                Object.assign(highlightSpan.style, {
                    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: `0 0 12px ${highlightColor}, 0 0 4px ${highlightColor}`,
                    padding: "2px 4px",
                    margin: "0 -4px",
                    display: "inline",
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                    opacity: "0",
                    transform: "scaleY(0.95)",
                    transformOrigin: "center center",
                    transition: `opacity ${ANIMATION_DURATION}ms ease-out, transform ${ANIMATION_DURATION}ms ease-out`,
                    position: "relative" as const,
                } satisfies Partial<CSSProperties> & Record<string, string>)

                highlightSpan.appendChild(fragment)
                range.insertNode(highlightSpan)

                // Trigger animation on next frame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        highlightSpan.style.opacity = "1"
                        highlightSpan.style.transform = "scaleY(1)"
                    })
                })
            } catch {
                // If wrapping fails (e.g. cross-element boundary issues),
                // silently fail rather than breaking the DOM
            }
        },
        [gradientStart, gradientEnd, highlightColor, borderRadius]
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleSelectionEnd = () => {
            if (isAnimatingOut.current) return

            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)

            // Ensure selection is inside this component
            if (!container.contains(range.commonAncestorContainer)) return

            // Check for non-empty selection
            const selectedText = selection.toString().trim()
            if (selectedText.length === 0) return

            // Clone range and apply highlight
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
            // If clicking inside the container (starting a new selection),
            // clear existing highlights immediately
            if (container.contains(e.target as Node)) {
                const target = e.target as Element
                if (!target.closest(`.${HIGHLIGHT_CLASS}`)) {
                    clearHighlights(false)
                } else {
                    // Clicked on existing highlight — clear it
                    clearHighlights(true)
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
        }
    }, [applyHighlight, clearHighlights])

    const containerStyle: CSSProperties = {
        maxWidth: `${maxWidth}px`,
        width: "100%",
        fontSize: `${fontSize}px`,
        fontWeight,
        color: textColor,
        lineHeight,
        fontFamily,
        WebkitUserSelect: "text",
        userSelect: "text",
        cursor: "text",
        position: "relative",
        wordBreak: "break-word",
        overflowWrap: "break-word",
    }

    return (
        <>
            <style>{`
                .custom-highlight-container::selection,
                .custom-highlight-container *::selection {
                    background: transparent !important;
                    color: inherit !important;
                }
                .custom-highlight-container::-moz-selection,
                .custom-highlight-container *::-moz-selection {
                    background: transparent !important;
                    color: inherit !important;
                }
            `}</style>
            <div
                ref={containerRef}
                className="custom-highlight-container"
                style={containerStyle}
            >
                {text}
            </div>
        </>
    )
}

addPropertyControls(CustomHighlightText, {
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue:
            "Highlight any portion of this text to see a beautiful custom selection effect. This component replaces the default browser highlight with a smooth, animated gradient overlay that feels premium and modern.",
        displayTextArea: true,
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
    fontWeight: {
        type: ControlType.Number,
        title: "Font Weight",
        defaultValue: 400,
        min: 100,
        max: 900,
        step: 100,
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
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#1a1a2e",
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 640,
        min: 200,
        max: 1200,
        step: 10,
        unit: "px",
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
    lineHeight: {
        type: ControlType.Number,
        title: "Line Height",
        defaultValue: 1.7,
        min: 1,
        max: 3,
        step: 0.1,
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font Family",
        defaultValue:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
})

export default CustomHighlightText
