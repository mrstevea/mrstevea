"use client"

import { addPropertyControls, ControlType } from "framer"
import React, { CSSProperties } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Testimonial {
    quote: string
    name: string
    title: string
}

// Framer font controls return a CSSProperties-compatible object
type FontValue = CSSProperties

// ─── Default data ─────────────────────────────────────────────────────────────

const defaultCol1: Testimonial[] = [
    {
        quote: "Complex tax documents that used to take hours to review are now handled in minutes.",
        name: "Accounting Director",
        title: "Director at a Global Accounting Firm",
    },
    {
        quote: "You're honestly blowing my mind… you are literally going to save me millions of dollars.",
        name: "Golden Falcon",
        title: "Partner at a Global Acquisition Corp",
    },
    {
        quote: "It was acting like a senior manager level financial modeler.",
        name: "Investment Analyst",
        title: "Analyst at a Private Equity Firm",
    },
    {
        quote: "I haven't touched a spreadsheet in three weeks. That alone is worth everything.",
        name: "Finance Director",
        title: "Director at a Mid-Market PE Fund",
    },
]

const defaultCol2: Testimonial[] = [
    {
        quote: "If we can do that now… that's a game changer in my view.",
        name: "Asset Manager MD",
        title: "Head of Data at a Tier-1 Asset Manager",
    },
    {
        quote: "I wanted a tool to summarize investments… that would be a dream. And I think it's not a dream anymore.",
        name: "Portfolio Manager",
        title: "PM at a Leading Credit Fund",
    },
    {
        quote: "The depth of analysis it produces overnight used to take my team a full week.",
        name: "Accounting Partner",
        title: "Partner at a National Accounting Firm",
    },
    {
        quote: "We're seeing deals we would have missed entirely. The speed changes everything.",
        name: "Managing Director",
        title: "MD at a Global Infrastructure Fund",
    },
]

const defaultCol3: Testimonial[] = [
    {
        quote: "This is really so powerful… I feel pretty confident this is going to be 100 times better than the previous concierge.",
        name: "Private Markets Investor",
        title: "Executive at a Top 5 Alternative Asset Manager",
    },
    {
        quote: "In an hour, you've built something that potentially could save us 40k a year.",
        name: "Accounting Manager",
        title: "Manager at a Global Accounting Firm",
    },
    {
        quote: "It surfaced a covenant breach risk we almost missed. This isn't a nice-to-have anymore.",
        name: "Risk Officer",
        title: "CRO at a Regional Asset Manager",
    },
    {
        quote: "Our ops team went from data wrangling to actual analysis. Night and day difference.",
        name: "Operations Lead",
        title: "Head of Ops at a Growth Equity Firm",
    },
]

// ─── Font defaults ────────────────────────────────────────────────────────────

const defaultQuoteFont: FontValue = {
    fontFamily: "Inter, sans-serif",
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.45,
    letterSpacing: "-0.01em",
    color: "#1A1A1A",
}

const defaultNameFont: FontValue = {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.3,
    color: "#1A1A1A",
}

const defaultRoleFont: FontValue = {
    fontFamily: "Inter, sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.4,
    color: "#888888",
}

// ─── Keyframes injected once ──────────────────────────────────────────────────

const STYLE_ID = "testimonial-scroll-keyframes"

function injectKeyframes() {
    if (typeof document === "undefined") return
    if (document.getElementById(STYLE_ID)) return
    const el = document.createElement("style")
    el.id = STYLE_ID
    el.textContent = `
        @keyframes tsScrollUp {
            from { transform: translateY(0); }
            to   { transform: translateY(-50%); }
        }
        @keyframes tsScrollDown {
            from { transform: translateY(-50%); }
            to   { transform: translateY(0); }
        }
    `
    document.head.appendChild(el)
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function QuoteIcon({ color }: { color: string }) {
    return (
        <svg
            width="32"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", marginBottom: 16, opacity: 0.25 }}
        >
            <path
                d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0L16 2.4C11.2 3.6 8.4 6.4 8 10.4H14.4V24H0ZM17.6 24V14.4C17.6 6.4 22.4 1.6 32 0L33.6 2.4C28.8 3.6 26 6.4 25.6 10.4H32V24H17.6Z"
                fill={color}
            />
        </svg>
    )
}

function TestimonialCard({
    testimonial,
    cardBackground,
    cardBorderColor,
    iconColor,
    borderRadius,
    quoteFont,
    nameFont,
    roleFont,
}: {
    testimonial: Testimonial
    cardBackground: string
    cardBorderColor: string
    iconColor: string
    borderRadius: number
    quoteFont: FontValue
    nameFont: FontValue
    roleFont: FontValue
}) {
    return (
        <div
            style={{
                background: cardBackground,
                border: `1px solid ${cardBorderColor}`,
                borderRadius,
                padding: "28px 28px 24px",
                marginBottom: 16,
                boxSizing: "border-box",
            }}
        >
            <QuoteIcon color={iconColor} />
            <p
                style={{
                    margin: "0 0 24px",
                    ...quoteFont,
                }}
            >
                {testimonial.quote}
            </p>
            <div>
                <div style={{ marginBottom: 2, ...nameFont }}>
                    {testimonial.name}
                </div>
                <div style={{ ...roleFont }}>
                    {testimonial.title}
                </div>
            </div>
        </div>
    )
}

// ─── Scroll Column ────────────────────────────────────────────────────────────

function ScrollColumn({
    testimonials,
    duration,
    reverse,
    cardBackground,
    cardBorderColor,
    iconColor,
    borderRadius,
    quoteFont,
    nameFont,
    roleFont,
}: {
    testimonials: Testimonial[]
    duration: number
    reverse: boolean
    cardBackground: string
    cardBorderColor: string
    iconColor: string
    borderRadius: number
    quoteFont: FontValue
    nameFont: FontValue
    roleFont: FontValue
}) {
    injectKeyframes()

    const items = testimonials.length > 0
        ? testimonials
        : [{ quote: "Add a testimonial…", name: "Name", title: "Title" }]
    const doubled = [...items, ...items]

    const trackStyle: CSSProperties = {
        animation: `${reverse ? "tsScrollDown" : "tsScrollUp"} ${duration}s linear infinite`,
        willChange: "transform",
    }

    const sharedCardProps = {
        cardBackground,
        cardBorderColor,
        iconColor,
        borderRadius,
        quoteFont,
        nameFont,
        roleFont,
    }

    return (
        <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
            <div style={trackStyle}>
                {doubled.map((t, i) => (
                    <TestimonialCard key={i} testimonial={t} {...sharedCardProps} />
                ))}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    speed: number
    columnGap: number
    sectionHeight: number
    fadeSize: number
    background: string
    cardBackground: string
    cardBorderColor: string
    iconColor: string
    borderRadius: number
    alternateDirection: boolean
    quoteFont: FontValue
    nameFont: FontValue
    roleFont: FontValue
    col1: Testimonial[]
    col2: Testimonial[]
    col3: Testimonial[]
}

/**
 * TestimonialScroll
 *
 * An infinite-scrolling testimonial grid with top/bottom fade masks.
 * All testimonials and typography are fully editable from the
 * Framer properties panel.
 */
export default function TestimonialScroll({
    speed = 35,
    columnGap = 16,
    sectionHeight = 700,
    fadeSize = 180,
    background = "#F2F2F0",
    cardBackground = "#FFFFFF",
    cardBorderColor = "#E8E8E8",
    iconColor = "#1A1A1A",
    borderRadius = 16,
    alternateDirection = true,
    quoteFont = defaultQuoteFont,
    nameFont = defaultNameFont,
    roleFont = defaultRoleFont,
    col1 = defaultCol1,
    col2 = defaultCol2,
    col3 = defaultCol3,
}: Props) {
    const baseDuration = 180 / Math.max(speed, 1)

    const colSpeeds = [baseDuration, baseDuration * 1.25, baseDuration * 0.9]
    const colDirections = alternateDirection ? [false, true, false] : [false, false, false]

    const sharedColProps = {
        cardBackground,
        cardBorderColor,
        iconColor,
        borderRadius,
        quoteFont,
        nameFont,
        roleFont,
    }

    const maskImage = `linear-gradient(
        to bottom,
        transparent 0px,
        black ${fadeSize}px,
        black calc(100% - ${fadeSize}px),
        transparent 100%
    )`

    return (
        <div
            style={{
                width: "100%",
                height: sectionHeight,
                background,
                overflow: "hidden",
                position: "relative",
                WebkitMaskImage: maskImage,
                maskImage,
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: columnGap,
                    height: "100%",
                    padding: "0 4px",
                    boxSizing: "border-box",
                }}
            >
                {[col1, col2, col3].map((col, idx) => (
                    <ScrollColumn
                        key={idx}
                        testimonials={col}
                        duration={colSpeeds[idx]}
                        reverse={colDirections[idx]}
                        {...sharedColProps}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Property Controls ────────────────────────────────────────────────────────

const testimonialItem = {
    type: ControlType.Object,
    controls: {
        quote: {
            type: ControlType.String,
            title: "Quote",
            displayTextArea: true,
        },
        name: {
            type: ControlType.String,
            title: "Name",
        },
        title: {
            type: ControlType.String,
            title: "Title",
        },
    },
}

addPropertyControls(TestimonialScroll, {
    // ── Typography ──────────────────────────────────────────────────────────
    quoteFont: {
        type: ControlType.Font,
        title: "Quote",
        controls: "extended",
        defaultValue: defaultQuoteFont,
    },
    nameFont: {
        type: ControlType.Font,
        title: "Name",
        controls: "extended",
        defaultValue: defaultNameFont,
    },
    roleFont: {
        type: ControlType.Font,
        title: "Role",
        controls: "extended",
        defaultValue: defaultRoleFont,
    },
    // ── Content ─────────────────────────────────────────────────────────────
    col1: {
        type: ControlType.Array,
        title: "Column 1",
        control: testimonialItem,
    },
    col2: {
        type: ControlType.Array,
        title: "Column 2",
        control: testimonialItem,
    },
    col3: {
        type: ControlType.Array,
        title: "Column 3",
        control: testimonialItem,
    },
    // ── Layout ──────────────────────────────────────────────────────────────
    speed: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 35,
        min: 5,
        max: 100,
        step: 1,
        displayStepper: true,
    },
    sectionHeight: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 700,
        min: 300,
        max: 1200,
        step: 10,
        displayStepper: true,
    },
    fadeSize: {
        type: ControlType.Number,
        title: "Fade Size",
        defaultValue: 180,
        min: 0,
        max: 400,
        step: 10,
        displayStepper: true,
    },
    columnGap: {
        type: ControlType.Number,
        title: "Column Gap",
        defaultValue: 16,
        min: 0,
        max: 48,
        step: 4,
        displayStepper: true,
    },
    alternateDirection: {
        type: ControlType.Boolean,
        title: "Alternate Dir",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    // ── Colors ──────────────────────────────────────────────────────────────
    background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#F2F2F0",
    },
    cardBackground: {
        type: ControlType.Color,
        title: "Card BG",
        defaultValue: "#FFFFFF",
    },
    cardBorderColor: {
        type: ControlType.Color,
        title: "Card Border",
        defaultValue: "#E8E8E8",
    },
    iconColor: {
        type: ControlType.Color,
        title: "Icon Color",
        defaultValue: "#1A1A1A",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 16,
        min: 0,
        max: 32,
        step: 2,
        displayStepper: true,
    },
})
