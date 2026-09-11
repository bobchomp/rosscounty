export function SupabaseNotConfigured() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-club-navy">
          Admin panel not connected yet
        </h1>
        <p className="mt-3 text-sm text-amber-900">
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment (see{" "}
          <code>.env.local.example</code>), then create an admin user in
          Supabase Auth to sign in.
        </p>
      </div>
    </div>
  );
}
