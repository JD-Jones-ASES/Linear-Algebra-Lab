import { withBase } from '../../lib/basePath';
import { THEOREMS } from '../../lib/connect/theorems';
import '../shared/workshop.css';

export default function TheoremShelf() {
  return (
    <div className="workshop">
      <header className="workshop__head">
        <h1>Theorem shelf</h1>
        <p className="workshop__lede">
          Sticky notes for pictures you can already see on the desk. Each stop
          deep-links into a prepared room — no extra clicks.
        </p>
      </header>

      <div className="thm-shelf">
        {THEOREMS.map((t) => (
          <article key={t.id} id={t.id} className="thm-card panel">
            <h2 className="panel__title">{t.name}</h2>
            <p className="thm-card__formal mono">{t.formal}</p>
            <p className="panel__meta">{t.why}</p>
            <p className="thm-card__look">
              <strong>Look for:</strong> {t.lookFor}
            </p>
            <ul className="thm-card__stops">
              {t.stops.map((s) => (
                <li key={s.href}>
                  <a href={withBase(s.href)}>{s.label}</a>
                  <span className="thm-card__lookat"> — {s.lookAt}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
