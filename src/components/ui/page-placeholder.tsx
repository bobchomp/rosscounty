type PagePlaceholderProps = {
  title: string;
  intro: string;
  sections: string[];
};

/**
 * Generic "coming soon" section for pages that don't have real content yet.
 * Swap out per-page once data/design is ready.
 */
export function PagePlaceholder({ title, intro, sections }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-club-gold-dark">
        Ross County FC
      </p>
      <h1 className="mt-2 text-3xl font-bold text-club-navy sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-neutral-600">{intro}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section}
            className="rounded-xl border border-dashed border-club-navy/20 bg-club-navy/[0.03] p-6"
          >
            <p className="text-sm font-medium text-club-navy">{section}</p>
            <p className="mt-1 text-xs text-neutral-500">Content coming soon.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
