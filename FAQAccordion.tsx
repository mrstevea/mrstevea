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

// ─── Icon Component ───────────────────────────────────────────────────────────

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
    iconGap: number
    questionFontSize: number
    answerFontSize: number
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
    iconGap,
    questionFontSize,
    answerFontSize,
    questionFontWeight,
}: FAQRowProps) {
    const iconColor = isOpen ? accentColor : answerColor

    return (
        <div
            onClick={onToggle}
            style={{
                backgroundColor: itemBackgroundColor,
                border: `1px solid ${borderColor}`,
                borderRadius,
                padding: "20px 24px",
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
                    gap: iconGap,
                }}
            >
                <span
                    style={{
                        ...font,
                        fontSize: questionFontSize,
                        fontWeight: questionFontWeight,
                        color: questionColor,
                        lineHeight: 1.4,
                    }}
                >
                    {item.question}
                </span>

                {/* Toggle icon — rotates 45° on open */}
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <PlusIcon color={iconColor} />
                </motion.div>
            </div>

            {/* Answer (animated) */}
            <AnimatePresence initial={false}>
                {isOpen && item.answer ? (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { type: "spring", stiffness: 320, damping: 32 },
                            opacity: { duration: 0.2, ease: "easeOut" },
                        }}
                        style={{ overflow: "hidden" }}
                    >
                        <p
                            style={{
                                ...font,
                                fontSize: answerFontSize,
                                color: answerColor,
                                lineHeight: 1.65,
                                margin: "12px 0 0 0",
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
    questionFontSize?: number
    answerFontSize?: number
    itemBorderRadius?: number
    iconGap?: number
    gap?: number
    padding?: number
    containerBorderRadius?: number
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
    questionFontSize = 16,
    answerFontSize = 15,
    itemBorderRadius = 14,
    iconGap = 16,
    gap = 10,
    padding = 16,
    containerBorderRadius = 20,
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
                    iconGap={iconGap}
                    questionFontSize={questionFontSize}
                    answerFontSize={answerFontSize}
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
    questionFontSize: {
        type: ControlType.Number,
        title: "Q. Font Size",
        defaultValue: 16,
        min: 10,
        max: 36,
        unit: "px",
    },
    answerFontSize: {
        type: ControlType.Number,
        title: "A. Font Size",
        defaultValue: 15,
        min: 10,
        max: 36,
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
    iconGap: {
        type: ControlType.Number,
        title: "Icon Gap",
        defaultValue: 16,
        min: 0,
        max: 64,
        unit: "px",
        description: "Space between the question text and the toggle icon.",
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
})
