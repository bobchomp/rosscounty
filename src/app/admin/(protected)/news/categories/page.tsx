import { createClient } from "@/lib/supabase/server";
import { getCategories, getCategoryArticleCounts } from "@/lib/news/queries";
import { SupabaseNotConfigured } from "@/components/admin/supabase-not-configured";
import { createCategory, deleteCategory, updateCategory } from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-club-navy focus:outline-none";
const labelClass = "block text-xs font-medium text-neutral-500";
const buttonClass =
  "rounded-md bg-club-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-club-navy-light";
const dangerButtonClass =
  "rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50";

export default async function AdminNewsCategoriesPage(
  props: PageProps<"/admin/news/categories">
) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : null;

  const supabase = await createClient();
  if (!supabase) return <SupabaseNotConfigured />;

  const [categories, counts] = await Promise.all([
    getCategories(supabase),
    getCategoryArticleCounts(supabase),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-club-navy">News Categories</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Manage the categories articles can be tagged with.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</p>
      )}

      <section className="mt-6 rounded-xl border border-club-navy/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-club-navy">Add a category</h2>
        <form action={createCategory} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className={labelClass} htmlFor="name">Name</label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="sort_order">Sort order</label>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={categories.length + 1}
              className={`${inputClass} w-24`}
            />
          </div>
          <button type="submit" className={buttonClass}>
            Add category
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-club-navy/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-club-navy">Categories</h2>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No categories yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {categories.map((category) => {
              const count = counts[category.id] ?? 0;
              return (
                <form key={category.id} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="id" value={category.id} />
                  <div>
                    <label className={labelClass} htmlFor={`name-${category.id}`}>Name</label>
                    <input
                      id={`name-${category.id}`}
                      name="name"
                      defaultValue={category.name}
                      className={`${inputClass} w-48`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`sort-${category.id}`}>Sort order</label>
                    <input
                      id={`sort-${category.id}`}
                      name="sort_order"
                      type="number"
                      defaultValue={category.sort_order}
                      className={`${inputClass} w-20`}
                    />
                  </div>
                  <span className="text-xs text-neutral-500">
                    {count} article{count === 1 ? "" : "s"}
                  </span>
                  <button formAction={updateCategory} className={buttonClass}>
                    Save
                  </button>
                  <button formAction={deleteCategory} className={dangerButtonClass}>
                    Delete
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
