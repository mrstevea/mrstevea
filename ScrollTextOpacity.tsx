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

// ── Text content block (shared between modes) ────────────────────────
function TextContent({
    words,
    perWord,
    scrollYProgress,
    scrollEnd,
    staggerAmount,
    enableBlur,
    wholeOpacity,
    wholeFilter,
    fontFamily,
    fontWeight,
    clampedFontSize,
    lineHeight,
    letterSpacing,
    textColor,
    text,
}: {
    words: string[]
    perWord: boolean
    scrollYProgress: MotionValue<number>
    scrollEnd: number
    staggerAmount: number
    enableBlur: boolean
    wholeOpacity: MotionValue<number>
    wholeFilter: MotionValue<string>
    fontFamily: string
    fontWeight: number
    clampedFontSize: string
    lineHeight: number
    letterSpacing: number
    textColor: string
    text: string
}) {
    const totalWords = words.length

    const sharedStyle = {
        fontFamily,
        fontWeight,
        fontSize: clampedFontSize,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
        color: textColor,
        margin: 0,
        maxWidth: "100%",
    }

    if (perWord) {
        return (
            <p style={sharedStyle}>
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
        )
    }

    return (
        <motion.p
            style={{
                ...sharedStyle,
                opacity: wholeOpacity,
                filter: enableBlur ? wholeFilter : "none",
                willChange: "opacity, filter",
            }}
        >
            {text}
        </motion.p>
    )
}

// ── Main component ───────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2000
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
    scrollHeight: number
    stickyAlign: string
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
        scrollHeight = 300,
        stickyAlign = "center",
    } = props

    // Ref goes on the OUTER tall container — this is what we track
    const outerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: outerRef,
        // "start start" = animation begins when outer top hits viewport top
        // "end end"     = animation ends when outer bottom hits viewport bottom
        offset: ["start start", "end end"],
    })

    // ── Whole-text transforms ────────────────────────────────────────
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

    const words = text.split(/\s+/)
    const clampedFontSize = `clamp(${mobileFontSize}px, 5vw, ${fontSize}px)`

    // Vertical alignment for the sticky panel
    const alignMap: Record<string, string> = {
        top: "flex-start",
        center: "center",
        bottom: "flex-end",
    }

    return (
        // OUTER: tall scroll runway — creates the scroll distance
        <div
            ref={outerRef}
            style={{
                position: "relative",
                width: "100%",
                height: `${scrollHeight}vh`,
                backgroundColor,
            }}
        >
            {/* INNER: sticky panel — stays pinned while outer scrolls */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    width: "100%",
                    height: "100vh",
                    display: "flex",
                    alignItems: alignMap[stickyAlign] || "center",
                    justifyContent: "flex-start",
                    padding: `0 ${paddingX}%`,
                    boxSizing: "border-box",
                }}
            >
                <TextContent
                    words={words}
                    perWord={perWord}
                    scrollYProgress={scrollYProgress}
                    scrollEnd={scrollEnd}
                    staggerAmount={staggerAmount}
                    enableBlur={enableBlur}
                    wholeOpacity={wholeOpacity}
                    wholeFilter={wholeFilter}
                    fontFamily={fontFamily}
                    fontWeight={fontWeight}
                    clampedFontSize={clampedFontSize}
                    lineHeight={lineHeight}
                    letterSpacing={letterSpacing}
                    textColor={textColor}
                    text={text}
                />
            </div>
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
    scrollHeight: {
        type: ControlType.Number,
        title: "Scroll Height",
        defaultValue: 300,
        min: 150,
        max: 600,
        step: 10,
        unit: "vh",
        description:
            "Total height of the scroll runway. Higher = slower/longer animation. 300vh is a good default.",
    },
    stickyAlign: {
        type: ControlType.Enum,
        title: "Vertical Align",
        defaultValue: "center",
        options: ["top", "center", "bottom"],
        optionTitles: ["Top", "Center", "Bottom"],
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
