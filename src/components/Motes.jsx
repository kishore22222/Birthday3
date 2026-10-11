import '../styles/motes.css';

/** Specks of colour drifting up — one per wish sent, plus the odd handful. */
export default function Motes({ items }) {
  if (!items.length) return null;

  return (
    <div className="motes" aria-hidden="true">
      {items.map((mote) => (
        <span
          key={mote.id}
          className="mote"
          style={{
            left: `${mote.left}%`,
            '--mote-size': `${mote.size}px`,
            '--mote-delay': `${mote.delay}s`,
            '--mote-duration': `${mote.duration}s`,
            '--mote-drift': `${mote.drift}px`,
            '--mote-spin': `${mote.spin}deg`,
            '--mote-hue': mote.hue,
          }}
        />
      ))}
    </div>
  );
}
