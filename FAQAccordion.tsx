import { addPropertyControls, ControlType } from "framer"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ───────────────────────────────────────────────────────────────────

type FAQItem = {
    question: string
    answer: string
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultFAQs: FAQItem[] = [
    {
        question: "How do I know if therapy is right for me?",
        answer: "Therapy isn't just for crises. It's for anyone curious about growth, clarity, or navigating life's changes with more support and self-awareness.",
    },
    {
        question: "What can I expect from the first session?",
        answer: "In your first session, we'll explore what brought you to therapy, discuss your goals, and start building a safe, supportive relationship together.",
    },
    {
        question: "Do you offer both online and in-person sessions?",
        answer: "Yes — we offer both online and in-person sessions so you can choose what works best for your lifestyle and comfort level.",
    },
    {
        question: "How often should I come to therapy?",
        answer: "Most clients start with weekly sessions. As you progress, we can adjust the frequency to whatever suits you best.",
    },
    {
        question: "Is everything I share kept private?",
        answer: "Absolutely. Everything shared in therapy is confidential, with a few legal exceptions that we'll walk through in our first session.",
    },
    {
        question: "What if I don't know what to talk about?",
        answer: "That's completely normal. Your therapist will guide the conversation and help you explore whatever feels most present or relevant.",
    },
]

// ─── Icon Components ─────────────────────────────────────────────────────────

function PlusIcon({ color }: { color: string }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6 1V11M1 6H11"
                stroke={color}
                strokeWidth="1.75"
                strokeLinecap="round"
            />
        </svg>
    )
}

function CloseIcon({ color }: { color: string }) {
    return (
        <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1 1L10 10M10 1L1 10"
                stroke={color}
                strokeWidth="1.75"
                strokeLinecap="round"
            />
        </svg>
    )
}

// ─── Single FAQ Row ───────────────────────────────────────────────────────────

interface FAQRowProps {
    item: FAQItem
    isOpen: boolean
    onToggle: () => void
    font: object
    questionColor: string
    answerColor: string
    borderColor: string
    accentColor: string
    itemBackgroundColor: string
    borderRadius: number
    paddingX: number
    paddingY: number
    answerSpacing: number
    fontSize: number
    questionFontWeight: number
}

function FAQRow({
    item,
    isOpen,
    onToggle,
    font,
    questionColor,
    answerColor,
    borderColor,
    accentColor,
    itemBackgroundColor,
    borderRadius,
    paddingX,
    paddingY,
    answerSpacing,
    fontSize,
    questionFontWeight,
}: FAQRowProps) {
    const iconBorderColor = isOpen ? accentColor : borderColor
    const iconColor = isOpen ? accentColor : answerColor

    return (
        <div
            onClick={onToggle}
            style={{
                backgroundColor: itemBackgroundColor,
                border: `1px solid ${borderColor}`,
                borderRadius,
                padding: `${paddingY}px ${paddingX}px`,
                cursor: "pointer",
                userSelect: "none",
                overflow: "hidden",
            }}
        >
            {/* Header row */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <span
                    style={{
                        ...font,
                        fontSize,
                        fontWeight: questionFontWeight,
                        color: questionColor,
                        lineHeight: 1.4,
                    }}
                >
                    {item.question}
                </span>

                {/* Toggle icon — always outlined, stroke swaps to accent when open */}
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `1.5px solid ${iconBorderColor}`,
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "border-color 0.2s ease",
                    }}
                >
                    {isOpen ? (
                        <CloseIcon color={iconColor} />
                    ) : (
                        <PlusIcon color={iconColor} />
                    )}
                </div>
            </div>

            {/* Answer (animated) */}
            <AnimatePresence initial={false}>
                {isOpen && item.answer ? (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: "hidden" }}
                    >
                        <p
                            style={{
                                ...font,
                                fontSize: fontSize - 1,
                                color: answerColor,
                                lineHeight: 1.65,
                                margin: `${answerSpacing}px 0 0 0`,
                            }}
                        >
                            {item.answer}
                        </p>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FAQAccordionProps {
    faqs?: FAQItem[]
    initialOpenIndex?: number
    allowMultiple?: boolean
    font?: object
    backgroundColor?: string
    itemBackgroundColor?: string
    questionColor?: string
    answerColor?: string
    borderColor?: string
    accentColor?: string
    questionFontWeight?: number
    itemBorderRadius?: number
    itemPaddingX?: number
    itemPaddingY?: number
    answerSpacing?: number
    gap?: number
    padding?: number
    containerBorderRadius?: number
    fontSize?: number
    style?: React.CSSProperties
}

/**
 * FAQAccordion
 *
 * A fully customisable FAQ accordion for Framer.
 * Drop it onto the canvas, configure the items via Property Controls,
 * and style it to match your design system.
 */
export default function FAQAccordion({
    faqs = defaultFAQs,
    initialOpenIndex = 0,
    allowMultiple = false,
    font = {},
    backgroundColor = "#0D0D1A",
    itemBackgroundColor = "transparent",
    questionColor = "#FFFFFF",
    answerColor = "rgba(255,255,255,0.55)",
    borderColor = "rgba(255,255,255,0.14)",
    accentColor = "#4ECDC4",
    questionFontWeight = 500,
    itemBorderRadius = 14,
    itemPaddingX = 24,
    itemPaddingY = 20,
    answerSpacing = 12,
    gap = 10,
    padding = 16,
    containerBorderRadius = 20,
    fontSize = 16,
    style,
    ...rest
}: FAQAccordionProps) {
    const [openIndexes, setOpenIndexes] = useState<Set<number>>(
        () => new Set(initialOpenIndex >= 0 ? [initialOpenIndex] : [])
    )

    function toggle(index: number) {
        setOpenIndexes((prev) => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                if (!allowMultiple) next.clear()
                next.add(index)
            }
            return next
        })
    }

    return (
        <div
            style={{
                backgroundColor,
                padding,
                borderRadius: containerBorderRadius,
                display: "flex",
                flexDirection: "column",
                gap,
                boxSizing: "border-box",
                width: "100%",
                ...style,
            }}
            {...rest}
        >
            {faqs.map((item, index) => (
                <FAQRow
                    key={index}
                    item={item}
                    isOpen={openIndexes.has(index)}
                    onToggle={() => toggle(index)}
                    font={font}
                    questionColor={questionColor}
                    answerColor={answerColor}
                    borderColor={borderColor}
                    accentColor={accentColor}
                    questionFontWeight={questionFontWeight}
                    itemBackgroundColor={itemBackgroundColor}
                    borderRadius={itemBorderRadius}
                    paddingX={itemPaddingX}
                    paddingY={itemPaddingY}
                    answerSpacing={answerSpacing}
                    fontSize={fontSize}
                />
            ))}
        </div>
    )
}

// ─── Property Controls ────────────────────────────────────────────────────────

addPropertyControls(FAQAccordion, {
    faqs: {
        type: ControlType.Array,
        title: "FAQ Items",
        control: {
            type: ControlType.Object,
            controls: {
                question: {
                    type: ControlType.String,
                    title: "Question",
                    placeholder: "Enter question…",
                },
                answer: {
                    type: ControlType.String,
                    title: "Answer",
                    placeholder: "Enter answer…",
                    displayTextArea: true,
                },
            },
        },
        defaultValue: defaultFAQs,
    },
    initialOpenIndex: {
        type: ControlType.Number,
        title: "Open at Start",
        defaultValue: 0,
        min: -1,
        step: 1,
        displayStepper: true,
        description: "Index of item open by default. -1 = all closed.",
    },
    allowMultiple: {
        type: ControlType.Boolean,
        title: "Multi-open",
        defaultValue: false,
        description: "Allow more than one item open at once.",
    },

    // ── Typography
    font: {
        type: ControlType.Font,
        title: "Font",
        controls: "basic",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 16,
        min: 12,
        max: 28,
        unit: "px",
    },
    questionFontWeight: {
        type: ControlType.Enum,
        title: "Q. Weight",
        defaultValue: 500,
        options: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        optionTitles: [
            "100 Thin",
            "200 ExtraLight",
            "300 Light",
            "400 Regular",
            "500 Medium",
            "600 SemiBold",
            "700 Bold",
            "800 ExtraBold",
            "900 Black",
        ],
    },

    // ── Colours
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#0D0D1A",
    },
    itemBackgroundColor: {
        type: ControlType.Color,
        title: "Item Background",
        defaultValue: "transparent",
    },
    questionColor: {
        type: ControlType.Color,
        title: "Question",
        defaultValue: "#FFFFFF",
    },
    answerColor: {
        type: ControlType.Color,
        title: "Answer",
        defaultValue: "rgba(255,255,255,0.55)",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "rgba(255,255,255,0.14)",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#4ECDC4",
        description: "Stroke colour of the icon when the item is open.",
    },

    // ── Layout
    gap: {
        type: ControlType.Number,
        title: "Item Gap",
        defaultValue: 10,
        min: 0,
        max: 40,
        unit: "px",
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 16,
        min: 0,
        max: 64,
        unit: "px",
    },
    containerBorderRadius: {
        type: ControlType.Number,
        title: "Wrap Radius",
        defaultValue: 20,
        min: 0,
        max: 60,
        unit: "px",
    },
    itemBorderRadius: {
        type: ControlType.Number,
        title: "Item Radius",
        defaultValue: 14,
        min: 0,
        max: 40,
        unit: "px",
    },
    itemPaddingX: {
        type: ControlType.Number,
        title: "Item Padding X",
        defaultValue: 24,
        min: 0,
        max: 64,
        unit: "px",
    },
    itemPaddingY: {
        type: ControlType.Number,
        title: "Item Padding Y",
        defaultValue: 20,
        min: 0,
        max: 64,
        unit: "px",
    },
    answerSpacing: {
        type: ControlType.Number,
        title: "Answer Spacing",
        defaultValue: 12,
        min: 0,
        max: 48,
        unit: "px",
        description: "Gap between the question and answer text.",
    },
})
