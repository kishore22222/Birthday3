import { useCallback, useEffect, useRef, useState } from 'react';
import Aurora from './components/Aurora';
import Motes from './components/Motes';
import Confetti from './components/Confetti';
import Gate from './components/Gate';
import Boxes from './components/Boxes';
import Letter from './components/Letter';
import Gallery from './components/Gallery';
import Cake from './components/Cake';
import Wishes from './components/Wishes';
import MusicButton from './components/MusicButton';
import { nav } from './content';
import { useHashRoute } from './lib/router';
import {
  CONFETTI_LIFETIME,
  MOTE_LIFETIME,
  makeConfetti,
  makeMotes,
  useReducedMotion,
  useTimers,
} from './lib/motion';
import './styles/page.css';

/** The gate is a guard rather than a route, so it never appears in the URL. */
const ROUTES = ['boxes', 'letter', 'gallery', 'cake', 'wishes'];
const OPENED_KEY = 'nija-birthday:opened';
const SEEN_KEY = 'nija-birthday:seen';

function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing — she'll just see the gate again next time.
  }
}

export default function App() {
  const reduced = useReducedMotion();
  const later = useTimers();
  const [route, go, replace] = useHashRoute(ROUTES, 'boxes');

  const [unlocked, setUnlocked] = useState(() => readStore(OPENED_KEY, false) === true);
  const [igniting, setIgniting] = useState(false);
  const [seen, setSeen] = useState(() => {
    const stored = readStore(SEEN_KEY, []);
    return Array.isArray(stored) ? stored : [];
  });

  const [wishCount, setWishCount] = useState(0);
  const [motes, setMotes] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [clearing, setClearing] = useState(false);

  const pageRef = useRef(null);
  const shouldTakeFocus = useRef(false);
  /** Bumped on every burst, so a pending fade can tell it has been overtaken. */
  const burstToken = useRef(0);

  /* ─── Particles ─────────────────────────────────────────────────────── */

  const addMotes = useCallback(
    (count, at) => {
      if (reduced) return;
      const batch = makeMotes(count, at);
      setMotes((current) => [...current, ...batch].slice(-70));
      later(() => {
        const ids = new Set(batch.map((item) => item.id));
        setMotes((current) => current.filter((item) => !ids.has(item.id)));
      }, MOTE_LIFETIME);
    },
    [reduced, later],
  );

  const celebrate = useCallback(
    (count = 90, options) => {
      if (reduced) return;
      const batch = makeConfetti(count, options);
      // A fresh burst cancels any fade in progress — she has thrown more
      // confetti, so the layer is hers again.
      burstToken.current += 1;
      setClearing(false);
      setConfetti((current) => [...current, ...batch].slice(-220));
      later(() => {
        const ids = new Set(batch.map((item) => item.id));
        setConfetti((current) => current.filter((item) => !ids.has(item.id)));
      }, CONFETTI_LIFETIME);
    },
    [reduced, later],
  );

  /* Dropping the pieces from state would make them vanish mid-air. Fading
     the layer first and emptying it after is the difference between the
     confetti leaving and the confetti being switched off. */
  const clearCelebration = useCallback(() => {
    setClearing(true);
    const token = burstToken.current;
    later(() => {
      // She cut the cake again while the fade was running. The new burst owns
      // the layer now, so this one leaves it alone.
      if (burstToken.current !== token) return;
      setConfetti([]);
      setClearing(false);
    }, 460);
  }, [later]);

  /* ─── The gate ──────────────────────────────────────────────────────── */

  /** The one orchestrated sequence on the site. */
  function unlock() {
    writeStore(OPENED_KEY, true);
    shouldTakeFocus.current = true;
    replace('boxes');

    if (reduced) {
      setUnlocked(true);
      return;
    }

    setIgniting(true);
    celebrate(120, { originY: 12 });
    addMotes(18);
    later(() => setUnlocked(true), 520);
    later(() => setIgniting(false), 2300);
  }

  function relock() {
    writeStore(OPENED_KEY, false);
    writeStore(SEEN_KEY, []);
    setSeen([]);
    setWishCount(0);
    setMotes([]);
    setConfetti([]);
    setClearing(false);
    setIgniting(false);
    setUnlocked(false);
    replace('boxes');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ─── Navigation ────────────────────────────────────────────────────── */

  // Arriving counts, however she gets there — tapping a heart on the hub or
  // stepping through with "next" both mark the page opened, so the hub's
  // note stays honest about where she's already been.
  const visit = useCallback(
    (name) => {
      shouldTakeFocus.current = true;
      setSeen((current) => {
        if (current.includes(name)) return current;
        const next = [...current, name];
        writeStore(SEEN_KEY, next);
        return next;
      });
      go(name);
    },
    [go],
  );

  // Every route change starts at the top, with focus on the new heading, so
  // keyboard and screen-reader users land where everyone else is looking.
  useEffect(() => {
    if (!unlocked) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!shouldTakeFocus.current) return;
    shouldTakeFocus.current = false;
    pageRef.current?.querySelector('[data-page-heading]')?.focus({ preventScroll: true });
  }, [route, unlocked]);

  function handleWish(atPercent) {
    setWishCount((count) => count + 1);
    addMotes(5, atPercent);
  }

  /* ─── Render ────────────────────────────────────────────────────────── */

  // Pastel at the gate, full strength once it opens, and a touch brighter
  // with every wish she sends up.
  const lit = unlocked || igniting;
  const level = (lit ? 1 : 0.34) + Math.min(wishCount, 8) * 0.03;
  const variant = !lit ? 'party' : route === 'boxes' ? 'pink' : 'party';

  return (
    <>
      <Aurora level={level} igniting={igniting} variant={variant} />
      <Motes items={motes} />
      <Confetti items={confetti} clearing={clearing} />

      {!unlocked ? (
        <Gate onUnlock={unlock} leaving={igniting} />
      ) : (
        <div className="shell" ref={pageRef}>
          <main className="shell-page" key={route}>
            {route === 'boxes' && <Boxes seen={seen} onOpen={visit} />}
            {route === 'letter' && (
              <Letter onNavigate={visit} onCelebrate={celebrate} />
            )}
            {route === 'gallery' && <Gallery onNavigate={visit} />}
            {route === 'cake' && (
              <Cake
                onNavigate={visit}
                onCelebrate={celebrate}
                onClear={clearCelebration}
              />
            )}
            {route === 'wishes' && (
              <Wishes count={wishCount} onWish={handleWish} onNavigate={visit} />
            )}
          </main>

          <footer className="shell-footer">
            <button className="shell-relock" type="button" onClick={relock}>
              {nav.relock}
            </button>
          </footer>
        </div>
      )}

      <MusicButton />
    </>
  );
}
