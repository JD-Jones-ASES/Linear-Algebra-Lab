import { withBase } from '../../lib/basePath';
import type { NamedTheorem } from '../../lib/connect/theorems';

interface Props {
  theorems: NamedTheorem[];
}

export function TheoremChipRow({ theorems }: Props) {
  if (theorems.length === 0) return null;
  return (
    <div className="thm-chips" role="navigation" aria-label="Related theorems">
      <span className="thm-chips__label">Theorems</span>
      <ul className="thm-chips__list">
        {theorems.map((t) => (
          <li key={t.id}>
            <a className="thm-chip" href={withBase(`/theorems#${t.id}`)}>
              {t.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
