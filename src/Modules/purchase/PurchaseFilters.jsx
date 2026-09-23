import {
  CalendarDays,
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
  search = "",
  setSearch = () => {},

  supplierFilter = "All",
  setSupplierFilter = () => {},

  statusFilter = "All",
  setStatusFilter = () => {},

  dateFilter = "",
  setDateFilter = () => {},

  suppliers = [],

  onClear = () => {},
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search purchase, supplier..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Supplier */}
          <select
            value={supplierFilter}
            onChange={(event) =>
              setSupplierFilter(
                event.target.value
              )
            }
            className="h-10 min-w-[190px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="All">
              All Suppliers
            </option>

            {Array.isArray(
              suppliers
            ) &&
              suppliers.map(
                (supplier) => {
                  const id =
                    supplier.id ||
                    supplier._id;

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {supplier.name}
                    </option>
                  );
                }
              )}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-10 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="All">
              All Statuses
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          {/* Date */}
          <div className="relative">
            <CalendarDays
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event.target.value
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>

          {/* Clear */}
          <button
            type="button"
            onClick={onClear}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={15} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}