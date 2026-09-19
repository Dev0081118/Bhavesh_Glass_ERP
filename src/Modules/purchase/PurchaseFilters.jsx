import {
  CalendarDays,
  Filter,
  Search,
  X,
} from "lucide-react";

const statuses = [
  "Draft",
  "Pending",
  "Ordered",
  "Partially Received",
  "Received",
  "Cancelled",
];

export default function PurchaseFilters({
  search,
  setSearch,
  supplierFilter,
  setSupplierFilter,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  suppliers,
  onClear,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search purchase ID, supplier..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Filter
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-slate-400 sm:w-52"
            >
              <option value="All">All Suppliers</option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 sm:w-44"
          >
            <option value="All">All Status</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="relative">
            <CalendarDays
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>

          <button
            onClick={onClear}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={15} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}