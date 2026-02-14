import { useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  type Variants,
} from "framer-motion";
import {
  EASING,
  SPRING,
  TIMING,
  containerVariants,
  headlineEnterVariants,
  layoutItemVariants,
  ctaEnterVariants,
  glowPulseVariants,
  floatingVariants,
  iconVariants,
} from "../animations";
import "../styles/hero.css";

// ─── Content definitions for Start & End states ─────────────────────
// Replace these with your actual Figma content from nodes 992-3755 / 992-3772

interface HeroState {
  badge: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  cards: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

const START_STATE: HeroState = {
  badge: "Now in Beta",
  headline: "Take Control of Your",
  headlineAccent: "Spending",
  subheadline:
    "Set intelligent rules that automatically manage your transactions, budgets, and financial goals — all in one place.",
  ctaPrimary: "Get Started Free",
  ctaSecondary: "See How It Works",
  cards: [
    {
      icon: "📊",
      title: "Smart Rules Engine",
      description:
        "Create custom spending rules that adapt to your habits and financial goals.",
    },
    {
      icon: "🔒",
      title: "Secure by Default",
      description:
        "Bank-level encryption protects your data and transactions at every step.",
    },
    {
      icon: "⚡",
      title: "Instant Insights",
      description:
        "Real-time analytics show where your money goes the moment it moves.",
    },
  ],
};

const END_STATE: HeroState = {
  badge: "Trusted by 10,000+ users",
  headline: "Your Money, Your",
  headlineAccent: "Rules",
  subheadline:
    "From automated savings to spending limits and merchant blocks — SpendRule gives you complete control over every dollar.",
  ctaPrimary: "Start Building Rules",
  ctaSecondary: "View Pricing",
  cards: [
    {
      icon: "🎯",
      title: "Goal-Based Budgets",
      description:
        "Allocate funds toward goals and let SpendRule enforce your budget automatically.",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description:
        "Get alerted before you overspend with predictive warnings and nudges.",
    },
    {
      icon: "🔗",
      title: "Connect Everything",
      description:
        "Link all your accounts, cards, and wallets for a unified spending view.",
    },
  ],
};

// ─── Shared text crossfade variant ──────────────────────────────────

const textCrossfade: Variants = {
  enter: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: EASING.enter,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: EASING.exit,
    },
  },
};

// ─── Card stagger variant ───────────────────────────────────────────

const cardStagger: Variants = {
  enter: { opacity: 0, y: 30, scale: 0.95 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.layoutShift },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.97,
    transition: { duration: 0.25, ease: EASING.exit },
  },
};

// ─── Main Component ─────────────────────────────────────────────────

export function HeroAnimation() {
  const [currentState, setCurrentState] = useState<"start" | "end">("start");
  const [hasLoaded, setHasLoaded] = useState(false);
  const controls = useAnimation();

  const heroContent = currentState === "start" ? START_STATE : END_STATE;

  // Scene 1: Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-transition demo (toggles between states)
  useEffect(() => {
    if (!hasLoaded) return;

    const interval = setInterval(() => {
      setCurrentState((prev) => (prev === "start" ? "end" : "start"));
    }, 4000);

    return () => clearInterval(interval);
  }, [hasLoaded]);

  // Trigger idle animations after transition completes
  useEffect(() => {
    if (hasLoaded) {
      const timer = setTimeout(() => {
        controls.start("idle");
      }, TIMING.idle.delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded, currentState, controls]);

  const toggleState = useCallback(() => {
    setCurrentState((prev) => (prev === "start" ? "end" : "start"));
  }, []);

  return (
    <motion.section
      className="hero"
      variants={containerVariants}
      initial="hidden"
      animate={hasLoaded ? currentState : "hidden"}
    >
      {/* Background ambient glow */}
      <motion.div
        className="hero__bg-gradient"
        animate={{
          scale: currentState === "start" ? 1 : 1.15,
          opacity: currentState === "start" ? 0.5 : 0.7,
        }}
        transition={{ duration: 1.2, ease: EASING.primary }}
      />

      {/* Navigation */}
      <motion.nav
        className="hero__nav"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASING.enter, delay: 0.1 }}
      >
        <div className="hero__logo">
          Spend<span>Rule</span>
        </div>
        <ul className="hero__nav-links">
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </motion.nav>

      {/* Main content area */}
      <motion.div
        className="hero__inner"
        variants={containerVariants}
      >
        {/* ── Text Block ─────────────────────────────────────────── */}
        <div className="hero__text-block">
          {/* Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroContent.badge}
              className="hero__badge"
              variants={textCrossfade}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <span className="hero__badge-dot" />
              {heroContent.badge}
            </motion.div>
          </AnimatePresence>

          {/* Headline — Scene 2 crossfade */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={heroContent.headline + heroContent.headlineAccent}
              className="hero__headline"
              variants={headlineEnterVariants}
              initial="hidden"
              animate="visible"
              exit={{
                opacity: 0,
                y: -16,
                filter: "blur(4px)",
                transition: { duration: 0.3, ease: EASING.exit },
              }}
            >
              {heroContent.headline}{" "}
              <span className="hero__headline-accent">
                {heroContent.headlineAccent}
              </span>
            </motion.h1>
          </AnimatePresence>

          {/* Subheadline */}
          <AnimatePresence mode="wait">
            <motion.p
              key={heroContent.subheadline}
              className="hero__subheadline"
              variants={textCrossfade}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {heroContent.subheadline}
            </motion.p>
          </AnimatePresence>

          {/* ── CTA Buttons — Scene 4 ────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroContent.ctaPrimary}
              className="hero__cta-group"
              variants={ctaEnterVariants}
              initial="hidden"
              animate="visible"
              exit={{
                opacity: 0,
                scale: 0.9,
                transition: { duration: 0.25, ease: EASING.exit },
              }}
            >
              {/* Primary CTA with glow pulse (Scene 5) */}
              <motion.button
                className="hero__cta-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={controls}
                variants={glowPulseVariants}
              >
                {heroContent.ctaPrimary}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </motion.button>

              <motion.button
                className="hero__cta-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {heroContent.ctaSecondary}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Illustration / Dashboard Preview — Scene 3 + 5 ─────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentState + "-illustration"}
            className="hero__illustration"
            variants={layoutItemVariants}
            initial="hidden"
            animate={currentState}
            exit={{
              opacity: 0,
              scale: 0.97,
              transition: { duration: 0.3, ease: EASING.exit },
            }}
          >
            <motion.div
              className="hero__illustration-inner"
              animate={controls}
              variants={floatingVariants}
            >
              {/* Replace with your actual illustration / dashboard SVG */}
              <DashboardPreview state={currentState} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ── Feature Cards Grid — Scene 3 ───────────────────────── */}
        <motion.div className="hero__grid" layout>
          <AnimatePresence mode="wait">
            {heroContent.cards.map((card, i) => (
              <motion.div
                key={card.title}
                className="hero__card"
                variants={cardStagger}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ delay: i * 0.08 }}
                layout
              >
                <motion.div
                  className="hero__card-icon"
                  variants={iconVariants}
                  initial="hidden"
                  animate={currentState}
                >
                  {card.icon}
                </motion.div>
                <h3 className="hero__card-title">{card.title}</h3>
                <p className="hero__card-desc">{card.description}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ── Manual toggle for demo / preview ─────────────────────── */}
      <motion.button
        onClick={toggleState}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          padding: "10px 20px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          cursor: "pointer",
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
        whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.12)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Toggle State: {currentState === "start" ? "Start → End" : "End → Start"}
      </motion.button>
    </motion.section>
  );
}

// ─── Dashboard Preview Placeholder ──────────────────────────────────
// Replace this with your actual Figma illustration export (SVG recommended)

function DashboardPreview({ state }: { state: "start" | "end" }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 640 }}
    >
      {/* Background */}
      <rect width="640" height="360" rx="12" fill="#1a1f2e" />

      {/* Top bar */}
      <rect x="20" y="20" width="600" height="40" rx="8" fill="#252b3d" />
      <circle cx="44" cy="40" r="8" fill="#6366f1" opacity="0.6" />
      <rect x="64" y="34" width="80" height="12" rx="4" fill="#374151" />
      <rect x="480" y="32" width="120" height="16" rx="6" fill="#6366f1" opacity="0.15" />

      {/* Content area changes based on state */}
      <AnimatePresence mode="wait">
        {state === "start" ? (
          <motion.g
            key="start-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Spending overview chart */}
            <rect x="20" y="80" width="290" height="160" rx="10" fill="#252b3d" />
            <text x="40" y="108" fill="#9CA3AF" fontSize="11" fontFamily="Inter">
              Monthly Spending
            </text>
            {/* Bar chart */}
            <rect x="40" y="200" width="32" height="24" rx="4" fill="#6366f1" opacity="0.4" />
            <rect x="82" y="175" width="32" height="49" rx="4" fill="#6366f1" opacity="0.6" />
            <rect x="124" y="150" width="32" height="74" rx="4" fill="#6366f1" opacity="0.8" />
            <rect x="166" y="170" width="32" height="54" rx="4" fill="#6366f1" opacity="0.5" />
            <rect x="208" y="130" width="32" height="94" rx="4" fill="#6366f1" />
            <rect x="250" y="160" width="32" height="64" rx="4" fill="#8b5cf6" opacity="0.7" />

            {/* Rules list */}
            <rect x="330" y="80" width="290" height="160" rx="10" fill="#252b3d" />
            <text x="350" y="108" fill="#9CA3AF" fontSize="11" fontFamily="Inter">
              Active Rules
            </text>
            <rect x="350" y="120" width="250" height="28" rx="6" fill="#1a1f2e" />
            <rect x="350" y="156" width="250" height="28" rx="6" fill="#1a1f2e" />
            <rect x="350" y="192" width="250" height="28" rx="6" fill="#1a1f2e" />
            <circle cx="368" cy="134" r="6" fill="#10b981" />
            <circle cx="368" cy="170" r="6" fill="#10b981" />
            <circle cx="368" cy="206" r="6" fill="#f59e0b" />

            {/* Bottom stats */}
            <rect x="20" y="260" width="190" height="80" rx="10" fill="#252b3d" />
            <rect x="225" y="260" width="190" height="80" rx="10" fill="#252b3d" />
            <rect x="430" y="260" width="190" height="80" rx="10" fill="#252b3d" />
            <text x="40" y="290" fill="#9CA3AF" fontSize="10" fontFamily="Inter">
              Total Saved
            </text>
            <text x="40" y="318" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="Inter">
              $2,847
            </text>
            <text x="245" y="290" fill="#9CA3AF" fontSize="10" fontFamily="Inter">
              Rules Active
            </text>
            <text x="245" y="318" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="Inter">
              12
            </text>
            <text x="450" y="290" fill="#9CA3AF" fontSize="10" fontFamily="Inter">
              Blocked
            </text>
            <text x="450" y="318" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="Inter">
              7 txns
            </text>
          </motion.g>
        ) : (
          <motion.g
            key="end-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Goal-based view */}
            <rect x="20" y="80" width="290" height="160" rx="10" fill="#252b3d" />
            <text x="40" y="108" fill="#9CA3AF" fontSize="11" fontFamily="Inter">
              Budget Goals
            </text>
            {/* Progress bars */}
            <rect x="40" y="126" width="250" height="8" rx="4" fill="#1a1f2e" />
            <rect x="40" y="126" width="180" height="8" rx="4" fill="#6366f1" />
            <text x="40" y="120" fill="#E5E7EB" fontSize="10" fontFamily="Inter">
              Groceries
            </text>
            <rect x="40" y="162" width="250" height="8" rx="4" fill="#1a1f2e" />
            <rect x="40" y="162" width="120" height="8" rx="4" fill="#8b5cf6" />
            <text x="40" y="156" fill="#E5E7EB" fontSize="10" fontFamily="Inter">
              Entertainment
            </text>
            <rect x="40" y="198" width="250" height="8" rx="4" fill="#1a1f2e" />
            <rect x="40" y="198" width="220" height="8" rx="4" fill="#10b981" />
            <text x="40" y="192" fill="#E5E7EB" fontSize="10" fontFamily="Inter">
              Savings
            </text>

            {/* Connected accounts */}
            <rect x="330" y="80" width="290" height="160" rx="10" fill="#252b3d" />
            <text x="350" y="108" fill="#9CA3AF" fontSize="11" fontFamily="Inter">
              Connected Accounts
            </text>
            <rect x="350" y="120" width="250" height="32" rx="8" fill="#1a1f2e" />
            <rect x="350" y="160" width="250" height="32" rx="8" fill="#1a1f2e" />
            <rect x="350" y="200" width="250" height="32" rx="8" fill="#1a1f2e" />
            <circle cx="370" cy="136" r="8" fill="#6366f1" opacity="0.5" />
            <circle cx="370" cy="176" r="8" fill="#8b5cf6" opacity="0.5" />
            <circle cx="370" cy="216" r="8" fill="#10b981" opacity="0.5" />
            <rect x="386" y="130" width="80" height="10" rx="3" fill="#374151" />
            <rect x="386" y="170" width="65" height="10" rx="3" fill="#374151" />
            <rect x="386" y="210" width="90" height="10" rx="3" fill="#374151" />

            {/* Updated stats */}
            <rect x="20" y="260" width="190" height="80" rx="10" fill="#252b3d" />
            <rect x="225" y="260" width="190" height="80" rx="10" fill="#252b3d" />
            <rect x="430" y="260" width="190" height="80" rx="10" fill="#252b3d" />
            <text x="40" y="290" fill="#9CA3AF" fontSize="10" fontFamily="Inter">
              Total Saved
            </text>
            <text x="40" y="318" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="Inter">
              $5,120
            </text>
            <text x="245" y="290" fill="#9CA3AF" fontSize="10" fontFamily="Inter">
              Accounts
            </text>
            <text x="245" y="318" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="Inter">
              6
            </text>
            <text x="450" y="290" fill="#9CA3AF" fontSize="10" fontFamily="Inter">
              Goals Hit
            </text>
            <text x="450" y="318" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="Inter">
              4 / 5
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
