import { useState } from 'react';
import { boxes } from '../content';
import { useReducedMotion } from '../lib/motion';
import '../styles/boxes.css';

/** One heart, drawn once and reused at three different hues. */
const HEART =
  'M50 93 C18 70 3 50 3 32 C3 15 16 3 31 3 C40 3 47 8 50 14 C53 8 60 3 69 3 C84 3 97 15 97 32 C97 50 82 70 50 93 Z';

function HeartBox({ item, opened, opening, onOpen }) {
  const clipId = `heart-clip-${item.id}`;

  return (
    <button
      className={`heartbox heartbox--${item.hue}${opening ? ' is-opening' : ''}${
        opened ? ' is-opened' : ''
      }`}
      type="button"
      onClick={onOpen}
    >
      <span className="heartbox-stage">
        {/* Sparkles sit outside the heart so they read as light coming off
            it rather than decoration printed on it. */}
        <span className="heartbox-sparkles" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((spark) => (
            <span key={spark} className="heartbox-spark" style={{ '--spark': spark }} />
          ))}
        </span>

        <svg className="heartbox-art" viewBox="0 0 100 108" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <path d={HEART} />
            </clipPath>
          </defs>

          <g className="heartbox-body">
            <path className="heartbox-fill" d={HEART} />

            <g clipPath={`url(#${clipId})`}>
              {/* The wrapping: two ribbon bands and a travelling highlight. */}
              <rect className="heartbox-band" x="43" y="0" width="14" height="100" />
              <rect className="heartbox-band" x="0" y="46" width="100" height="12" />
              <ellipse className="heartbox-sheen" cx="33" cy="29" rx="19" ry="13" />
              <rect className="heartbox-shine" x="-40" y="-10" width="22" height="130" />
            </g>

            <path className="heartbox-edge" d={HEART} />
          </g>

          {/* The bow lifts off when the box opens. */}
          <g className="heartbox-bow">
            <path
              className="heartbox-tail"
              d="M50 14 C44 24 38 30 30 34 C36 26 40 20 44 12 Z"
            />
            <path
              className="heartbox-tail"
              d="M50 14 C56 24 62 30 70 34 C64 26 60 20 56 12 Z"
            />
            <ellipse
              className="heartbox-loop"
              cx="36"
              cy="10"
              rx="14"
              ry="9"
              transform="rotate(-20 36 10)"
            />
            <ellipse
              className="heartbox-loop"
              cx="64"
              cy="10"
              rx="14"
              ry="9"
              transform="rotate(20 64 10)"
            />
            <circle className="heartbox-knot" cx="50" cy="12" r="6" />
          </g>
        </svg>
      </span>

      <span className="heartbox-label">
        <span className="heartbox-title display">{item.title}</span>
        <span className="heartbox-hint">{opened ? boxes.openedNote : item.hint}</span>
      </span>
    </button>
  );
}

export default function Boxes({ seen, onOpen }) {
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(null);

  function open(id) {
    if (opening) return;
    if (reduced) {
      onOpen(id);
      return;
    }
    // Let the bow come off before the page changes under her.
    setOpening(id);
    window.setTimeout(() => onOpen(id), 620);
  }

  return (
    <section className="boxes">
      <div className="boxes-intro">
        <p className="boxes-greeting display">{boxes.greeting}</p>
        <h1 className="boxes-heading display" data-page-heading tabIndex={-1}>
          {boxes.heading}
        </h1>
      </div>

      <ul className="boxes-row">
        {boxes.items.map((item, index) => (
          <li className="boxes-cell" key={item.id} style={{ '--beat': index }}>
            <HeartBox
              item={item}
              opened={seen.includes(item.id)}
              opening={opening === item.id}
              onOpen={() => open(item.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
