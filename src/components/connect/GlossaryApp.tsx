import { useEffect, useMemo, useState } from 'react';
import { withBase } from '../../lib/basePath';
import {
  GLOSSARY,
  GLOSSARY_TAG_ORDER,
  type GlossaryTag,
  type GlossaryTerm,
} from '../../lib/connect/glossary';
import { clientParam } from '../../lib/connect/deepLink';

const TAG_LABEL: Record<GlossaryTag | 'all', string> = {
  all: 'All',
  matrix: 'Matrix',
  spaces: 'Spaces',
  solve: 'Solve',
  project: 'Project',
  basis: 'Basis',
  eigen: 'Eigen',
  theorems: 'Theorems',
  general: 'General',
};

export default function GlossaryApp() {
  const [tag, setTag] = useState<GlossaryTag | 'all'>('all');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = clientParam('tag');
    if (t && (GLOSSARY_TAG_ORDER as string[]).includes(t)) {
      setTag(t as GlossaryTag);
    }
    setReady(true);
  }, []);

  const filtered = useMemo(() => {
    if (tag === 'all') return GLOSSARY;
    return GLOSSARY.filter((g) => g.tags.includes(tag));
  }, [tag]);

  const byLetter = useMemo(() => groupByLetter(filtered), [filtered]);
  const letters = Object.keys(byLetter).sort();

  return (
    <div className="glossary-page" data-glossary-ready={ready ? 'true' : 'false'}>

      <header className="workshop__head" style={{ display: 'grid', gap: '0.35rem' }}>
        <h1 style={{ margin: 0 }}>Glossary</h1>
        <p className="workshop__lede" style={{ margin: 0, color: 'var(--chalk-dim)' }}>
          Dictionary entries with deep links into the desks. Filter by topic or jump
          by letter.
        </p>
      </header>

      <div className="glossary-toolbar">
        <div className="glossary-filters" role="group" aria-label="Filter by topic">
          <span className="glossary-filters__label">Topic</span>
          <div className="glossary-filters__chips">
            <button
              type="button"
              className={`glossary-filter${tag === 'all' ? ' is-on' : ''}`}
              aria-pressed={tag === 'all'}
              onClick={() => setTag('all')}
            >
              {TAG_LABEL.all}
            </button>
            {GLOSSARY_TAG_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                className={`glossary-filter${tag === t ? ' is-on' : ''}`}
                aria-pressed={tag === t}
                onClick={() => setTag(t)}
              >
                {TAG_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <nav className="glossary-jump" aria-label="Jump to letter">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) =>
            letters.includes(L) ? (
              <a key={L} href={`#letter-${L}`}>
                {L}
              </a>
            ) : (
              <span key={L} className="glossary-jump__empty">
                {L}
              </span>
            ),
          )}
        </nav>

        <p className="glossary-status" role="status">
          {filtered.length} term{filtered.length === 1 ? '' : 's'}
          {tag !== 'all' ? ` · topic ${TAG_LABEL[tag].toLowerCase()}` : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="glossary-empty">No terms for this filter.</p>
      ) : (
        letters.map((L) => (
          <section key={L} className="glossary-letter" id={`letter-${L}`}>
            <h2>{L}</h2>
            {byLetter[L]!.map((term) => (
              <article key={term.id} className="glossary-term" id={term.id}>
                <div className="glossary-term__head">
                  <h3>{term.term}</h3>
                  {term.also ? (
                    <p className="glossary-term__also">{term.also.join(' · ')}</p>
                  ) : null}
                </div>
                <p className="glossary-term__def">{term.def}</p>
                {term.see.length > 0 ? (
                  <ul className="glossary-term__see">
                    {term.see.map((s) => (
                      <li key={s.href + s.label}>
                        <a href={withBase(s.href)}>See it · {s.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="glossary-tags">
                  {term.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`glossary-tag${tag === t ? ' is-active' : ''}`}
                      onClick={() => setTag(t)}
                    >
                      {TAG_LABEL[t]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function groupByLetter(terms: GlossaryTerm[]): Record<string, GlossaryTerm[]> {
  const out: Record<string, GlossaryTerm[]> = {};
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term));
  for (const t of sorted) {
    const L = t.term[0]!.toUpperCase();
    if (!out[L]) out[L] = [];
    out[L]!.push(t);
  }
  return out;
}
