import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { EASING, TIMING } from "../animations";
import "../styles/hero.css";

// ─── Chart data: the orange line path from the Figma end state ──────
// Points trace bottom-left → stepped climb → steep rise to upper-right

const CHART_POINTS = [
  { x: 0, y: 280 },
  { x: 60, y: 270 },
  { x: 120, y: 250 },
  { x: 160, y: 240 },
  { x: 200, y: 235 },
  { x: 240, y: 220 },
  { x: 280, y: 210 },
  { x: 310, y: 200 },
  { x: 340, y: 180 },
  { x: 370, y: 155 },
  { x: 400, y: 140 },
  { x: 430, y: 110 },
  { x: 460, y: 85 },
  { x: 490, y: 70 },
  { x: 520, y: 50 },
  { x: 550, y: 35 },
  { x: 580, y: 30 },
];

function pointsToPath(pts: typeof CHART_POINTS): string {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
    d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function pointsToAreaPath(pts: typeof CHART_POINTS, bottomY: number): string {
  const linePath = pointsToPath(pts);
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  return `${linePath} L ${lastPt.x} ${bottomY} L ${firstPt.x} ${bottomY} Z`;
}

const CHART_LINE_PATH = pointsToPath(CHART_POINTS);
const CHART_AREA_PATH = pointsToAreaPath(CHART_POINTS, 300);

// ─── Main Component ─────────────────────────────────────────────────

export function HeroAnimation() {
  const [currentState, setCurrentState] = useState<"start" | "end">("start");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Scene 1: Initial load
  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-transition: start → end after 2s, then toggle every 4s
  useEffect(() => {
    if (!hasLoaded) return;

    const initialDelay = setTimeout(() => {
      setCurrentState("end");
    }, 2000);

    const interval = setInterval(() => {
      setCurrentState((prev) => (prev === "start" ? "end" : "start"));
    }, 6000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [hasLoaded]);

  const toggleState = useCallback(() => {
    setCurrentState((prev) => (prev === "start" ? "end" : "start"));
  }, []);

  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={hasLoaded ? { opacity: 1, scale: 1 } : undefined}
      transition={{
        duration: TIMING.initialLoad.duration,
        ease: EASING.enter,
      }}
    >
      {/* Main illustration — the card from Figma */}
      <motion.div
        className="hero__card-container"
        initial={{ opacity: 0, y: 24 }}
        animate={hasLoaded ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: 0.6,
          ease: EASING.enter,
          delay: 0.15,
        }}
      >
        <SpendRuleIllustration state={currentState} />
      </motion.div>

      {/* Toggle button for demo */}
      <motion.button
        onClick={toggleState}
        className="hero__toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {currentState === "start" ? "Play Animation →" : "← Reset"}
      </motion.button>
    </motion.section>
  );
}

// ─── SpendRule Illustration (matches Figma exactly) ─────────────────

function SpendRuleIllustration({ state }: { state: "start" | "end" }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const showChart = state === "end";

  // Measure the SVG path length for stroke-dasharray animation
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <svg
      className="hero__illustration-svg"
      viewBox="0 0 600 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Outer card background (light gray rounded rect) ──────── */}
      <rect
        width="600"
        height="320"
        rx="24"
        fill="#ECEEF3"
      />

      {/* ── Subtle grid lines ─────────────────────────────────────── */}
      {[100, 150, 200, 250].map((y) => (
        <motion.line
          key={y}
          x1="30"
          y1={y}
          x2="570"
          y2={y}
          stroke="#D8DAE0"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: showChart ? 0.5 : 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      ))}

      {/* ── Chart area fill (peach/salmon gradient) ───────────────── */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="chartClip">
          <rect x="0" y="0" width="600" height="300" />
        </clipPath>
      </defs>

      <motion.path
        d={CHART_AREA_PATH}
        fill="url(#areaGrad)"
        clipPath="url(#chartClip)"
        initial={{ opacity: 0 }}
        animate={{ opacity: showChart ? 1 : 0 }}
        transition={{
          duration: 0.8,
          ease: EASING.enter,
          delay: showChart ? 0.6 : 0,
        }}
      />

      {/* ── Chart line (orange) — draws left to right ─────────────── */}
      <motion.path
        ref={pathRef}
        d={CHART_LINE_PATH}
        stroke="#F97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{
          strokeDasharray: pathLength || 1000,
          strokeDashoffset: pathLength || 1000,
        }}
        animate={{
          strokeDashoffset: showChart ? 0 : pathLength || 1000,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0.0, 0.2, 1],
          delay: showChart ? 0.3 : 0,
        }}
        style={{
          strokeDasharray: pathLength || 1000,
        }}
      />

      {/* ── Dot at the end of the chart line ──────────────────────── */}
      <motion.circle
        cx={CHART_POINTS[CHART_POINTS.length - 1].x}
        cy={CHART_POINTS[CHART_POINTS.length - 1].y}
        r="5"
        fill="#F97316"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: showChart ? 1 : 0,
          scale: showChart ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: EASING.enter,
          delay: showChart ? 1.4 : 0,
        }}
      />

      {/* ── Glow ring around the end dot ──────────────────────────── */}
      <motion.circle
        cx={CHART_POINTS[CHART_POINTS.length - 1].x}
        cy={CHART_POINTS[CHART_POINTS.length - 1].y}
        r="10"
        fill="none"
        stroke="#F97316"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: showChart ? [0, 0.4, 0] : 0,
          scale: showChart ? [0.5, 1.5, 2] : 0,
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
          delay: showChart ? 1.5 : 0,
          repeat: showChart ? Infinity : 0,
          repeatDelay: 1,
        }}
      />

      {/* ── Stats pill (white card, top-left) ─────────────────────── */}
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASING.enter, delay: 0.3 }}
      >
        {/* Pill background */}
        <rect
          x="28"
          y="24"
          width="200"
          height="88"
          rx="16"
          fill="#FFFFFF"
          filter="url(#pillShadow)"
        />

        {/* "90 - 180 days" label */}
        <text
          x="44"
          y="50"
          fill="#9CA3AF"
          fontSize="12"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
        >
          90 - 180 days
        </text>

        {/* "$120,000" value */}
        <text
          x="44"
          y="78"
          fill="#1F2937"
          fontSize="26"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          letterSpacing="-0.02em"
        >
          $120,000
        </text>

        {/* "↗ 120%" growth indicator */}
        <text
          x="44"
          y="100"
          fill="#16A34A"
          fontSize="13"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
        >
          ↗ 120%
        </text>
      </motion.g>

      {/* ── Shadow filter for the pill ────────────────────────────── */}
      <defs>
        <filter id="pillShadow" x="-4" y="-2" width="220" height="100" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000000" floodOpacity="0.06" />
        </filter>
      </defs>
    </svg>
  );
}
