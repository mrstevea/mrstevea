import { addPropertyControls, ControlType } from "framer"
import React, { useRef, useEffect, useState } from "react"
import type { CSSProperties } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
    textColor: string
    fontSize: number
    highlightColor: string
    maxWidth: number
    borderRadius: number
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

const AGREEMENT_HTML =
    '<h2 style="font-weight:700;margin-bottom:16px;text-align:center">MANAGEMENT SERVICES AGREEMENT</h2>' +
    '<p style="line-height:1.8;margin-bottom:14px">This Management Services Agreement (the &quot;Agreement&quot;) is made and entered into as of January 1, 2022, by and between Nexus Valley Health, a Texas not-for-profit corporation (&quot;Nexus&quot;), and ARAMARK MANAGEMENT SERVICES LIMITED PARTNERSHIP, a Delaware limited partnership (&quot;Aramark&quot;). Nexus and Aramark will be referred to jointly as the &quot;Parties&quot; and individually as a &quot;Party.&quot;</p>' +
    '<p style="line-height:1.8;margin-bottom:14px;font-weight:600">WITNESSETH THAT:</p>' +
    '<p style="line-height:1.8;margin-bottom:14px;font-weight:700">Partnership</p>' +
    '<p style="line-height:1.8;margin-bottom:14px"><strong>1. Generally.</strong> The Parties are intending to enter into a significant and meaningful contractual relationship. The unique degree of investment and commitment from both organizations is referred to in this Agreement as the &quot;Partnership.&quot; The term carries no legal implication to infer any sort of joint venture or other legal structure beyond the business relationship outlined for the provision of Services. Instead, this term is referring to the list of commitments and expectations listed under Section 1(c). This additional distinction represents the intention for Aramark to utilize Nexus as a showcase account, which means it will be a primary site for touring and will serve to promote a full-service program within the healthcare industry.</p>'

const FADE_MS = 300

function CustomHighlightText({
    textColor = "#1a1a2e",
    fontSize = 18,
    highlightColor = "#FEF9C3",
    maxWidth = 640,
    borderRadius = 4,
    animationDuration = 600,
    highlightInterval = 2000,
    highlightDuration = 1200,
    style,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const blockIndexRef = useRef(0)

    const [rect, setRect] = useState<HighlightRect | null>(null)
    const [swept, setSwept] = useState(false)
    const [fading, setFading] = useState(false)

    // ── Auto-highlight loop ──────────────────────────────────────────────

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let cycleTimer: ReturnType<typeof setTimeout>
        let holdTimer: ReturnType<typeof setTimeout>
        let fadeTimer: ReturnType<typeof setTimeout>
        let rafId: number
        let cancelled = false

        const runCycle = () => {
            if (cancelled) return

            const blocks = getBlockElements(container)
            if (blocks.length === 0) {
                cycleTimer = setTimeout(runCycle, 1000)
                return
            }

            // Sequential order like reading
            const idx = blockIndexRef.current % blocks.length
            blockIndexRef.current = idx + 1
            const block = blocks[idx]

            const containerBox = container.getBoundingClientRect()
            const blockBox = block.getBoundingClientRect()

            // Tight to the text — no extra padding
            const newRect: HighlightRect = {
                x: blockBox.left - containerBox.left,
                y: blockBox.top - containerBox.top,
                width: blockBox.width,
                height: blockBox.height,
            }

            // Phase 1 — mount at scaleX(0)
            setSwept(false)
            setFading(false)
            setRect(newRect)

            // Phase 2 — sweep left-to-right (double rAF for paint)
            rafId = requestAnimationFrame(() => {
                if (cancelled) return
                rafId = requestAnimationFrame(() => {
                    if (cancelled) return
                    setSwept(true)
                })
            })

            // Phase 3 — after sweep + hold, fade out
            holdTimer = setTimeout(() => {
                if (cancelled) return
                setFading(true)

                fadeTimer = setTimeout(() => {
                    if (cancelled) return
                    setRect(null)
                    setSwept(false)
                    setFading(false)
                }, FADE_MS)
            }, animationDuration + highlightDuration)

            // Schedule next — add jitter so timing feels human
            const total = animationDuration + highlightDuration + FADE_MS
            const jitter = (Math.random() - 0.5) * 400
            cycleTimer = setTimeout(
                runCycle,
                total + highlightInterval + jitter
            )
        }

        cycleTimer = setTimeout(runCycle, 600)

        return () => {
            cancelled = true
            clearTimeout(cycleTimer)
            clearTimeout(holdTimer)
            clearTimeout(fadeTimer)
            cancelAnimationFrame(rafId)
        }
    }, [animationDuration, highlightDuration, highlightInterval])

    // ── Derived values ───────────────────────────────────────────────────

    const scopeId = useRef(
        `cht-${Math.random().toString(36).slice(2, 8)}`
    ).current

    const containerStyle: CSSProperties = {
        maxWidth: maxWidth > 0 ? `${maxWidth}px` : "none",
        width: "100%",
        color: textColor,
        fontSize: `${fontSize}px`,
        position: "relative",
        overflow: "hidden",
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
                {rect && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            zIndex: 0,
                        }}
                        aria-hidden="true"
                    >
                        <div
                            style={{
                                position: "absolute",
                                left: rect.x,
                                top: rect.y,
                                width: rect.width,
                                height: rect.height,
                                background: highlightColor,
                                borderRadius: `${borderRadius}px`,
                                transformOrigin: "left center",
                                transform: swept
                                    ? "scaleX(1)"
                                    : "scaleX(0)",
                                opacity: fading ? 0 : 1,
                                transition: [
                                    `transform ${animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
                                    `opacity ${FADE_MS}ms ease-out`,
                                ].join(", "),
                            }}
                        />
                    </div>
                )}

                <div
                    style={{ position: "relative", zIndex: 1 }}
                    dangerouslySetInnerHTML={{ __html: AGREEMENT_HTML }}
                />
            </div>
        </>
    )
}

// ─── Framer Property Controls ────────────────────────────────────────────────

addPropertyControls(CustomHighlightText, {
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
        defaultValue: 4,
        min: 0,
        max: 16,
        step: 1,
        unit: "px",
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Sweep Speed",
        defaultValue: 600,
        min: 200,
        max: 1500,
        step: 50,
        unit: "ms",
        description: "How fast the highlight sweeps across",
    },
    highlightInterval: {
        type: ControlType.Number,
        title: "Interval",
        defaultValue: 2000,
        min: 500,
        max: 10000,
        step: 100,
        unit: "ms",
        description: "Pause between highlights",
    },
    highlightDuration: {
        type: ControlType.Number,
        title: "Hold Duration",
        defaultValue: 1200,
        min: 200,
        max: 5000,
        step: 100,
        unit: "ms",
        description: "How long each highlight stays visible",
    },
})

export default CustomHighlightText
