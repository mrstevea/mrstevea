/**
 * Animation easing curves and timing constants for the hero transition.
 * Based on Framer Smart Animate conventions.
 */

// Custom cubic-bezier curves
export const EASING = {
  /** Primary easing for most transitions */
  primary: [0.4, 0.0, 0.2, 1] as const,
  /** Enter easing — smooth deceleration */
  enter: [0.4, 0.0, 0.2, 1] as const,
  /** Exit easing — quick start, smooth end */
  exit: [0.0, 0.0, 0.2, 1] as const,
  /** Soft spring-like easing for layout shifts */
  soft: [0.25, 0.46, 0.45, 0.94] as const,
} as const;

// Spring configurations for Framer Motion
export const SPRING = {
  /** Mild bounce for layout motion */
  layoutShift: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  /** Snappy pop for CTA buttons */
  ctaPop: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  /** Gentle float for illustrations */
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },
} as const;

// Timing windows (in seconds) — stagger offsets for the 5-scene sequence
export const TIMING = {
  /** Full transition duration */
  totalDuration: 1.2,

  /** Scene 1: Initial Load */
  initialLoad: { delay: 0, duration: 0.5 },

  /** Scene 2: Headline transition */
  headline: { delay: 0, duration: 0.5 },

  /** Scene 3: Layout shift */
  layoutShift: { delay: 0.2, duration: 0.7 },

  /** Scene 4: CTA animation */
  cta: { delay: 0.6, duration: 0.4 },

  /** Scene 5: Idle micro-interactions (looping) */
  idle: { delay: 1.0 },
} as const;
