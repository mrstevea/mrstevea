/**
 * Framer Code Override — Hero Animation
 *
 * This file is designed to be used as a Framer Code Override.
 * Import it in Framer's code editor and apply to your hero frame.
 *
 * Usage in Framer:
 *   1. Import both Figma artboards as frames in Framer.
 *   2. Name shared layers identically across both frames for Smart Animate.
 *   3. Apply these overrides to the corresponding elements.
 *
 * NOTE: This file uses `ComponentType<any>` because Framer's override system
 * passes motion-compatible components that accept initial/animate/transition props.
 * In the Framer editor these types are resolved by the Framer runtime.
 *
 * @see https://www.framer.com/developers/guides/code-overrides
 */

import type { ComponentType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FramerComponent = ComponentType<any>;

// ─── Easing curves matching the spec ────────────────────────────────

const ENTER_EASE = [0.4, 0.0, 0.2, 1] as const;
const _EXIT_EASE = [0.0, 0.0, 0.2, 1] as const;

// ─── Container Override (Scene 1 — Initial Load) ────────────────────

export function withHeroContainer(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: ENTER_EASE,
        }}
      />
    );
  };
}

// ─── Headline Override (Scene 2 — Text Transition) ──────────────────

export function withHeadlineTransition(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{
          duration: 0.45,
          ease: ENTER_EASE,
        }}
      />
    );
  };
}

// ─── Subheadline Override ────────────────────────────────────────────

export function withSubheadlineTransition(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: ENTER_EASE,
          delay: 0.1,
        }}
      />
    );
  };
}

// ─── Layout Item Override (Scene 3 — Layout Shift) ──────────────────

export function withLayoutShift(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1,
          delay: 0.2,
        }}
        layout
      />
    );
  };
}

// ─── CTA Override (Scene 4 — Button Animation) ──────────────────────

export function withCtaAnimation(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.8,
          delay: 0.6,
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      />
    );
  };
}

// ─── CTA Glow Pulse Override (Scene 5 — Idle) ───────────────────────

export function withGlowPulse(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        animate={{
          boxShadow: [
            "0 0 0px rgba(99, 102, 241, 0)",
            "0 0 20px rgba(99, 102, 241, 0.3)",
            "0 0 0px rgba(99, 102, 241, 0)",
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.0,
        }}
      />
    );
  };
}

// ─── Floating Illustration Override (Scene 5 — Idle) ────────────────

export function withFloatingMotion(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.0,
        }}
      />
    );
  };
}

// ─── Icon Entry Override ────────────────────────────────────────────

export function withIconEntry(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1.2,
          delay: 0.3,
        }}
      />
    );
  };
}

// ─── Staggered Children Override ────────────────────────────────────

export function withStaggerChildren(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.2,
            },
          },
        }}
      />
    );
  };
}

// ─── Background Gradient Shift Override ──────────────────────────────

export function withGradientShift(Component: FramerComponent): FramerComponent {
  return (props: Record<string, unknown>) => {
    return (
      <Component
        {...props}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  };
}

// Re-export easing values for use in custom overrides
export { ENTER_EASE, _EXIT_EASE as EXIT_EASE };
