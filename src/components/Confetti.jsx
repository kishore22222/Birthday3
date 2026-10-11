import '../styles/confetti.css';

/**
 * A burst of falling confetti. Thrown for the three big moments — the gate
 * opening, the letter opening, the cake being cut — and nothing else, so it
 * stays a reward rather than decoration.
 */
export default function Confetti({ items, clearing }) {
  if (!items.length) return null;

  return (
    <div className={`confetti${clearing ? ' is-clearing' : ''}`} aria-hidden="true">
      {items.map((piece) => (
        <span
          key={piece.id}
          className={`confetti-piece${piece.round ? ' is-round' : ''}`}
          style={{
            left: `${piece.left}%`,
            top: `${piece.top}%`,
            '--piece-size': `${piece.size}px`,
            '--piece-delay': `${piece.delay}s`,
            '--piece-duration': `${piece.duration}s`,
            '--piece-drift': `${piece.drift}px`,
            '--piece-flutter': `${piece.flutter}px`,
            '--piece-spin': `${piece.spin}deg`,
            '--piece-hue': piece.hue,
          }}
        />
      ))}
    </div>
  );
}
