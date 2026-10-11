import { memo, useCallback, useId, useMemo, useState } from 'react';
import { letter, nav } from '../content';
import { useReducedMotion } from '../lib/motion';
import { useTypewriter } from '../lib/typing';
import PageNav from './PageNav';
import '../styles/letter.css';

/** How fast the pen moves, and how long it rests between paragraphs. */
const SPEED = 70;
const PARAGRAPH_PAUSE = 360;
/** Just past the sheet's own 700ms unfold, so the paper is there first. */
const START_DELAY = 780;

/**
 * The letter split into blocks. The greeting and the signature are set
 * differently from the body, so the style travels with the text rather than
 * being decided at the render site. The body's `''` entries come through as
 * empty blocks, which is what makes the blank lines.
 */
function useBlocks() {
  return useMemo(
    () => [
      { text: letter.greeting, className: 'letter-greeting display' },
      ...letter.body.map((text) => ({ text, className: '' })),
      { text: letter.signature, className: 'letter-signature display' },
    ],
    [],
  );
}

/**
 * The letter as plain paragraphs. Rendered twice — once to hold the height,
 * once for the screen reader — and memoised, because the typing counter
 * re-renders its parent sixty times a second and neither copy ever changes.
 */
const LetterCopy = memo(function LetterCopy({ blocks }) {
  return blocks.map((block, index) => (
    <p className={block.className} key={index}>
      {block.text}
    </p>
  ));
});

export default function Letter({ onNavigate, onCelebrate }) {
  const reduced = useReducedMotion();
  const blocks = useBlocks();
  const sheetId = useId();

  const [open, setOpen] = useState(false);
  /** 'idle' while shut · 'type' · 'erase' · 'done' once fully written. */
  const [phase, setPhase] = useState('idle');

  const handleTyped = useCallback(() => setPhase('done'), []);
  const handleErased = useCallback(() => {
    setOpen(false);
    setPhase('idle');
  }, []);

  const { typed, spans, total, skip } = useTypewriter(blocks, {
    mode: phase,
    enabled: !reduced,
    charsPerSecond: SPEED,
    paragraphPause: PARAGRAPH_PAUSE,
    startDelay: START_DELAY,
    onTyped: handleTyped,
    onErased: handleErased,
  });

  function toggle() {
    // Nothing to run and nothing to reverse: the letter is simply there, or
    // it isn't.
    if (reduced) {
      if (!open) onCelebrate?.(70, { originY: 26 });
      setOpen(!open);
      return;
    }

    if (!open) {
      setOpen(true);
      setPhase('type');
      onCelebrate?.(70, { originY: 26 });
      return;
    }

    // Mid-erase, a click catches the letter and carries on writing from
    // wherever it had got to.
    setPhase((current) => (current === 'erase' ? 'type' : 'erase'));
  }

  /**
   * One tap and the rest of it is simply there. The typing is a pleasure,
   * not a toll — and the only other way past it would be to close the
   * letter. Keyboard users aren't stranded: the whole text is in the
   * document already, and the button above still closes it.
   */
  function skipAhead() {
    if (phase === 'type') skip();
  }

  /* Which block the pen is in. Chosen from the non-empty blocks only, so a
     blank line between paragraphs never takes the cursor. `<=` rather than
     `<` puts the cursor at the end of the paragraph just finished, where it
     waits out the pause. */
  const active = useMemo(() => {
    const written = blocks
      .map((block, index) => index)
      .filter((index) => spans[index].end > spans[index].start);
    if (!written.length) return -1;
    const current = written.find((index) => typed <= spans[index].end);
    return current ?? written[written.length - 1];
  }, [blocks, spans, typed]);

  return (
    <section className="letter">
      <h1 className="letter-heading display" data-page-heading tabIndex={-1}>
        {letter.heading}
      </h1>

      <div className="letter-stage">
        <span className="letter-sparkles" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((spark) => (
            <span key={spark} className="letter-spark" style={{ '--spark': spark }} />
          ))}
        </span>

        <button
          className={`letter-envelope${open ? ' is-open' : ''}`}
          type="button"
          /* No visible text on the envelope, so the button's accessible name
             has to come from here — otherwise it announces as unnamed. */
          aria-label={open ? letter.closeAction : letter.openAction}
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={toggle}
        >
          <span className="letter-flap" aria-hidden="true">
            {/* The underside. Only ever seen once the flap has turned past
                upright, which is what stops the open flap reading as a roof. */}
            <span className="letter-flap-back" />
          </span>

          <span className="letter-seal" aria-hidden="true">
            <span className="letter-seal-shine" />
            <span className="letter-seal-mark">✦</span>
          </span>
        </button>
      </div>

      <div className="letter-sheet" id={sheetId} data-open={open || undefined}>
        <div className="letter-sheet-inner">
          {/* A pointer shortcut, and only ever a shortcut — see skipAhead. */}
          <div className="letter-body" onClick={skipAhead}>
            {/* The whole letter, laid out but uninked. Its job is to hold the
                sheet at full height from the first frame, so the typing can't
                shove the page around as it fills in — and because it's real
                text in the document, a screen reader gets the finished letter
                rather than a fragment that grows a character at a time. */}
            <div className="letter-measure">
              <LetterCopy blocks={blocks} />
            </div>

            <div className="letter-typed" aria-hidden="true">
              {blocks.map((block, index) => {
                const span = spans[index];
                const shown = Math.max(0, Math.min(span.end, typed) - span.start);
                // Nothing yet, and the pen isn't here — leave it out
                // entirely, or its paragraph margin would show up early.
                if (shown === 0 && index !== active) return null;

                return (
                  <p className={block.className} key={index}>
                    {Array.from(block.text).slice(0, shown).join('')}
                    {index === active && typed < total ? (
                      <span className="letter-caret" />
                    ) : null}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <PageNav onNavigate={onNavigate} next="gallery" nextLabel={nav.next} />
    </section>
  );
}
