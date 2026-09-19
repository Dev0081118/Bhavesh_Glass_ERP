import {
  ShieldCheck,
  UserCog,
  BriefcaseBusiness,
  ChevronRight,
} from "lucide-react";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getRoleIcon(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "admin") {
    return ShieldCheck;
  }

  if (normalized === "manager") {
    return UserCog;
  }

  return BriefcaseBusiness;
}

export default function StaffPermissionList({
  staff,
  selectedStaffId,
  setSelectedStaffId,
  permissions,
  modules,
}) {
  return (
    <div className="flex min-h-[650px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">

      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Staff
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Select a person to manage access
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {staff.length}
          </span>

        </div>
      </div>

      {/* Staff */}
      <div className="flex-1 overflow-y-auto p-3">

        {staff.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium text-slate-600">
                No staff found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">

            {staff.map((person) => {
              const name =
                person.name ||
                person.fullName ||
                "Unknown Staff";

              const RoleIcon = getRoleIcon(person.role);

              const personPermissions =
                permissions[person.id] || {};

              const enabledCount =
                modules.filter(
                  (moduleName) =>
                    personPermissions[
                      String(moduleName)
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                    ]
                ).length;

              const selected =
                String(selectedStaffId) ===
                String(person.id);

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() =>
                    setSelectedStaffId(person.id)
                  }
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    selected
                      ? "border-slate-300 bg-slate-50 shadow-sm"
                      : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                  }`}
                >

                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                      selected
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getInitials(name)}
                  </div>

                  {/* Information */}
                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {name}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">

                      <RoleIcon
                        size={11}
                        className="text-slate-400"
                      />

                      <span className="truncate text-[11px] text-slate-400">
                        {person.role}
                        {person.department
                          ? ` · ${person.department}`
                          : ""}
                      </span>

                    </div>

                    <div className="mt-2 flex items-center gap-2">

                      <span className="text-[10px] font-medium text-slate-400">
                        {enabledCount}/{modules.length} modules
                      </span>

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          String(person.status).toLowerCase() ===
                          "inactive"
                            ? "bg-slate-300"
                            : "bg-emerald-500"
                        }`}
                      />

                    </div>

                  </div>

                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition ${
                      selected
                        ? "text-slate-700"
                        : "text-slate-300 group-hover:text-slate-500"
                    }`}
                  />

                </button>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}