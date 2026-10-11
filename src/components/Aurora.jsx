import '../styles/aurora.css';

/**
 * The animated background: the colour gradient, a confetti layer, four
 * curtains of light, and a sunny glow at the foot of the screen.
 *
 * `level`    scales how strong the display burns — a third at the gate, so
 *            the gradient reads as pastel, full once the page opens, and
 *            brighter with every wish sent up.
 * `igniting` runs the one-shot burst that plays when the password is right.
 * `variant`  swaps the gradient's stops per page. 'pink' is the hub.
 */
export default function Aurora({ level = 1, igniting = false, variant = 'party' }) {
  return (
    <div
      className={`aurora aurora--${variant}${igniting ? ' is-igniting' : ''}`}
      style={{ '--aurora-level': level }}
      aria-hidden="true"
    >
      <div className="aurora-flow" />
      <div className="aurora-stars" />
      <div className="aurora-field">
        <span className="aurora-ribbon aurora-ribbon--a" />
        <span className="aurora-ribbon aurora-ribbon--b" />
        <span className="aurora-ribbon aurora-ribbon--c" />
        <span className="aurora-ribbon aurora-ribbon--d" />
      </div>
      <div className="aurora-horizon" />
      <div className="aurora-bloom" />
    </div>
  );
}
