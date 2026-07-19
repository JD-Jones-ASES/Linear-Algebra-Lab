import { withBase } from '../../lib/basePath';
import { TOURS } from '../../lib/connect/tours';
import '../shared/workshop.css';

export default function ConnectionsTour() {
  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Connections</h1>
        <p className="workshop__lede">
          Short human tours across rooms. Every stop lands fully prepared — preset,
          focus, and a banner saying what to stare at.
        </p>
      </header>

      <div className="tour-list">
        {TOURS.map((tour) => (
          <article key={tour.id} id={tour.id} className="panel">
            <h2 className="panel__title">{tour.title}</h2>
            <p className="panel__meta">{tour.blurb}</p>
            <ol className="tour-stops">
              {tour.stops.map((s, i) => (
                <li key={s.href}>
                  <a href={withBase(s.href)}>
                    {i + 1}. {s.label}
                  </a>
                  <span className="thm-card__lookat"> — look at: {s.lookAt}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}
