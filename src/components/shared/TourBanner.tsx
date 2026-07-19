/** Amber banner for deep-link landings — what to look at. */

interface Props {
  title?: string;
  expect: string | null;
  detail?: string;
  thmId?: string | null;
}

export function TourBanner({ title, expect, detail, thmId }: Props) {
  if (!expect && !title) return null;
  return (
    <aside className="tour-banner" role="status" aria-live="polite">
      <div className="tour-banner__kicker">
        {thmId ? 'Theorem sticky note' : 'Look here'}
      </div>
      {title ? <strong className="tour-banner__title">{title}</strong> : null}
      {expect ? <p className="tour-banner__expect">{expect}</p> : null}
      {detail ? <p className="tour-banner__detail">{detail}</p> : null}
    </aside>
  );
}
