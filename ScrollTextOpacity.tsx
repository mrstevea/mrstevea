import { useRef } from "react"
import {
    motion,
    useScroll,
    useTransform,
    MotionValue,
} from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ── Per-word animated span ────────────────────────────────────────────
function Word({
    word,
    scrollYProgress,
    start,
    end,
    enableBlur,
}: {
    word: string
    scrollYProgress: MotionValue<number>
    start: number
    end: number
    enableBlur: boolean
}) {
    const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
    const blur = useTransform(scrollYProgress, [start, end], [6, 0])
    const filter = useTransform(blur, (v) => `blur(${v}px)`)

    return (
        <motion.span
            style={{
                opacity,
                filter: enableBlur ? filter : "none",
                display: "inline-block",
                willChange: "opacity, filter",
            }}
        >
            {word}
        </motion.span>
    )
}

// ── Main component ───────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 800
 * @framerIntrinsicHeight 400
 */
export default function ScrollTextOpacity(props: {
    text: string
    fontFamily: string
    fontWeight: number
    fontSize: number
    mobileFontSize: number
    lineHeight: number
    letterSpacing: number
    textColor: string
    backgroundColor: string
    paddingX: number
    scrollEnd: number
    perWord: boolean
    enableBlur: boolean
    staggerAmount: number
}) {
    const {
        text = "We exist to close the access gap in healthcare",
        fontFamily = "Inter, sans-serif",
        fontWeight = 700,
        fontSize = 84,
        mobileFontSize = 40,
        lineHeight = 1.08,
        letterSpacing = -0.03,
        textColor = "#1E1E1E",
        backgroundColor = "#EAE6D8",
        paddingX = 10,
        scrollEnd = 0.6,
        perWord = true,
        enableBlur = true,
        staggerAmount = 0.04,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    })

    // ── Simple (whole-text) mode ──────────────────────────────────────
    const wholeOpacity = useTransform(
        scrollYProgress,
        [0, scrollEnd],
        [0.15, 1]
    )
    const wholeBlur = useTransform(
        scrollYProgress,
        [0, scrollEnd],
        [6, 0]
    )
    const wholeFilter = useTransform(wholeBlur, (v) => `blur(${v}px)`)

    // ── Per-word stagger ranges ──────────────────────────────────────
    const words = text.split(/\s+/)
    const totalWords = words.length

    const clampedFontSize = `clamp(${mobileFontSize}px, 5vw, ${fontSize}px)`

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                backgroundColor,
                padding: `0 ${paddingX}%`,
                boxSizing: "border-box",
            }}
        >
            {perWord ? (
                <p
                    style={{
                        fontFamily,
                        fontWeight,
                        fontSize: clampedFontSize,
                        lineHeight,
                        letterSpacing: `${letterSpacing}em`,
                        color: textColor,
                        margin: 0,
                        maxWidth: "100%",
                    }}
                >
                    {words.map((word, i) => {
                        const wordStart = i * staggerAmount
                        const wordEnd = wordStart + scrollEnd

                        return (
                            <span key={i}>
                                <Word
                                    word={word}
                                    scrollYProgress={scrollYProgress}
                                    start={wordStart}
                                    end={wordEnd}
                                    enableBlur={enableBlur}
                                />
                                {i < totalWords - 1 && "\u00A0"}
                            </span>
                        )
                    })}
                </p>
            ) : (
                <motion.p
                    style={{
                        fontFamily,
                        fontWeight,
                        fontSize: clampedFontSize,
                        lineHeight,
                        letterSpacing: `${letterSpacing}em`,
                        color: textColor,
                        margin: 0,
                        maxWidth: "100%",
                        opacity: wholeOpacity,
                        filter: enableBlur ? wholeFilter : "none",
                        willChange: "opacity, filter",
                    }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    )
}

// ── Framer property controls ─────────────────────────────────────────
addPropertyControls(ScrollTextOpacity, {
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "We exist to close the access gap in healthcare",
        displayTextArea: true,
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font Family",
        defaultValue: "Inter, sans-serif",
        description:
            "Use any font installed in your Framer project (e.g. 'PP Neue Montreal', 'DM Serif Display')",
    },
    fontWeight: {
        type: ControlType.Number,
        title: "Font Weight",
        defaultValue: 700,
        min: 100,
        max: 900,
        step: 100,
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size (desktop)",
        defaultValue: 84,
        min: 24,
        max: 200,
        unit: "px",
    },
    mobileFontSize: {
        type: ControlType.Number,
        title: "Font Size (mobile)",
        defaultValue: 40,
        min: 16,
        max: 120,
        unit: "px",
    },
    lineHeight: {
        type: ControlType.Number,
        title: "Line Height",
        defaultValue: 1.08,
        min: 0.8,
        max: 2,
        step: 0.01,
    },
    letterSpacing: {
        type: ControlType.Number,
        title: "Letter Spacing",
        defaultValue: -0.03,
        min: -0.1,
        max: 0.2,
        step: 0.005,
        unit: "em",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#1E1E1E",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#EAE6D8",
    },
    paddingX: {
        type: ControlType.Number,
        title: "Horizontal Padding",
        defaultValue: 10,
        min: 0,
        max: 25,
        unit: "%",
    },
    scrollEnd: {
        type: ControlType.Number,
        title: "Scroll End",
        defaultValue: 0.6,
        min: 0.2,
        max: 1,
        step: 0.05,
        description:
            "Scroll progress (0–1) at which text reaches full opacity",
    },
    perWord: {
        type: ControlType.Boolean,
        title: "Per-Word Animation",
        defaultValue: true,
        description: "Animate each word individually with stagger",
    },
    enableBlur: {
        type: ControlType.Boolean,
        title: "Blur Effect",
        defaultValue: true,
        description: "Blur(6px) → blur(0) tied to scroll",
    },
    staggerAmount: {
        type: ControlType.Number,
        title: "Word Stagger",
        defaultValue: 0.04,
        min: 0,
        max: 0.15,
        step: 0.005,
        hidden: (props) => !props.perWord,
        description:
            "Scroll offset between each word's animation start",
    },
})
