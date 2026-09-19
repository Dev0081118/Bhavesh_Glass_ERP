import { Search, SlidersHorizontal, X } from "lucide-react";

export default function ProductFilters({
  search,
  setSearch,
  category,
  setCategory,
  type,
  setType,
  status,
  setStatus,
  categories,
  types,
}) {
  const hasFilters =
    search ||
    category !== "All" ||
    type !== "All" ||
    status !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setType("All");
    setStatus("All");
  };

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU or ID..."
            className="
              w-full rounded-xl border border-slate-200
              bg-slate-50 py-2.5 pl-10 pr-4 text-sm
              text-slate-900 outline-none transition
              placeholder:text-slate-400
              focus:border-slate-400 focus:bg-white
            "
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={16}
            className="text-slate-400"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
          >
            <option value="All">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
          >
            <option value="All">All Types</option>

            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="
                flex items-center gap-1.5 rounded-xl px-3 py-2.5
                text-sm text-slate-500 transition hover:bg-slate-100
                hover:text-slate-900
              "
            >
              <X size={15} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}