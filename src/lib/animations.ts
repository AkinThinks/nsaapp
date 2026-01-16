/**
 * Framer Motion animation variants for SafetyAlerts
 * Subtle, reassuring animations that don't feel playful in serious contexts
 */

import { Variants, Transition } from 'framer-motion'

// ============================================
// TRANSITION PRESETS
// ============================================

export const transitions = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  } as Transition,

  springSmooth: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
  } as Transition,

  ease: {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1],
  } as Transition,

  easeOut: {
    duration: 0.3,
    ease: [0, 0, 0.2, 1],
  } as Transition,

  easeIn: {
    duration: 0.2,
    ease: [0.4, 0, 1, 1],
  } as Transition,
}

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
}

export const slideInFromRight: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  enter: {
    x: 0,
    opacity: 1,
    transition: transitions.springSmooth,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: transitions.ease,
  },
}

export const slideInFromBottom: Variants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  enter: {
    y: 0,
    opacity: 1,
    transition: transitions.springSmooth,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: transitions.ease,
  },
}

// ============================================
// COMPONENT ANIMATIONS
// ============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.easeOut,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.easeIn,
  },
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.ease,
  },
}

export const popIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: transitions.ease,
  },
}

// ============================================
// CARD ANIMATIONS
// ============================================

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.easeOut,
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: transitions.spring,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const alertCardVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.easeOut,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.easeIn,
  },
  hover: {
    scale: 1.01,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
    transition: transitions.spring,
  },
}

// ============================================
// LIST ANIMATIONS
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.easeOut,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.easeIn,
  },
}

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: transitions.spring,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const fabVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      ...transitions.springBouncy,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.1,
    transition: transitions.spring,
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}

// ============================================
// SUCCESS/STATUS ANIMATIONS
// ============================================

export const successCheckVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
}

export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const alertPulseVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)',
  },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(220, 38, 38, 0.4)',
      '0 0 0 10px rgba(220, 38, 38, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
}

// ============================================
// SKELETON/LOADING ANIMATIONS
// ============================================

export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// ============================================
// MODAL/OVERLAY ANIMATIONS
// ============================================

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.ease,
  },
}

export const bottomSheetVariants: Variants = {
  initial: {
    y: '100%',
  },
  animate: {
    y: 0,
    transition: transitions.springSmooth,
  },
  exit: {
    y: '100%',
    transition: transitions.ease,
  },
}

// ============================================
// GESTURE ANIMATIONS
// ============================================

export const swipeRightVariants: Variants = {
  initial: { x: 0, opacity: 1 },
  swipe: {
    x: 100,
    opacity: 0,
    transition: transitions.ease,
  },
}

export const swipeLeftVariants: Variants = {
  initial: { x: 0, opacity: 1 },
  swipe: {
    x: -100,
    opacity: 0,
    transition: transitions.ease,
  },
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create staggered animation delay for list items
 */
export function getStaggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay
}

/**
 * Create custom spring transition
 */
export function createSpring(
  stiffness = 300,
  damping = 30
): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
  }
}

/**
 * Create custom ease transition
 */
export function createEase(
  duration = 0.2,
  ease: number[] = [0.25, 0.1, 0.25, 1]
): Transition {
  return { duration, ease }
}
