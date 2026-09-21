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
  profilePermissions,
  onPermissionChange,
  onEnableAll,
  onDisableAll,
  onReset,
  onProfilePermissionChange,
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
          <div className="flex  items-center gap-3">

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
      <div className="p-4 h-[500px] overflow-y-auto sm:p-6">

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

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Profile Permissions
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Control profile visibility and account actions.
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              ["view", "View profile"],
              ["edit", "Edit profile"],
              ["resetPassword", "Reset password"],
            ].map(([permission, label]) => {
              const enabled = Boolean(profilePermissions?.[permission]);

              return (
                <button
                  key={permission}
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => onProfilePermissionChange(permission, !enabled)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                    enabled
                      ? "border-slate-300 bg-white text-slate-800"
                      : "border-slate-100 bg-slate-100 text-slate-400"
                  }`}
                >
                  {label}
                  <span className={`h-2 w-2 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                </button>
              );
            })}
          </div>
        </div> 
      </div>
    </div>
  );
}