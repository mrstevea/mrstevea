/**
 * TableOfContents — Framer Code Component
 *
 * Drop this file into Framer's code editor. It will:
 *   • Scan the page (or a scoped container) for h2 elements
 *   • Render a clickable, smooth-scrolling ToC list
 *   • Highlight the active heading via IntersectionObserver
 *   • Optionally show a reading-progress bar
 *   • Support sticky positioning and full style customisation
 */

import { addPropertyControls, ControlType } from "framer"
import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type CSSProperties,
    type MouseEvent,
} from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeadingItem {
    id: string
    text: string
    element: HTMLElement
}

interface TocItemProps {
    id: string
    text: string
    isActive: boolean
    fontSize: number
    fontWeight: number
    lineHeight: number
    textColor: string
    hoverColor: string
    activeColor: string
    itemSpacing: number
    indent: number
    onClick: (e: MouseEvent<HTMLAnchorElement>, id: string) => void
}

interface TableOfContentsProps {
    /** CSS selector for the content container; leave empty to scan whole page */
    containerSelector?: string
    /** Pixel offset from the top when scrolling to a heading (e.g. sticky header height) */
    scrollOffset?: number
    fontSize?: number
    fontWeight?: number
    lineHeight?: number
    textColor?: string
    hoverColor?: string
    activeColor?: string
    /** Vertical padding inside each item (px) */
    itemSpacing?: number
    /** Indentation of each item from the left border (px) */
    indent?: number
    /** Stick the ToC to the viewport while scrolling */
    sticky?: boolean
    /** Show a reading-progress bar above the list */
    showProgressBar?: boolean
    progressBarColor?: string
    style?: CSSProperties
}

// ---------------------------------------------------------------------------
// TocItem — single list entry with hover state
// ---------------------------------------------------------------------------

function TocItem({
    id,
    text,
    isActive,
    fontSize,
    fontWeight,
    lineHeight,
    textColor,
    hoverColor,
    activeColor,
    itemSpacing,
    indent,
    onClick,
}: TocItemProps) {
    const [hovered, setHovered] = useState(false)

    const color = isActive ? activeColor : hovered ? hoverColor : textColor
    const opacity = isActive ? 1 : hovered ? 1 : 0.7
    const borderColor = isActive ? activeColor : hovered ? `${hoverColor}40` : "transparent"

    const style: CSSProperties = {
        display: "block",
        color,
        opacity,
        fontSize,
        fontWeight,
        lineHeight,
        // Vertical rhythm via padding rather than margin so the clickable area is larger
        padding: `${itemSpacing}px ${indent}px`,
        textDecoration: "none",
        // Left border doubles as an active indicator
        borderLeft: `2px solid ${borderColor}`,
        // Smooth all visual properties
        transition: "color 200ms ease, opacity 200ms ease, border-color 200ms ease",
        cursor: "pointer",
        boxSizing: "border-box",
        wordBreak: "break-word",
    }

    return (
        <a
            href={`#${id}`}
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => onClick(e, id)}
            aria-current={isActive ? "true" : undefined}
        >
            {text}
        </a>
    )
}

// ---------------------------------------------------------------------------
// TableOfContents — main component
// ---------------------------------------------------------------------------

export default function TableOfContents({
    containerSelector = "",
    scrollOffset = 80,
    fontSize = 14,
    fontWeight = 400,
    lineHeight = 1.6,
    textColor = "#6B7280",
    hoverColor = "#111827",
    activeColor = "#2563EB",
    itemSpacing = 6,
    indent = 14,
    sticky = false,
    showProgressBar = false,
    progressBarColor = "#2563EB",
    style,
}: TableOfContentsProps) {
    const [headings, setHeadings] = useState<HeadingItem[]>([])
    const [activeId, setActiveId] = useState("")
    const [readProgress, setReadProgress] = useState(0)
    // Keep a ref to the IntersectionObserver so we can cleanly replace it
    const intersectionObserver = useRef<IntersectionObserver | null>(null)

    // Build a slug-style ID from heading text + index (index ensures uniqueness)
    const makeId = (text: string, index: number) =>
        `${text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/^-+|-+$/g, "") || "heading"}-toc-${index}`

    // Walk the DOM and collect all h2 elements, assigning IDs as needed
    const scanHeadings = useCallback((): HeadingItem[] => {
        const root = containerSelector
            ? document.querySelector<HTMLElement>(containerSelector)
            : document.body

        if (!root) return []

        return Array.from(root.querySelectorAll<HTMLElement>("h2")).map(
            (el, i) => {
                const text = el.textContent?.trim() || `Section ${i + 1}`
                if (!el.id) el.id = makeId(text, i)
                return { id: el.id, text, element: el }
            }
        )
    }, [containerSelector])

    // Attach an IntersectionObserver to every heading; the topmost visible one becomes active.
    // rootMargin shifts the detection zone below the sticky header (scrollOffset) so the active
    // item flips at the moment the heading enters the "reading window", not just the viewport.
    const attachObserver = useCallback(
        (items: HeadingItem[]) => {
            intersectionObserver.current?.disconnect()

            const observer = new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((e) => e.isIntersecting)
                        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                    if (visible.length > 0) {
                        setActiveId(visible[0].target.id)
                    }
                },
                {
                    // Top offset prevents the active item from flipping while the heading is hidden
                    // behind a sticky header; bottom offset (-55%) means only the upper portion
                    // of the viewport counts as "active reading area".
                    rootMargin: `-${scrollOffset}px 0px -55% 0px`,
                    threshold: 0,
                }
            )

            items.forEach(({ element }) => observer.observe(element))
            intersectionObserver.current = observer
        },
        [scrollOffset]
    )

    // Initial scan + watch for dynamic content insertion (e.g. lazy-loaded rich text)
    useEffect(() => {
        const refresh = () => {
            const items = scanHeadings()
            setHeadings(items)
            if (items.length > 0) attachObserver(items)
        }

        refresh()

        const root = containerSelector
            ? document.querySelector(containerSelector)
            : document.body

        // MutationObserver re-scans when child nodes are added or removed
        const mutObs = new MutationObserver(refresh)
        if (root) mutObs.observe(root, { childList: true, subtree: true })

        return () => {
            mutObs.disconnect()
            intersectionObserver.current?.disconnect()
        }
    }, [containerSelector, scanHeadings, attachObserver])

    // Track reading progress as a percentage of total scrollable height
    useEffect(() => {
        if (!showProgressBar) return

        const onScroll = () => {
            const scrolled = window.scrollY
            const total = document.documentElement.scrollHeight - window.innerHeight
            setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
        }

        window.addEventListener("scroll", onScroll, { passive: true })
        onScroll() // seed initial value
        return () => window.removeEventListener("scroll", onScroll)
    }, [showProgressBar])

    // Smooth-scroll to the heading and manually set the active state immediately
    // so there's no lag between click and highlight
    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>, id: string) => {
            e.preventDefault()
            const target = document.getElementById(id)
            if (!target) return
            const top = target.getBoundingClientRect().top + window.scrollY - scrollOffset
            window.scrollTo({ top, behavior: "smooth" })
            setActiveId(id)
        },
        [scrollOffset]
    )

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    if (headings.length === 0) {
        return (
            <div
                style={{
                    padding: "12px 16px",
                    color: textColor,
                    fontSize,
                    opacity: 0.5,
                    fontStyle: "italic",
                }}
            >
                No headings found on this page
            </div>
        )
    }

    return (
        <nav
            role="navigation"
            aria-label="Table of contents"
            style={{
                position: sticky ? "sticky" : "relative",
                top: sticky ? `${scrollOffset}px` : undefined,
                ...style,
            }}
        >
            {/* Optional reading-progress bar */}
            {showProgressBar && (
                <div
                    style={{
                        height: 2,
                        backgroundColor: "rgba(0, 0, 0, 0.08)",
                        borderRadius: 1,
                        marginBottom: 14,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${readProgress}%`,
                            backgroundColor: progressBarColor,
                            borderRadius: 1,
                            // Use linear so the bar moves in real time without feeling laggy
                            transition: "width 80ms linear",
                        }}
                    />
                </div>
            )}

            {/* Item list */}
            <ul
                style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    // Left border track that the active indicator slides along
                    borderLeft: "2px solid rgba(0, 0, 0, 0.07)",
                }}
            >
                {headings.map(({ id, text }) => (
                    <li key={id} style={{ marginLeft: -2 }}>
                        <TocItem
                            id={id}
                            text={text}
                            isActive={activeId === id}
                            fontSize={fontSize}
                            fontWeight={fontWeight}
                            lineHeight={lineHeight}
                            textColor={textColor}
                            hoverColor={hoverColor}
                            activeColor={activeColor}
                            itemSpacing={itemSpacing}
                            indent={indent}
                            onClick={handleClick}
                        />
                    </li>
                ))}
            </ul>
        </nav>
    )
}

// ---------------------------------------------------------------------------
// Framer Property Controls
// Exposed in the Framer design panel so authors can customise the component
// without touching code.
// ---------------------------------------------------------------------------

addPropertyControls(TableOfContents, {
    containerSelector: {
        type: ControlType.String,
        title: "Container",
        placeholder: ".rich-text or #content",
        description:
            "CSS selector for the content area to scan. Leave blank to scan the whole page.",
        defaultValue: "",
    },
    scrollOffset: {
        type: ControlType.Number,
        title: "Scroll Offset",
        description: "Pixels above the heading to stop when scrolling (e.g. sticky header height).",
        defaultValue: 80,
        min: 0,
        max: 300,
        step: 4,
        displayStepper: true,
    },
    // --- Typography ---
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 14,
        min: 10,
        max: 24,
        step: 1,
        displayStepper: true,
    },
    fontWeight: {
        type: ControlType.Number,
        title: "Font Weight",
        defaultValue: 400,
        min: 100,
        max: 900,
        step: 100,
        displayStepper: true,
    },
    lineHeight: {
        type: ControlType.Number,
        title: "Line Height",
        defaultValue: 1.6,
        min: 1,
        max: 3,
        step: 0.1,
        displayStepper: true,
    },
    // --- Colours ---
    textColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#6B7280",
    },
    hoverColor: {
        type: ControlType.Color,
        title: "Hover",
        defaultValue: "#111827",
    },
    activeColor: {
        type: ControlType.Color,
        title: "Active",
        defaultValue: "#2563EB",
    },
    // --- Spacing ---
    itemSpacing: {
        type: ControlType.Number,
        title: "Item Padding",
        description: "Vertical padding inside each item.",
        defaultValue: 6,
        min: 0,
        max: 32,
        step: 2,
        displayStepper: true,
    },
    indent: {
        type: ControlType.Number,
        title: "Indent",
        description: "Horizontal indentation from the left border.",
        defaultValue: 14,
        min: 0,
        max: 48,
        step: 2,
        displayStepper: true,
    },
    // --- Layout ---
    sticky: {
        type: ControlType.Boolean,
        title: "Sticky",
        defaultValue: false,
        description: "Keeps the ToC fixed to the top while the user scrolls.",
    },
    // --- Progress bar ---
    showProgressBar: {
        type: ControlType.Boolean,
        title: "Progress Bar",
        defaultValue: false,
        description: "Show a reading-progress indicator above the list.",
    },
    progressBarColor: {
        type: ControlType.Color,
        title: "Bar Color",
        defaultValue: "#2563EB",
        hidden(props: TableOfContentsProps) {
            return !props.showProgressBar
        },
    },
})
