import { gallery, memories, nav } from '../content';
import { useReveal } from '../lib/motion';
import PageNav from './PageNav';
import '../styles/gallery.css';

function Memory({ memory, index }) {
  const [ref, seen] = useReveal();
  const flipped = index % 2 === 1;

  return (
    <li
      ref={ref}
      className={`memory${flipped ? ' memory--flipped' : ''}${seen ? ' is-visible' : ''}`}
    >
      <figure className="memory-figure">
        {memory.src ? (
          <img className="memory-photo" src={memory.src} alt={memory.alt} loading="lazy" />
        ) : (
          <div className="memory-empty">
            Drop a photo at <code>public/photos/</code> and point this memory at it in{' '}
            <code>content.js</code>.
          </div>
        )}
      </figure>

      <div className="memory-story">
        <h2 className="memory-title display">{memory.title}</h2>
        <p className="memory-text">{memory.story}</p>
      </div>
    </li>
  );
}

export default function Gallery({ onNavigate }) {
  return (
    <section className="gallery">
      <h1 className="gallery-heading display" data-page-heading tabIndex={-1}>
        {gallery.heading}
      </h1>
      <p className="gallery-invitation">{gallery.invitation}</p>

      <ul className="gallery-list">
        {memories.map((memory, index) => (
          <Memory key={memory.title} memory={memory} index={index} />
        ))}
      </ul>

      <PageNav onNavigate={onNavigate} next="cake" nextLabel={nav.next} />
    </section>
  );
}
