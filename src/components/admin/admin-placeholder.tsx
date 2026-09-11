type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-club-navy">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{description}</p>

      <div className="mt-8 rounded-xl border border-dashed border-club-navy/20 bg-white p-10 text-center">
        <p className="text-sm font-medium text-neutral-500">
          Management tools for this section aren&apos;t built yet.
        </p>
      </div>
    </div>
  );
}
