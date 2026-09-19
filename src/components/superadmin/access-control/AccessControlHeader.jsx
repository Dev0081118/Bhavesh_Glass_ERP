import {
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

export default function AccessControlHeader({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  departmentFilter,
  setDepartmentFilter,
  departments,
}) {
  const hasFilters =
    search ||
    roleFilter !== "All" ||
    departmentFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setDepartmentFilter("All");
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>
          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
              <ShieldCheck
                size={17}
                className="text-white"
              />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Security
            </span>

          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Access Control
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Control which modules each Admin, Manager, and
            Employee can access across the software.
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search staff by name, email, phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}

          </div>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>

          {/* Department */}
          <select
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="All">All Departments</option>

            {departments.map((department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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