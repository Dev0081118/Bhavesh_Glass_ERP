import { Filter, RotateCcw, Search } from "lucide-react";

function LRFilters({
  filters,
  setFilters,
  lrs,
  onClear,
}) {
  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const transporters = [
    ...new Set(lrs.map((lr) => lr.transporter)),
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Filter size={16} className="text-slate-600" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Filters
            </h2>

            <p className="text-xs text-slate-400">
              Filter LR and transportation records
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
        >
          <RotateCcw size={14} />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="relative xl:col-span-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              updateFilter("search", e.target.value)
            }
            placeholder="Search LR, customer, vehicle..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            updateFilter("status", e.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Booked">Booked</option>
          <option value="Ready">Ready</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={filters.transporter}
          onChange={(e) =>
            updateFilter("transporter", e.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="All">All Transporters</option>

          {transporters.map((transporter) => (
            <option key={transporter} value={transporter}>
              {transporter}
            </option>
          ))}
        </select>

        <select
          value={filters.freightPaymentStatus}
          onChange={(e) =>
            updateFilter(
              "freightPaymentStatus",
              e.target.value
            )
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="All">All Freight Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            From Date
          </label>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              updateFilter("dateFrom", e.target.value)
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            To Date
          </label>

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              updateFilter("dateTo", e.target.value)
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>
    </div>
  );
}

export default LRFilters;