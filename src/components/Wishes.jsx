import { useRef, useState } from 'react';
import { nav, wishes } from '../content';
import { useReducedMotion, useTimers } from '../lib/motion';
import PageNav from './PageNav';
import '../styles/wishes.css';

/** 'Nothing up there yet.' / 'One wish…' / '4 wishes…' */
function counterLabel(count) {
  if (count === 0) return wishes.counter.none;
  if (count === 1) return wishes.counter.one;
  return wishes.counter.many.replace('{count}', String(count));
}

/** How long a wish takes to climb out of the panel. */
const FLIGHT = 7000;

let wishId = 0;

export default function Wishes({ count, onWish, onNavigate }) {
  const reduced = useReducedMotion();
  const later = useTimers();

  const [draft, setDraft] = useState('');
  const [flying, setFlying] = useState([]);
  const inputRef = useRef(null);

  function send(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }

    const wish = {
      id: ++wishId,
      text,
      left: 12 + Math.random() * 62,
      drift: (Math.random() - 0.5) * 70,
      duration: FLIGHT / 1000 + Math.random() * 1.6,
      tilt: (Math.random() - 0.5) * 7,
    };

    if (!reduced) {
      setFlying((current) => [...current, wish].slice(-8));
      later(
        () => setFlying((current) => current.filter((item) => item.id !== wish.id)),
        FLIGHT + 1800,
      );
    }

    // Send a few specks up from roughly where the panel sits.
    onWish(wish.left + 14);
    setDraft('');
    inputRef.current?.focus();
  }

  return (
    <section className="wishes">
      <h1 className="wishes-heading display" data-page-heading tabIndex={-1}>
        {wishes.heading}
      </h1>
      <p className="wishes-invitation">{wishes.invitation}</p>

      {/* The one dark surface on the site. The rest of the page is a bright
          gradient, so a night sky here reads as somewhere else entirely —
          which is the point of looking up. */}
      <div className="wishes-sky">
        <span className="wishes-stars" aria-hidden="true" />

        {flying.map((wish) => (
          <span
            key={wish.id}
            className="wishes-flight"
            style={{
              left: `${wish.left}%`,
              '--flight-drift': `${wish.drift}px`,
              '--flight-duration': `${wish.duration}s`,
              '--flight-tilt': `${wish.tilt}deg`,
            }}
            aria-hidden="true"
          >
            {wish.text}
          </span>
        ))}

        <p className="wishes-count" role="status" aria-live="polite">
          {counterLabel(count)}
        </p>
      </div>

      <form className="wishes-form" onSubmit={send}>
        <label className="wishes-field">
          <span className="visually-hidden">{wishes.inputLabel}</span>
          <input
            ref={inputRef}
            className="wishes-input"
            type="text"
            value={draft}
            maxLength={90}
            autoComplete="off"
            placeholder={wishes.placeholder}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>

        <button className="wishes-send" type="submit">
          {wishes.action}
        </button>
      </form>

      <div className="wishes-suggestions">
        <p className="wishes-suggestions-label">{wishes.suggestionsLabel}</p>
        <ul className="wishes-chips">
          {wishes.suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                className="wishes-chip"
                type="button"
                onClick={() => {
                  setDraft(suggestion);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <PageNav onNavigate={onNavigate} next={null} />
    </section>
  );
}
