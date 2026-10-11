import { nav } from '../content';
import '../styles/nav.css';

/**
 * The two ways out of any surprise: back to the hub, or on to the next one.
 * Rendered at the end of each page rather than pinned, so it never covers
 * content on a small screen.
 */
export default function PageNav({ onNavigate, next, nextLabel }) {
  return (
    <nav className="pagenav" aria-label="Between the surprises">
      <button className="pagenav-back" type="button" onClick={() => onNavigate('boxes')}>
        <span className="pagenav-arrow" aria-hidden="true">
          ←
        </span>
        {nav.back}
      </button>

      {next ? (
        <button className="pagenav-next" type="button" onClick={() => onNavigate(next)}>
          {nextLabel ?? nav.next}
          <span className="pagenav-arrow" aria-hidden="true">
            →
          </span>
        </button>
      ) : null}
    </nav>
  );
}
