import {
  CalendarDays,
  Filter,
  Search,
  X,
} from "lucide-react";

const statuses = [
  "All",
  "Completed",
  "Pending",
  "Failed",
  "Cancelled",
];

const paymentModes = [
  "All",
  "Cash",
  "UPI",
  "Bank Transfer",
  "Cheque",
  "Card",
];

export default function PaymentFilters({
  filters,
  setFilters,
}) {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "All",
      paymentMode: "All",
      date: "",
    });
  };

  const hasFilters =
    filters.search ||
    filters.status !== "All" ||
    filters.paymentMode !== "All" ||
    filters.date;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter
            size={17}
            className="text-slate-500"
          />

          <h2 className="text-sm font-semibold text-slate-800">
            Filters
          </h2>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
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
            placeholder="Search payment, bill, customer..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            updateFilter("status", e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "All"
                ? "All Payment Statuses"
                : status}
            </option>
          ))}
        </select>

        <select
          value={filters.paymentMode}
          onChange={(e) =>
            updateFilter("paymentMode", e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {paymentModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode === "All"
                ? "All Payment Modes"
                : mode}
            </option>
          ))}
        </select>

        <div className="relative">
          <CalendarDays
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              updateFilter("date", e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
        </div>
      </div>
    </div>
  );
}