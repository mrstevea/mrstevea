/**
 * SpendRule Hero Illustration — Framer Code Component
 *
 * Drop this file into Framer's Code Editor for a self-contained
 * animated illustration matching the Figma artboards:
 *   Start (992-3755): Gray card + white stats pill, no chart
 *   End   (992-3772): Same card + orange line chart draws in
 *
 * Animation sequence:
 *   1. Card fades in with scale 98%→100%
 *   2. Stats pill slides up into position
 *   3. Chart line draws left→right (stroke-dashoffset)
 *   4. Area fill fades in beneath the line
 *   5. Dot appears at end + pulse ring (idle loop)
 */

import { useState, useEffect, useRef } from "react";
import { addPropertyControls, ControlType } from "framer";
import { motion, useAnimation } from "framer-motion";

// ─── Chart path data ────────────────────────────────────────────────

const PTS = [
  [0, 280], [60, 270], [120, 250], [160, 240], [200, 235],
  [240, 220], [280, 210], [310, 200], [340, 180], [370, 155],
  [400, 140], [430, 110], [460, 85], [490, 70], [520, 50],
  [550, 35], [580, 30],
];

function buildPath(pts: number[][]): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = px + (cx - px) * 0.5;
    d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }
  return d;
}

function buildAreaPath(pts: number[][], bottomY: number): string {
  const line = buildPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L ${last[0]} ${bottomY} L ${first[0]} ${bottomY} Z`;
}

const LINE_D = buildPath(PTS);
const AREA_D = buildAreaPath(PTS, 300);
const EASE_ENTER: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Component ──────────────────────────────────────────────────────

interface Props {
  autoPlay?: boolean;
  interval?: number;
  width?: number;
  height?: number;
}

export function SpendRuleHero({
  autoPlay = true,
  interval = 4,
}: Props) {
  const [state, setState] = useState<"start" | "end">("start");
  const [loaded, setLoaded] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(1000);
  const show = state === "end";

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    if (!autoPlay || !loaded) return;
    const first = setTimeout(() => setState("end"), 2000);
    const loop = setInterval(
      () => setState((s) => (s === "start" ? "end" : "start")),
      interval * 1000
    );
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [autoPlay, interval, loaded]);

  const endX = PTS[PTS.length - 1][0];
  const endY = PTS[PTS.length - 1][1];

  return (
    <motion.div
      style={styles.wrapper}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={loaded ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.5, ease: EASE_ENTER }}
    >
      <svg viewBox="0 0 600 320" fill="none" style={styles.svg}>
        <rect width="600" height="320" rx="24" fill="#ECEEF3" />

        {/* Grid lines */}
        {[100, 150, 200, 250].map((y) => (
          <motion.line
            key={y} x1="30" y1={y} x2="570" y2={y}
            stroke="#D8DAE0" strokeWidth="0.5" strokeDasharray="4 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 0.5 : 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        ))}

        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
          </linearGradient>
          <filter id="ps" x="-4" y="-2" width="220" height="100" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Area fill */}
        <motion.path
          d={AREA_D} fill="url(#ag)"
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.8, ease: EASE_ENTER, delay: show ? 0.6 : 0 }}
        />

        {/* Chart line */}
        <motion.path
          ref={pathRef} d={LINE_D}
          stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none"
          style={{ strokeDasharray: pathLen }}
          initial={{ strokeDashoffset: pathLen }}
          animate={{ strokeDashoffset: show ? 0 : pathLen }}
          transition={{ duration: 1.2, ease: EASE_ENTER, delay: show ? 0.3 : 0 }}
        />

        {/* End dot */}
        <motion.circle
          cx={endX} cy={endY} r="5" fill="#F97316"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0 }}
          transition={{ duration: 0.3, delay: show ? 1.4 : 0 }}
        />

        {/* Pulse ring */}
        <motion.circle
          cx={endX} cy={endY} r="10"
          fill="none" stroke="#F97316" strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: show ? [0, 0.4, 0] : 0,
            scale: show ? [0.5, 1.5, 2] : 0,
          }}
          transition={{
            duration: 2, ease: "easeOut",
            delay: show ? 1.5 : 0,
            repeat: show ? Infinity : 0, repeatDelay: 1,
          }}
        />

        {/* Stats pill */}
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_ENTER, delay: 0.3 }}
        >
          <rect x="28" y="24" width="200" height="88" rx="16" fill="#FFF" filter="url(#ps)" />
          <text x="44" y="50" fill="#9CA3AF" fontSize="12" fontFamily="Inter,sans-serif" fontWeight="500">
            90 - 180 days
          </text>
          <text x="44" y="78" fill="#1F2937" fontSize="26" fontFamily="Inter,sans-serif" fontWeight="700">
            $120,000
          </text>
          <text x="44" y="100" fill="#16A34A" fontSize="13" fontFamily="Inter,sans-serif" fontWeight="600">
            ↗ 120%
          </text>
        </motion.g>
      </svg>

      <motion.button
        style={styles.toggle}
        onClick={() => setState((s) => (s === "start" ? "end" : "start"))}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {state === "start" ? "Play Animation →" : "← Reset"}
      </motion.button>
    </motion.div>
  );
}

addPropertyControls(SpendRuleHero, {
  autoPlay: { type: ControlType.Boolean, title: "Auto Play", defaultValue: true },
  interval: { type: ControlType.Number, title: "Interval (s)", defaultValue: 4, min: 2, max: 10, step: 0.5 },
});

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    padding: 24,
    fontFamily: "'Inter', sans-serif",
  },
  svg: {
    width: "100%",
    maxWidth: 640,
    height: "auto",
    borderRadius: 24,
  },
  toggle: {
    padding: "12px 28px",
    background: "#F97316",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 2px 12px rgba(249,115,22,0.25)",
  },
};
