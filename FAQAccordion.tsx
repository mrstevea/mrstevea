import React, { useState, useRef, useEffect, CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ───────────────────────────────────────────────────────────────────

interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    // Content
    items: FAQItem[]

    // Layout
    padding: number
    gap: number
    borderRadius: number
    borderWidth: number
    borderColor: string

    // Question typography
    questionFontSize: number
    questionFontWeight: number
    questionColor: string

    // Answer typography
    answerFontSize: number
    answerFontWeight: number
    answerColor: string

    // Style
    backgroundColor: string
    activeBackgroundColor: string
    hoverBackgroundColor: string
    showDivider: boolean
    dividerColor: string

    // Icon
    iconSize: number
    iconColor: string
    useCustomIcon: boolean
    iconPosition: "left" | "right"

    // Extensibility
    allowMultiple: boolean
    defaultOpenIndex: number
}

// ─── Default FAQ data ────────────────────────────────────────────────────────

const defaultItems: FAQItem[] = [
    {
        question: "What is this component?",
        answer: "This is a fully customizable FAQ Accordion built for Framer. You can edit all styles, colors, typography, and content directly from the property panel.",
    },
    {
        question: "How do I customize the content?",
        answer: "Click on the component, then use the property controls on the right panel in Framer to add, edit, or remove FAQ items.",
    },
    {
        question: "Can I change the animations?",
        answer: "The component uses smooth height and opacity transitions powered by Framer Motion. The animation duration and easing are built in for a polished feel.",
    },
]

// ─── Animated answer panel ───────────────────────────────────────────────────
// Uses a measuring technique to animate from height 0 to the content's natural
// height, since CSS cannot transition to `height: auto`.

function AnimatedPanel({
    isOpen,
    children,
    answerFontSize,
    answerFontWeight,
    answerColor,
    padding,
}: {
    isOpen: boolean
    children: React.ReactNode
    answerFontSize: number
    answerFontWeight: number
    answerColor: string
    padding: number
}) {
    const contentRef = useRef<HTMLDivElement>(null)
    const [measuredHeight, setMeasuredHeight] = useState(0)

    useEffect(() => {
        if (contentRef.current) {
            setMeasuredHeight(contentRef.current.scrollHeight)
        }
    }, [children, isOpen])

    return (
        <motion.div
            initial={false}
            animate={{
                height: isOpen ? measuredHeight : 0,
                opacity: isOpen ? 1 : 0,
            }}
            transition={{
                height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.25, ease: "easeInOut" },
            }}
            style={{ overflow: "hidden" }}
        >
            <div
                ref={contentRef}
                style={{
                    padding: `0 ${padding}px ${padding}px ${padding}px`,
                    fontSize: answerFontSize,
                    fontWeight: answerFontWeight,
                    color: answerColor,
                    lineHeight: 1.6,
                }}
            >
                {children}
            </div>
        </motion.div>
    )
}

// ─── Default plus/cross icon ─────────────────────────────────────────────────

function DefaultIcon({
    isOpen,
    size,
    color,
}: {
    isOpen: boolean
    size: number
    color: string
}) {
    return (
        <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
                width: size,
                height: size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        </motion.div>
    )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function FAQAccordion(props: FAQAccordionProps) {
    const {
        items = defaultItems,
        padding = 20,
        gap = 8,
        borderRadius = 12,
        borderWidth = 1,
        borderColor = "#e2e2e2",
        questionFontSize = 16,
        questionFontWeight = 600,
        questionColor = "#1a1a1a",
        answerFontSize = 15,
        answerFontWeight = 400,
        answerColor = "#555555",
        backgroundColor = "#ffffff",
        activeBackgroundColor = "#f9f9f9",
        hoverBackgroundColor = "#fafafa",
        showDivider = false,
        dividerColor = "#e2e2e2",
        iconSize = 20,
        iconColor = "#1a1a1a",
        useCustomIcon = false,
        iconPosition = "right",
        allowMultiple = false,
        defaultOpenIndex = -1,
    } = props

    // State: supports both single and multiple open items
    const [openIndices, setOpenIndices] = useState<Set<number>>(() => {
        const initial = new Set<number>()
        if (defaultOpenIndex >= 0 && defaultOpenIndex < items.length) {
            initial.add(defaultOpenIndex)
        }
        return initial
    })

    const toggle = (index: number) => {
        setOpenIndices((prev) => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                if (!allowMultiple) {
                    next.clear()
                }
                next.add(index)
            }
            return next
        })
    }

    // Container styles
    const containerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: gap,
        width: "100%",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }

    return (
        <div style={containerStyle}>
            {items.map((item, index) => {
                const isOpen = openIndices.has(index)
                const isLast = index === items.length - 1

                // Per-item wrapper styles
                const itemStyle: CSSProperties = {
                    backgroundColor: isOpen
                        ? activeBackgroundColor
                        : backgroundColor,
                    borderRadius: borderRadius,
                    border: `${borderWidth}px solid ${borderColor}`,
                    overflow: "hidden",
                    transition: "background-color 0.2s ease",
                    ...(showDivider &&
                        !isLast &&
                        gap === 0 && {
                            borderBottom: `1px solid ${dividerColor}`,
                            borderRadius: 0,
                        }),
                }

                // Question row styles
                const questionRowStyle: CSSProperties = {
                    display: "flex",
                    flexDirection:
                        iconPosition === "left" ? "row-reverse" : "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: padding,
                    cursor: "pointer",
                    userSelect: "none",
                    gap: 12,
                    transition: "background-color 0.2s ease",
                }

                return (
                    <div
                        key={index}
                        style={itemStyle}
                        onMouseEnter={(e) => {
                            if (!isOpen) {
                                ;(e.currentTarget as HTMLDivElement).style.backgroundColor =
                                    hoverBackgroundColor
                            }
                        }}
                        onMouseLeave={(e) => {
                            ;(e.currentTarget as HTMLDivElement).style.backgroundColor =
                                isOpen
                                    ? activeBackgroundColor
                                    : backgroundColor
                        }}
                    >
                        {/* Question header */}
                        <div
                            style={questionRowStyle}
                            onClick={() => toggle(index)}
                            role="button"
                            aria-expanded={isOpen}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    toggle(index)
                                }
                            }}
                        >
                            <span
                                style={{
                                    fontSize: questionFontSize,
                                    fontWeight: questionFontWeight,
                                    color: questionColor,
                                    lineHeight: 1.4,
                                    flex: 1,
                                }}
                            >
                                {item.question}
                            </span>

                            {/* Icon */}
                            {!useCustomIcon && (
                                <DefaultIcon
                                    isOpen={isOpen}
                                    size={iconSize}
                                    color={iconColor}
                                />
                            )}
                        </div>

                        {/* Animated answer panel */}
                        <AnimatedPanel
                            isOpen={isOpen}
                            answerFontSize={answerFontSize}
                            answerFontWeight={answerFontWeight}
                            answerColor={answerColor}
                            padding={padding}
                        >
                            {item.answer}
                        </AnimatedPanel>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Default props ───────────────────────────────────────────────────────────

FAQAccordion.defaultProps = {
    items: defaultItems,
    padding: 20,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    questionFontSize: 16,
    questionFontWeight: 600,
    questionColor: "#1a1a1a",
    answerFontSize: 15,
    answerFontWeight: 400,
    answerColor: "#555555",
    backgroundColor: "#ffffff",
    activeBackgroundColor: "#f9f9f9",
    hoverBackgroundColor: "#fafafa",
    showDivider: false,
    dividerColor: "#e2e2e2",
    iconSize: 20,
    iconColor: "#1a1a1a",
    useCustomIcon: false,
    iconPosition: "right",
    allowMultiple: false,
    defaultOpenIndex: -1,
}

// ─── Framer property controls ────────────────────────────────────────────────

addPropertyControls(FAQAccordion, {
    // Content
    items: {
        type: ControlType.Array,
        title: "FAQ Items",
        control: {
            type: ControlType.Object,
            controls: {
                question: {
                    type: ControlType.String,
                    title: "Question",
                    defaultValue: "Your question here?",
                },
                answer: {
                    type: ControlType.String,
                    title: "Answer",
                    defaultValue: "Your answer here.",
                    displayTextArea: true,
                },
            },
        },
        defaultValue: defaultItems,
    },

    // ── Layout ───────────────────────────────────────────────────────────

    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 20,
        min: 0,
        max: 60,
        step: 1,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        max: 40,
        step: 1,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 12,
        min: 0,
        max: 40,
        step: 1,
    },
    borderWidth: {
        type: ControlType.Number,
        title: "Border Width",
        defaultValue: 1,
        min: 0,
        max: 8,
        step: 1,
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border Color",
        defaultValue: "#e2e2e2",
    },

    // ── Question Typography ──────────────────────────────────────────────

    questionFontSize: {
        type: ControlType.Number,
        title: "Q Font Size",
        defaultValue: 16,
        min: 10,
        max: 40,
        step: 1,
    },
    questionFontWeight: {
        type: ControlType.Number,
        title: "Q Font Weight",
        defaultValue: 600,
        min: 100,
        max: 900,
        step: 100,
    },
    questionColor: {
        type: ControlType.Color,
        title: "Q Color",
        defaultValue: "#1a1a1a",
    },

    // ── Answer Typography ────────────────────────────────────────────────

    answerFontSize: {
        type: ControlType.Number,
        title: "A Font Size",
        defaultValue: 15,
        min: 10,
        max: 32,
        step: 1,
    },
    answerFontWeight: {
        type: ControlType.Number,
        title: "A Font Weight",
        defaultValue: 400,
        min: 100,
        max: 900,
        step: 100,
    },
    answerColor: {
        type: ControlType.Color,
        title: "A Color",
        defaultValue: "#555555",
    },

    // ── Style ────────────────────────────────────────────────────────────

    backgroundColor: {
        type: ControlType.Color,
        title: "BG Color",
        defaultValue: "#ffffff",
    },
    activeBackgroundColor: {
        type: ControlType.Color,
        title: "Active BG",
        defaultValue: "#f9f9f9",
    },
    hoverBackgroundColor: {
        type: ControlType.Color,
        title: "Hover BG",
        defaultValue: "#fafafa",
    },
    showDivider: {
        type: ControlType.Boolean,
        title: "Divider",
        defaultValue: false,
    },
    dividerColor: {
        type: ControlType.Color,
        title: "Divider Color",
        defaultValue: "#e2e2e2",
        hidden: (props: FAQAccordionProps) => !props.showDivider,
    },

    // ── Icon ─────────────────────────────────────────────────────────────

    iconSize: {
        type: ControlType.Number,
        title: "Icon Size",
        defaultValue: 20,
        min: 12,
        max: 40,
        step: 1,
    },
    iconColor: {
        type: ControlType.Color,
        title: "Icon Color",
        defaultValue: "#1a1a1a",
    },
    useCustomIcon: {
        type: ControlType.Boolean,
        title: "Custom Icon",
        defaultValue: false,
        description: "Hide default icon so you can overlay your own.",
    },
    iconPosition: {
        type: ControlType.Enum,
        title: "Icon Position",
        options: ["right", "left"],
        optionTitles: ["Right", "Left"],
        defaultValue: "right",
    },

    // ── Extensibility ────────────────────────────────────────────────────

    allowMultiple: {
        type: ControlType.Boolean,
        title: "Multi-Open",
        defaultValue: false,
        description: "Allow multiple items to be open at once.",
    },
    defaultOpenIndex: {
        type: ControlType.Number,
        title: "Default Open",
        defaultValue: -1,
        min: -1,
        max: 20,
        step: 1,
        description: "Index of item open by default (-1 = none).",
    },
})
