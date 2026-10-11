import { useEffect, useRef, useState } from 'react';

/** True when the visitor has asked their system for less animation. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Reveals an element the first time it scrolls into view, once and never
 * again. Returns a ref to attach and whether it has been seen.
 */
export function useReveal({ threshold = 0.2, rootMargin = '0px 0px -12% 0px' } = {}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, seen];
}

/** Keeps a timer list and clears whatever is still pending on unmount. */
export function useTimers() {
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return useRef((run, delay) => {
    timers.current.push(setTimeout(run, delay));
  }).current;
}

/* ─── Particles ────────────────────────────────────────────────────────── */

const PARTY = [
  'var(--hotpink)',
  'var(--purple)',
  'var(--cyan)',
  'var(--magenta)',
  'var(--yellow)',
];

let moteId = 0;

/**
 * Builds a batch of rising specks. `at` pins them near a horizontal
 * position (0–100) so a wish leaves from where she tapped; leave it out and
 * they scatter across the width.
 */
export function makeMotes(count, at = null) {
  return Array.from({ length: count }, () => {
    const spread = at === null ? 100 : 16;
    const base = at === null ? 0 : at - spread / 2;
    return {
      id: ++moteId,
      left: Math.max(1, Math.min(99, base + Math.random() * spread)),
      size: 3 + Math.random() * 4,
      delay: Math.random() * (at === null ? 0.9 : 0.25),
      duration: 3.4 + Math.random() * 2.6,
      drift: (Math.random() - 0.5) * 120,
      spin: (Math.random() - 0.5) * 900,
      hue: PARTY[Math.floor(Math.random() * PARTY.length)],
    };
  });
}

/** How long a batch of motes needs before it can be dropped from state. */
export const MOTE_LIFETIME = 6500;

let confettiId = 0;

/**
 * A burst of confetti thrown from `originY` (a viewport percentage) and
 * falling. Used for the three big moments: the gate opening, the letter
 * opening, and the cake being cut.
 */
export function makeConfetti(count, { originY = 18 } = {}) {
  return Array.from({ length: count }, () => ({
    id: ++confettiId,
    left: Math.random() * 100,
    top: originY + (Math.random() - 0.5) * 12,
    size: 7 + Math.random() * 8,
    // Rectangles mostly, the odd round one.
    round: Math.random() < 0.22,
    delay: Math.random() * 0.4,
    duration: 2.4 + Math.random() * 2,
    drift: (Math.random() - 0.5) * 340,
    // Side-to-side travel while falling. This is what stops a piece dropping
    // like a stone — paper rocks as it comes down.
    flutter: (Math.random() - 0.5) * 190,
    spin: (Math.random() - 0.5) * 1200,
    hue: PARTY[Math.floor(Math.random() * PARTY.length)],
  }));
}

/** How long a confetti burst needs before it can be dropped from state. */
export const CONFETTI_LIFETIME = 5200;

let balloonId = 0;

/** Balloons for the cake celebration: they rise once and leave. */
export function makeBalloons(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: ++balloonId,
    left: 6 + (index * 88) / Math.max(1, count - 1) + (Math.random() - 0.5) * 8,
    size: 44 + Math.random() * 26,
    delay: Math.random() * 1.1,
    duration: 6 + Math.random() * 3,
    sway: (Math.random() - 0.5) * 70,
    hue: PARTY[Math.floor(Math.random() * PARTY.length)],
  }));
}

export const BALLOON_LIFETIME = 10000;
