import { addPropertyControls, ControlType } from "framer"
import React, { useRef, useEffect, useState, useMemo } from "react"
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
    highlightInterval: number
    highlightDuration: number
    minWords: number
    maxWords: number
    style?: CSSProperties
}

interface HighlightRect {
    x: number
    y: number
    width: number
    height: number
}

interface TextSegment {
    node: Text
    start: number
    length: number
}

interface TextBlock {
    segments: TextSegment[]
    fullText: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BLOCK_TAGS = new Set([
    "P", "H1", "H2", "H3", "H4", "H5", "H6",
    "LI", "BLOCKQUOTE", "DT", "DD", "FIGCAPTION",
])

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

/** Find the closest block-level ancestor for a text node. */
function getClosestBlock(node: Node, root: HTMLElement): HTMLElement {
    let current = node.parentElement
    while (current && current !== root) {
        if (BLOCK_TAGS.has(current.tagName)) return current
        current = current.parentElement
    }
    return root
}

/**
 * Group text nodes by their parent block element (p, h1-h6, li, etc.)
 * so highlights never cross paragraph boundaries.
 */
function collectTextBlocks(root: HTMLElement): TextBlock[] {
    const blockMap = new Map<HTMLElement, TextSegment[]>()
    const blockOrder: HTMLElement[] = []

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node: Text | null
    while ((node = walker.nextNode() as Text | null)) {
        const len = node.textContent?.length ?? 0
        if (len === 0) continue

        // Skip nodes inside the overlay layer
        if (node.parentElement?.closest("[aria-hidden]")) continue

        const block = getClosestBlock(node, root)
        if (!blockMap.has(block)) {
            blockMap.set(block, [])
            blockOrder.push(block)
        }
        blockMap.get(block)!.push({ node, start: 0, length: len })
    }

    const blocks: TextBlock[] = []
    for (const block of blockOrder) {
        const segments = blockMap.get(block)!
        let offset = 0
        for (const seg of segments) {
            seg.start = offset
            offset += seg.length
        }
        const fullText = segments
            .map((s) => s.node.textContent ?? "")
            .join("")
        if (fullText.trim().length > 0) {
            blocks.push({ segments, fullText })
        }
    }

    return blocks
}

function findNodeAtOffset(
    segments: TextSegment[],
    charOffset: number
): { node: Text; offset: number } | null {
    for (const seg of segments) {
        if (charOffset >= seg.start && charOffset < seg.start + seg.length) {
            return { node: seg.node, offset: charOffset - seg.start }
        }
    }
    if (segments.length > 0) {
        const last = segments[segments.length - 1]
        if (charOffset === last.start + last.length) {
            return { node: last.node, offset: last.length }
        }
    }
    return null
}

function pickRandomWordRange(
    fullText: string,
    minWords: number,
    maxWords: number
): { start: number; end: number } | null {
    const wordRegex = /\S+/g
    const words: { start: number; end: number }[] = []
    let match
    while ((match = wordRegex.exec(fullText)) !== null) {
        words.push({ start: match.index, end: match.index + match[0].length })
    }

    if (words.length === 0) return null

    const startIdx = Math.floor(Math.random() * words.length)
    const wordCount = Math.min(
        minWords + Math.floor(Math.random() * (maxWords - minWords + 1)),
        words.length - startIdx
    )
    const endIdx = startIdx + wordCount - 1

    return { start: words[startIdx].start, end: words[endIdx].end }
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
    highlightInterval = 3000,
    highlightDuration = 1500,
    minWords = 2,
    maxWords = 8,
    style,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    const [rects, setRects] = useState<HighlightRect[]>([])
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

            // Group text nodes by block element so highlights
            // never cross paragraph boundaries
            const blocks = collectTextBlocks(container)
            if (blocks.length === 0) {
                cycleTimer = setTimeout(runCycle, highlightInterval)
                return
            }

            // Pick a random block, then random words within it
            const block =
                blocks[Math.floor(Math.random() * blocks.length)]

            const wordRange = pickRandomWordRange(
                block.fullText,
                minWords,
                maxWords
            )
            if (!wordRange) {
                cycleTimer = setTimeout(runCycle, highlightInterval)
                return
            }

            const startPos = findNodeAtOffset(
                block.segments,
                wordRange.start
            )
            const endPos = findNodeAtOffset(
                block.segments,
                wordRange.end
            )
            if (!startPos || !endPos) {
                cycleTimer = setTimeout(runCycle, highlightInterval)
                return
            }

            const range = document.createRange()
            range.setStart(startPos.node, startPos.offset)
            range.setEnd(endPos.node, endPos.offset)

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

            const merged = mergeRects(mapped)
            if (merged.length > 0) {
                setFading(false)
                setRects(merged)

                // After highlightDuration → fade out
                fadeTimer = setTimeout(() => {
                    if (cancelled) return
                    setFading(true)

                    // After fade completes → clear rects
                    clearTimer = setTimeout(() => {
                        if (cancelled) return
                        setRects([])
                        setFading(false)
                    }, animationDuration)
                }, highlightDuration)
            }

            // Schedule next cycle
            cycleTimer = setTimeout(runCycle, highlightInterval)
        }

        // Kick off after a short initial delay
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
        animationDuration,
        minWords,
        maxWords,
    ])

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
        defaultValue: 1500,
        min: 200,
        max: 8000,
        step: 100,
        unit: "ms",
        description: "How long each highlight stays visible",
    },
    minWords: {
        type: ControlType.Number,
        title: "Min Words",
        defaultValue: 2,
        min: 1,
        max: 20,
        step: 1,
        description: "Minimum words per highlight",
    },
    maxWords: {
        type: ControlType.Number,
        title: "Max Words",
        defaultValue: 8,
        min: 1,
        max: 40,
        step: 1,
        description: "Maximum words per highlight",
    },
})

export default CustomHighlightText
