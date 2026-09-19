import {
  Calendar,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const statuses = [
  "All",
  "Draft",
  "Ready to Dispatch",
  "Dispatched",
  "In Transit",
  "Delivered",
  "Cancelled",
];

export default function DispatchFilters({
  filters,
  setFilters,
}) {
  const hasFilters =
    filters.search ||
    filters.status !== "All" ||
    filters.date;

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "All",
      date: "",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              updateFilter("search", e.target.value)
            }
            placeholder="Search dispatch ID, customer or sale bill..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={16}
            className="text-slate-400"
          />

          <select
            value={filters.status}
            onChange={(e) =>
              updateFilter("status", e.target.value)
            }
            className="h-10 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All"
                  ? "All Statuses"
                  : status}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Calendar
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              updateFilter("date", e.target.value)
            }
            className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}