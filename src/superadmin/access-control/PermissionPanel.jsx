import {
  ShieldCheck,
  User,
  Mail,
  Building2,
  Check,
  RotateCcw,
  CheckCheck,
  XCircle,
} from "lucide-react";

import ModulePermissionRow from "./ModulePermissionRow";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function PermissionPanel({
  staff,
  modules,
  permissions,
  onPermissionChange,
  onEnableAll,
  onDisableAll,
  onReset,
}) {
  if (!staff) {
    return (
      <div className="flex min-h-[650px] items-center justify-center rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">

        <div className="max-w-sm px-6 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ShieldCheck
              size={25}
              className="text-slate-500"
            />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Select a staff member
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Choose someone from the staff list to view and
            manage their module permissions.
          </p>

        </div>
      </div>
    );
  }

  const enabledCount = modules.filter((moduleName) => {
    const key = String(moduleName)
      .toLowerCase()
      .replace(/\s+/g, "_");

    return permissions[key];
  }).length;

  const role = String(staff.role || "").toLowerCase();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">

      {/* Staff header */}
      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {getInitials(
                staff.name ||
                  staff.fullName ||
                  "Staff"
              )}
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {staff.name ||
                    staff.fullName ||
                    "Unknown Staff"}
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {staff.role}
                </span>

              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">

                {staff.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail
                      size={12}
                      className="text-slate-400"
                    />

                    <span className="text-xs text-slate-400">
                      {staff.email}
                    </span>
                  </div>
                )}

                {staff.department && (
                  <div className="flex items-center gap-1.5">
                    <Building2
                      size={12}
                      className="text-slate-400"
                    />

                    <span className="text-xs text-slate-400">
                      {staff.department}
                    </span>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Permission count */}
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-center">
              <p className="text-lg font-semibold text-slate-900">
                {enabledCount}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Enabled
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-center">
              <p className="text-lg font-semibold text-slate-900">
                {modules.length - enabledCount}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Disabled
              </p>
            </div>

          </div>
        </div>

        {/* Admin notice */}
        {role === "admin" && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">

            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-slate-600"
            />

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Company-wide Admin
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Admins are company stakeholders and can be
                granted access to modules across all departments.
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Module Permissions
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            Enable or disable individual modules.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={onEnableAll}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <CheckCheck size={14} />
            Enable All
          </button>

          <button
            type="button"
            onClick={onDisableAll}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <XCircle size={14} />
            Disable All
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw size={14} />
            Reset
          </button>

        </div>
      </div>

      {/* Modules */}
      <div className="p-4 sm:p-6">

        <div className="space-y-2">

          {modules.map((moduleName) => {
            const key = String(moduleName)
              .toLowerCase()
              .replace(/\s+/g, "_");

            return (
              <ModulePermissionRow
                key={moduleName}
                moduleName={moduleName}
                enabled={Boolean(permissions[key])}
                onChange={(value) =>
                  onPermissionChange(
                    moduleName,
                    value
                  )
                }
              />
            );
          })}

        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">

          <Check
            size={15}
            className="text-emerald-500"
          />

          <p className="text-xs text-slate-500">
            Changes are currently stored locally in this
            session. Backend persistence will be added later.
          </p>

        </div>
      </div>
    </div>
  );
}