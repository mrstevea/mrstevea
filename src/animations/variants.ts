import type { Variants } from "framer-motion";
import { EASING, SPRING, TIMING } from "./easing";

/**
 * Variant definitions for each animating element in the hero transition.
 * "start" = initial hero state (Figma node 992-3755)
 * "end"   = final hero state  (Figma node 992-3772)
 */

// ─── Scene 1: Container / Overall fade-in ────────────────────────────

export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  start: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.initialLoad.duration,
      ease: EASING.enter,
      staggerChildren: 0.08,
    },
  },
  end: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.totalDuration,
      ease: EASING.primary,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// ─── Scene 2: Headline text ──────────────────────────────────────────

export const headlineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  start: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.headline.duration,
      ease: EASING.enter,
    },
  },
  end: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.headline.duration,
      ease: EASING.primary,
    },
  },
};

export const headlineExitVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.3,
      ease: EASING.exit,
    },
  },
};

export const headlineEnterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASING.enter,
      delay: 0.15,
    },
  },
};

// ─── Scene 2: Subheadline ────────────────────────────────────────────

export const subheadlineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  start: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASING.enter,
      delay: 0.1,
    },
  },
  end: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASING.primary,
      delay: 0.2,
    },
  },
};

// ─── Scene 3: Layout / Grid elements ────────────────────────────────

export const layoutItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  start: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING.layoutShift,
      delay: TIMING.layoutShift.delay,
    },
  },
  end: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING.layoutShift,
      delay: TIMING.layoutShift.delay + 0.1,
    },
  },
};

// ─── Scene 4: CTA Buttons ───────────────────────────────────────────

export const ctaVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 12,
  },
  start: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...SPRING.ctaPop,
      delay: TIMING.cta.delay,
    },
  },
  end: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...SPRING.ctaPop,
      delay: TIMING.cta.delay + 0.05,
    },
  },
};

export const ctaExitVariants: Variants = {
  visible: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.25,
      ease: EASING.exit,
    },
  },
};

export const ctaEnterVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING.ctaPop,
      delay: 0.2,
    },
  },
};

// ─── Scene 5: Idle micro-interactions ────────────────────────────────

export const glowPulseVariants: Variants = {
  idle: {
    boxShadow: [
      "0 0 0px rgba(99, 102, 241, 0)",
      "0 0 20px rgba(99, 102, 241, 0.3)",
      "0 0 0px rgba(99, 102, 241, 0)",
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const floatingVariants: Variants = {
  idle: {
    y: [0, -8, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─── Icon / visual asset shared variants ─────────────────────────────

export const iconVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.6,
    rotate: -10,
  },
  start: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      ...SPRING.gentle,
      delay: 0.3,
    },
  },
  end: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      ...SPRING.gentle,
      delay: 0.35,
    },
  },
};
