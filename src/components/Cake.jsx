import { useRef, useState } from 'react';
import { cake, nav } from '../content';
import {
  BALLOON_LIFETIME,
  makeBalloons,
  useReducedMotion,
  useTimers,
} from '../lib/motion';
import { playSlice } from '../lib/sound';
import PageNav from './PageNav';
import '../styles/cake.css';

/** Where the knife has to reach before the cut counts. */
const COMMIT = 0.55;

/** How long the knife takes to walk across when the button is used. */
const SLIDE = 520;

/** Drawn twice — once inside each half — so the clip can split it cleanly. */
function CakeArt({ candles }) {
  return (
    <span className="cake-art" aria-hidden="true">
      <span className="cake-candles">
        {Array.from({ length: candles }, (_, index) => (
          <span
            className="cake-candle"
            key={index}
            style={{
              '--candle': index,
              /* -2…2 across five candles: how far this one sits from the
                 middle. The cut topples each by this much, so they splay
                 outward instead of falling as one block. */
              '--candle-lean': index - (candles - 1) / 2,
            }}
          >
            <span className="cake-flame" />
            <span className="cake-wick" />
          </span>
        ))}
      </span>

      <span className="cake-tier cake-tier--top">
        <span className="cake-frosting" />
      </span>
      <span className="cake-tier cake-tier--mid">
        <span className="cake-frosting" />
      </span>
      <span className="cake-tier cake-tier--base">
        <span className="cake-frosting" />
      </span>
      <span className="cake-plate" />
    </span>
  );
}

export default function Cake({ onNavigate, onCelebrate, onClear }) {
  const reduced = useReducedMotion();
  const later = useTimers();

  const [progress, setProgress] = useState(0);
  const [cut, setCut] = useState(false);
  const [slicing, setSlicing] = useState(false);
  const [balloons, setBalloons] = useState([]);
  const [fireworks, setFireworks] = useState([]);

  const trackRef = useRef(null);
  const dragRef = useRef(null);

  /* The drag has to read the current position at pointer-up, and a state
     updater is the wrong place to fire off confetti and a sound — React is
     free to call those twice. A ref alongside the state keeps the decision
     out of the updater. */
  const progressRef = useRef(0);

  function moveKnife(value) {
    progressRef.current = value;
    setProgress(value);
  }

  /* ─── The celebration ───────────────────────────────────────────────── */

  /** The cut itself. Both the drag and the button end up here. */
  function commit() {
    setSlicing(false);
    setCut(true);
    moveKnife(1);
    if (reduced) return;

    onCelebrate?.(150, { originY: 10 });

    setBalloons(makeBalloons(7));
    later(() => setBalloons([]), BALLOON_LIFETIME);

    // Fireworks go off in sequence rather than all at once, so the moment
    // has a shape instead of a single bang.
    const bursts = Array.from({ length: 5 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      left: 12 + Math.random() * 76,
      top: 8 + Math.random() * 38,
      delay: index * 0.42 + Math.random() * 0.2,
    }));
    setFireworks(bursts);
    later(() => setFireworks([]), 4200);
  }

  /**
   * The button path. The knife only reaches the far edge if she drags it
   * there, so on a click it has to be walked across first — the cut lands
   * when the blade does, not when the button is pressed.
   */
  function fire() {
    if (cut || slicing) return;
    playSlice();

    if (reduced) {
      commit();
      return;
    }

    setSlicing(true);
    moveKnife(1);
    later(commit, SLIDE);
  }

  /**
   * Balloons and fireworks are left alone on purpose: they're mid-flight,
   * and their own timers clear them. Cutting again replaces the batch
   * outright, so nothing piles up.
   */
  function reset() {
    setCut(false);
    setSlicing(false);
    moveKnife(0);
    onClear?.();
  }

  /* ─── Dragging the knife ────────────────────────────────────────────── */

  function onPointerDown(event) {
    if (cut || slicing || reduced) return;
    const track = trackRef.current;
    if (!track) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      width: Math.max(1, track.getBoundingClientRect().width),
      from: progressRef.current,
    };
  }

  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const moved = (event.clientX - drag.startX) / drag.width;
    moveKnife(Math.max(0, Math.min(1, drag.from + moved)));
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;

    // Past the commit point it cuts; short of it the knife slides back.
    if (progressRef.current >= COMMIT) {
      playSlice();
      commit();
    } else {
      moveKnife(0);
    }
  }

  return (
    <section className="cake">
      <h1 className="cake-heading display" data-page-heading tabIndex={-1}>
        {cake.heading}
      </h1>
      <p className="cake-invitation">{cake.invitation}</p>

      <div
        className={`cake-scene${cut ? ' is-cut' : ''}${
          progress > 0 ? ' is-cutting' : ''
        }`}
        style={{ '--cut': progress }}
        ref={trackRef}
      >
        <div className="cake-body">
          <div className="cake-half cake-half--left">
            <CakeArt candles={cake.candles} />
          </div>
          <div className="cake-half cake-half--right">
            <CakeArt candles={cake.candles} />
          </div>
        </div>

        {/* The knife is the pointer affordance; the button below is the
            accessible path to the same thing. It stays mounted once spent,
            so it can fade out rather than vanish mid-slide. */}
        {!reduced ? (
          <div
            className="cake-knife"
            aria-hidden="true"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="cake-knife-rig">
              <span className="cake-knife-trail" />
              <span className="cake-knife-grip" />
              <span className="cake-knife-blade" />
            </span>
          </div>
        ) : null}

        {fireworks.map((burst) => (
          <span
            key={burst.id}
            className="firework"
            style={{
              left: `${burst.left}%`,
              top: `${burst.top}%`,
              '--burst-delay': `${burst.delay}s`,
            }}
            aria-hidden="true"
          >
            {Array.from({ length: 14 }, (_, index) => (
              <span className="firework-spark" key={index} style={{ '--spoke': index }} />
            ))}
          </span>
        ))}

        <p className={`cake-shout display${cut ? ' is-shown' : ''}`} aria-hidden={!cut}>
          {cake.celebration}
        </p>
      </div>

      <p className="cake-status" role="status" aria-live="polite">
        {cut ? cake.celebrationNote : null}
      </p>

      <div className="cake-actions">
        {!cut ? (
          <button
            className="cake-cut"
            type="button"
            onClick={fire}
            disabled={slicing}
          >
            {cake.cutAction}
          </button>
        ) : (
          <button className="cake-again" type="button" onClick={reset}>
            {cake.againAction}
          </button>
        )}
      </div>

      {balloons.length ? (
        <div className="balloons" aria-hidden="true">
          {balloons.map((balloon) => (
            <span
              key={balloon.id}
              className="balloon"
              style={{
                left: `${balloon.left}%`,
                '--balloon-size': `${balloon.size}px`,
                '--balloon-delay': `${balloon.delay}s`,
                '--balloon-duration': `${balloon.duration}s`,
                '--balloon-sway': `${balloon.sway}px`,
                '--balloon-hue': balloon.hue,
              }}
            >
              <span className="balloon-string" />
            </span>
          ))}
        </div>
      ) : null}

      <PageNav onNavigate={onNavigate} next="wishes" nextLabel={nav.toWishes} />
    </section>
  );
}
