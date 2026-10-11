import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ─── The typewriter ─────────────────────────────────────────────────────
   One character counter for the whole letter, advanced by a single
   requestAnimationFrame loop.

   Two things follow from doing it this way rather than with a timer per
   paragraph. The speed is in characters per second against real elapsed
   time, so a frame that arrives late doesn't swallow a word and a 120Hz
   screen types at the same rate as a 60Hz one. And there is exactly one
   thing running, so skipping to the end or closing early is a change of
   direction rather than the cancellation of several timers.
   ──────────────────────────────────────────────────────────────────────── */

/** The longest a single frame is allowed to count for. A backgrounded tab
 *  stops receiving frames; without this, coming back to it would dump
 *  whatever was missed in one go. */
const MAX_STEP = 64;

/** Separator for the text key. A letter won't contain one. */
const SEP = '\u0000';

export function useTypewriter(blocks, options = {}) {
  const {
    /** 'idle' | 'type' | 'erase'. Anything else stops the loop. */
    mode = 'idle',
    /** Off means the whole letter is simply present — reduced motion. */
    enabled = true,
    charsPerSecond = 70,
    /** Held at the end of each paragraph, and nowhere else. */
    paragraphPause = 360,
    /** Gives the sheet time to finish unfolding before the pen starts. */
    startDelay = 0,
    /** Erasing is a dismissal, not a reading — it runs much faster. */
    eraseSpeed = 7,
    onTyped,
    onErased,
  } = options;

  /* Keyed on the text itself rather than on the array, so a caller building
     `blocks` inline doesn't hand the loop a new identity every render. */
  const key = blocks.map((block) => block.text).join(SEP);

  /* Array.from, not split('') — splitting a string by UTF-16 units cuts a
     surrogate pair in half, and the letter ends in three emoji. */
  const pieces = useMemo(
    () => (blocks.length ? key.split(SEP).map((text) => Array.from(text)) : []),
    [key, blocks.length],
  );

  /** Where each block starts and ends in the flat character count. */
  const spans = useMemo(() => {
    let at = 0;
    return pieces.map((chars) => {
      const span = { start: at, end: at + chars.length };
      at = span.end;
      return span;
    });
  }, [pieces]);

  const total = spans.length ? spans[spans.length - 1].end : 0;

  /* The offsets where a paragraph ends and the next begins. Empty blocks —
     the blank lines between paragraphs — collapse onto the previous end,
     which is what the Set is for. */
  const breaks = useMemo(() => {
    const found = new Set();
    spans.forEach((span) => {
      if (span.end > span.start && span.end < total) found.add(span.end);
    });
    return found;
  }, [spans, total]);

  const [typed, setTyped] = useState(0);
  const typedRef = useRef(0);
  const holdRef = useRef(0);
  const carryRef = useRef(0);
  /** Whether the opening beat has been served for this opening. */
  const delayServed = useRef(false);

  /* The callbacks live in refs so the loop's dependency list stays free of
     them — otherwise a caller who forgets useCallback restarts the animation
     on every render. */
  const typedDone = useRef(onTyped);
  const erasedDone = useRef(onErased);
  useEffect(() => {
    typedDone.current = onTyped;
    erasedDone.current = onErased;
  });

  /** Put the whole letter on screen now. */
  const skip = useCallback(() => {
    typedRef.current = total;
    carryRef.current = 0;
    holdRef.current = 0;
    setTyped(total);
  }, [total]);

  useEffect(() => {
    if (!enabled || total === 0) return undefined;
    const forward = mode === 'type';
    if (!forward && mode !== 'erase') {
      // Shut, or finished: the next opening writes from scratch, beat and all.
      delayServed.current = false;
      return undefined;
    }

    const rate = forward ? charsPerSecond : charsPerSecond * eraseSpeed;
    // Nothing holds mid-erase: the pauses exist for reading, and going
    // backwards isn't reading.
    holdRef.current = 0;

    let raf = 0;
    let last = 0;
    let startedAt = 0;

    const step = (now) => {
      if (last === 0) {
        last = now;
        startedAt = now;
        raf = requestAnimationFrame(step);
        return;
      }

      const delta = Math.min(MAX_STEP, now - last);
      last = now;

      // Already at the end it was heading for — nothing left to do. This is
      // also what catches a skip, which sets the count directly, and it has
      // to come before the start delay or a skip during the opening beat
      // would sit there waiting out a delay it no longer needs.
      if (forward ? typedRef.current >= total : typedRef.current <= 0) {
        (forward ? typedDone : erasedDone).current?.();
        return;
      }

      // The beat before the pen starts, served once per opening. Without the
      // flag, catching the letter mid-erase and setting it going again would
      // stall for the whole delay a second time.
      if (forward && !delayServed.current) {
        if (now - startedAt < startDelay) {
          raf = requestAnimationFrame(step);
          return;
        }
        delayServed.current = true;
      }

      if (holdRef.current > 0) {
        holdRef.current -= delta;
        raf = requestAnimationFrame(step);
        return;
      }

      carryRef.current += (delta / 1000) * rate * (forward ? 1 : -1);
      const whole = Math.trunc(carryRef.current);
      if (whole === 0) {
        raf = requestAnimationFrame(step);
        return;
      }

      carryRef.current -= whole;
      const next = Math.max(0, Math.min(total, typedRef.current + whole));
      typedRef.current = next;
      setTyped(next);

      if (forward) {
        if (breaks.has(next)) holdRef.current = paragraphPause;
        if (next >= total) {
          typedDone.current?.();
          return;
        }
      } else if (next <= 0) {
        erasedDone.current?.();
        return;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [
    enabled,
    mode,
    total,
    charsPerSecond,
    eraseSpeed,
    paragraphPause,
    startDelay,
    breaks,
  ]);

  return {
    /* Disabled means the letter is simply already written. */
    typed: enabled ? typed : total,
    spans,
    total,
    skip,
  };
}
