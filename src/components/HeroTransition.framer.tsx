/**
 * SpendRule Hero Transition — Framer Code Component
 *
 * Drop this file directly into Framer's Code Editor to get a
 * self-contained animated hero that transitions between two states.
 *
 * The component uses Framer Motion (built into Framer) and
 * implements all 5 animation scenes from the storyboard:
 *   1. Initial load (fade + scale)
 *   2. Text crossfade (headline / subheadline)
 *   3. Layout shift (grid reposition with springs)
 *   4. CTA pop animation
 *   5. Idle micro-interactions (glow + float)
 *
 * To customize:
 *   - Update START_CONTENT / END_CONTENT with your Figma text
 *   - Replace placeholder SVGs with your exported assets
 *   - Adjust brand colors in the `theme` object
 */

import { useState, useEffect } from "react";
import { addPropertyControls, ControlType } from "framer";
import {
  motion,
  AnimatePresence,
  useAnimation,
} from "framer-motion";

// ─── Brand Theme ────────────────────────────────────────────────────

const theme = {
  bg: "#0B0F1A",
  bgCard: "#111827",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  accent: "#6366F1",
  accentLight: "#818CF8",
  accentGlow: "rgba(99, 102, 241, 0.25)",
  gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  border: "rgba(255, 255, 255, 0.06)",
  font: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

// ─── Easing ─────────────────────────────────────────────────────────

const ease = {
  enter: [0.4, 0.0, 0.2, 1] as const,
  exit: [0.0, 0.0, 0.2, 1] as const,
};

const spring = {
  layout: { type: "spring" as const, stiffness: 300, damping: 30 },
  cta: { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.8 },
};

// ─── Content States ─────────────────────────────────────────────────

const START_CONTENT = {
  badge: "Now in Beta",
  headline: "Take Control of Your",
  headlineAccent: "Spending",
  sub: "Set intelligent rules that automatically manage your transactions, budgets, and financial goals.",
  cta1: "Get Started Free",
  cta2: "See How It Works",
  cards: [
    { icon: "📊", title: "Smart Rules Engine", desc: "Create custom spending rules that adapt to your habits." },
    { icon: "🔒", title: "Secure by Default", desc: "Bank-level encryption protects your data at every step." },
    { icon: "⚡", title: "Instant Insights", desc: "Real-time analytics show where your money goes." },
  ],
};

const END_CONTENT = {
  badge: "Trusted by 10,000+ users",
  headline: "Your Money, Your",
  headlineAccent: "Rules",
  sub: "From automated savings to spending limits — SpendRule gives you complete control over every dollar.",
  cta1: "Start Building Rules",
  cta2: "View Pricing",
  cards: [
    { icon: "🎯", title: "Goal-Based Budgets", desc: "Allocate funds and let SpendRule enforce your budget." },
    { icon: "🔔", title: "Smart Notifications", desc: "Predictive warnings before you overspend." },
    { icon: "🔗", title: "Connect Everything", desc: "Link all accounts for a unified spending view." },
  ],
};

// ─── Crossfade variant ──────────────────────────────────────────────

const crossfade = {
  enter: { opacity: 0, y: 20, filter: "blur(4px)" },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: ease.enter },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: ease.exit },
  },
};

// ─── Component ──────────────────────────────────────────────────────

interface Props {
  autoPlay?: boolean;
  interval?: number;
}

export function HeroTransition({ autoPlay = true, interval = 4 }: Props) {
  const [state, setState] = useState<"start" | "end">("start");
  const [loaded, setLoaded] = useState(false);
  const idleCtrl = useAnimation();
  const content = state === "start" ? START_CONTENT : END_CONTENT;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!autoPlay || !loaded) return;
    const id = setInterval(() => setState((s) => (s === "start" ? "end" : "start")), interval * 1000);
    return () => clearInterval(id);
  }, [autoPlay, interval, loaded]);

  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => idleCtrl.start("idle"), 1200);
      return () => clearTimeout(t);
    }
  }, [loaded, state, idleCtrl]);

  return (
    <motion.div
      style={{ ...styles.hero, fontFamily: theme.font }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={loaded ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.5, ease: ease.enter }}
    >
      {/* Ambient glow */}
      <motion.div
        style={styles.glow}
        animate={{
          scale: state === "start" ? 1 : 1.15,
          opacity: state === "start" ? 0.4 : 0.6,
        }}
        transition={{ duration: 1.2, ease: ease.enter }}
      />

      {/* Badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={content.badge}
          style={styles.badge}
          variants={crossfade}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <div style={styles.badgeDot} />
          {content.badge}
        </motion.div>
      </AnimatePresence>

      {/* Headline */}
      <AnimatePresence mode="wait">
        <motion.h1
          key={content.headline}
          style={styles.headline}
          variants={crossfade}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {content.headline}{" "}
          <span style={styles.accent}>{content.headlineAccent}</span>
        </motion.h1>
      </AnimatePresence>

      {/* Subheadline */}
      <AnimatePresence mode="wait">
        <motion.p
          key={content.sub}
          style={styles.sub}
          variants={crossfade}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {content.sub}
        </motion.p>
      </AnimatePresence>

      {/* CTAs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={content.cta1}
          style={styles.ctaGroup}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
          transition={{ ...spring.cta, delay: 0.15 }}
        >
          <motion.button
            style={styles.ctaPrimary}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={idleCtrl}
            variants={{
              idle: {
                boxShadow: [
                  "0 0 0px rgba(99,102,241,0)",
                  "0 0 20px rgba(99,102,241,0.3)",
                  "0 0 0px rgba(99,102,241,0)",
                ],
                transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              },
            }}
          >
            {content.cta1} →
          </motion.button>
          <motion.button
            style={styles.ctaSecondary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {content.cta2}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Cards */}
      <motion.div style={styles.grid} layout>
        <AnimatePresence mode="wait">
          {content.cards.map((card, i) => (
            <motion.div
              key={card.title}
              style={styles.card}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.25 } }}
              transition={{ ...spring.layout, delay: 0.2 + i * 0.08 }}
              layout
            >
              <div style={styles.cardIcon}>{card.icon}</div>
              <div style={styles.cardTitle}>{card.title}</div>
              <div style={styles.cardDesc}>{card.desc}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Framer Property Controls
addPropertyControls(HeroTransition, {
  autoPlay: {
    type: ControlType.Boolean,
    title: "Auto Play",
    defaultValue: true,
  },
  interval: {
    type: ControlType.Number,
    title: "Interval (s)",
    defaultValue: 4,
    min: 2,
    max: 10,
    step: 0.5,
  },
});

// ─── Styles ─────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  hero: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    padding: "80px 24px 60px",
    background: theme.bg,
    overflow: "hidden",
    color: theme.text,
  },
  glow: {
    position: "absolute",
    top: "-20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 800,
    height: 800,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
    pointerEvents: "none",
    zIndex: 0,
  },
  badge: {
    position: "relative",
    zIndex: 2,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px",
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 500,
    color: theme.accentLight,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: theme.accent,
  },
  headline: {
    position: "relative",
    zIndex: 2,
    fontSize: "clamp(2.25rem, 5vw, 4rem)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    textAlign: "center" as const,
    margin: 0,
    maxWidth: 720,
  },
  accent: {
    background: theme.gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  sub: {
    position: "relative",
    zIndex: 2,
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    fontWeight: 400,
    lineHeight: 1.6,
    color: theme.textMuted,
    textAlign: "center" as const,
    maxWidth: 560,
    margin: 0,
  },
  ctaGroup: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 28px",
    background: theme.gradient,
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 28px",
    background: "transparent",
    color: theme.text,
    fontSize: 15,
    fontWeight: 500,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  grid: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    width: "100%",
    maxWidth: 960,
  },
  card: {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(99,102,241,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.text,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 1.5,
    color: theme.textMuted,
  },
};
