import { useRef, useState } from 'react';
import { BIRTHDAY, gate } from '../content';
import { useReducedMotion } from '../lib/motion';
import '../styles/gate.css';

const ANSWER =
  String(BIRTHDAY.day).padStart(2, '0') + String(BIRTHDAY.month).padStart(2, '0');

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function Gate({ onUnlock, leaving }) {
  const [digits, setDigits] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [offset, setOffset] = useState(null);
  const [shakes, setShakes] = useState(0);
  const inputRef = useRef(null);
  const reduced = useReducedMotion();

  // The button only turns evasive after a wrong guess, and it settles down
  // again the moment she edits the field — so the joke can't trap anyone.
  const dodging = attempts > 0 && offset !== null && !reduced;
  const nudge =
    attempts > 0 ? gate.nudges[Math.min(attempts - 1, gate.nudges.length - 1)] : null;

  function dodge() {
    const reach = Math.min(132, window.innerWidth * 0.19);
    const lift = Math.min(90, window.innerHeight * 0.1);

    setOffset((previous) => {
      let next;
      let tries = 0;
      // Keep picking until it's a visibly different spot.
      do {
        next = {
          x: (Math.random() * 2 - 1) * reach,
          y: (Math.random() * 2 - 1) * lift,
          tilt: (Math.random() * 2 - 1) * 11,
        };
        tries += 1;
      } while (
        previous &&
        Math.hypot(next.x - previous.x, next.y - previous.y) < reach * 0.55 &&
        tries < 8
      );
      return next;
    });
  }

  function edit(next) {
    setDigits(next.replace(/\D/g, '').slice(0, 4));
    // Any edit calls the button back to its post.
    setOffset(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (digits === ANSWER) {
      onUnlock();
      return;
    }
    setAttempts((count) => count + 1);
    if (reduced) {
      setShakes((count) => count + 1);
    } else {
      dodge();
    }
    // Put her back in the field so she can just retype, whether she pressed
    // Enter or managed to catch the button.
    inputRef.current?.focus();
  }

  function press(key) {
    edit(digits + key);
    inputRef.current?.focus();
  }

  return (
    <section className={`gate${leaving ? ' is-leaving' : ''}`}>
      <div className="gate-inner">
        <p className="gate-for display">{gate.forWhom}</p>

        <h1 className="gate-heading display">{gate.heading}</h1>

        <p className="gate-invitation">{gate.invitation}</p>

        <form className="gate-form" onSubmit={handleSubmit} noValidate>
          {/* The dots are the visible field. The real input sits on top of
              them at zero opacity, so typing, pasting, the mobile keyboard
              and screen readers all keep working while the value shows as
              circles. */}
          <div className="gate-field">
            <label className="gate-dots">
              <span className="visually-hidden">{gate.inputLabel}</span>
              <input
                ref={inputRef}
                className="gate-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                value={digits}
                onChange={(event) => edit(event.target.value)}
                aria-describedby="gate-nudge"
                aria-invalid={attempts > 0 ? 'true' : undefined}
              />
              <span className="gate-dot-row" aria-hidden="true">
                {[0, 1, 2, 3].map((slot) => (
                  <span
                    key={slot}
                    className={`gate-dot${digits.length > slot ? ' is-filled' : ''}${
                      digits.length === slot ? ' is-next' : ''
                    }`}
                  />
                ))}
              </span>
            </label>

            {/* Day and month, so four circles don't read as a PIN. */}
            <span className="gate-dot-caption" aria-hidden="true">
              <span>day</span>
              <span>month</span>
            </span>
          </div>

          <div className="gate-keypad">
            {KEYS.map((key) => (
              <button
                key={key}
                className="gate-key"
                type="button"
                onClick={() => press(key)}
              >
                {key}
              </button>
            ))}

            <button
              className="gate-key gate-key--word"
              type="button"
              onClick={() => {
                edit('');
                inputRef.current?.focus();
              }}
            >
              {gate.clearAction}
            </button>

            <button
              className="gate-key"
              type="button"
              onClick={() => press('0')}
            >
              0
            </button>

            <button
              className="gate-key gate-key--word"
              type="button"
              onClick={() => {
                edit(digits.slice(0, -1));
                inputRef.current?.focus();
              }}
            >
              <span className="visually-hidden">Delete the last digit</span>
              <span aria-hidden="true">⌫</span>
            </button>
          </div>

          <div className="gate-button-slot">
            <button
              key={shakes}
              className={`gate-button${dodging ? ' is-dodging' : ''}${
                shakes ? ' is-refusing' : ''
              }`}
              type={dodging ? 'button' : 'submit'}
              style={
                offset
                  ? {
                      '--dodge-x': `${offset.x}px`,
                      '--dodge-y': `${offset.y}px`,
                      '--dodge-tilt': `${offset.tilt}deg`,
                    }
                  : undefined
              }
              onPointerEnter={dodging ? dodge : undefined}
              onPointerDown={
                dodging
                  ? (event) => {
                      event.preventDefault();
                      dodge();
                    }
                  : undefined
              }
              onClick={dodging ? dodge : undefined}
            >
              {gate.action}
            </button>
          </div>
        </form>

        <p className="gate-nudge" id="gate-nudge" role="status" aria-live="polite">
          {nudge}
          {dodging && <span className="gate-nudge-hint">{gate.enterHint}</span>}
        </p>
      </div>
    </section>
  );
}
