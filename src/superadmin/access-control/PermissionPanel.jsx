import {
  ShieldCheck,
  Mail,
  Building2,
  RotateCcw,
  CheckCheck,
  XCircle,
  UserRound,
  LockKeyhole,
  Check,
  Info,
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

function Toggle({
  enabled,
  onChange,
  label,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={enabled}
      onClick={() =>
        onChange(!enabled)
      }
      className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition ${
        enabled
          ? "bg-slate-900"
          : "bg-slate-200"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
          enabled
            ? "translate-x-5"
            : "translate-x-0"
        }`}
      >
        {enabled && (
          <Check
            size={11}
            strokeWidth={3}
            className="text-slate-900"
          />
        )}
      </span>
    </button>
  );
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
      <div className="flex min-h-[650px] items-center justify-center rounded-3xl border border-slate-200 bg-white">

        <div className="max-w-sm px-6 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ShieldCheck
              size={24}
              className="text-slate-500"
            />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Select a staff member
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Choose someone from the staff list to manage their ERP access.
          </p>

        </div>
      </div>
    );
  }

  const enabledCount =
    modules.filter(
      (moduleName) => {
        const key =
          String(moduleName)
            .toLowerCase()
            .replace(/\s+/g, "_");

        return permissions[key];
      }
    ).length;

  const accessPercentage =
    modules.length
      ? Math.round(
          (enabledCount /
            modules.length) *
            100
        )
      : 0;

  const passwordAccess =
    Boolean(
      profilePermissions?.resetPassword
    );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">

      {/* USER HEADER */}

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

          {/* ACCESS OVERVIEW */}

          <div className="min-w-[190px] rounded-2xl border border-slate-100 bg-slate-50 p-4">

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  Module access
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {enabledCount}
                  <span className="text-sm font-normal text-slate-400">
                    {" "}
                    / {modules.length}
                  </span>
                </p>
              </div>

              <span className="text-xs font-medium text-slate-500">
                {accessPercentage}%
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${accessPercentage}%`,
                }}
              />
            </div>

          </div>

        </div>
      </div>

      {/* MODULE HEADER */}

      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Module Access
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            Choose which areas of the ERP this user can access.
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

      {/* SCROLL AREA */}

      <div className="h-[480px] overflow-y-auto p-4 sm:p-6">

        {/* MODULES */}

        <div className="space-y-2">

          {modules.map(
            (moduleName) => {
              const key =
                String(moduleName)
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    "_"
                  );

              return (
                <ModulePermissionRow
                  key={moduleName}
                  moduleName={
                    moduleName
                  }
                  enabled={Boolean(
                    permissions[key]
                  )}
                  onChange={(
                    value
                  ) =>
                    onPermissionChange(
                      moduleName,
                      value
                    )
                  }
                />
              );
            }
          )}

        </div>

        {/* ACCOUNT CAPABILITIES */}

        <div className="mt-6 border-t border-slate-100 pt-6">

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Account Capabilities
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Controls actions the user can perform on their own account.
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">

            {/* BASIC PROFILE */}

            <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-4">

              <div className="flex min-w-0 items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <UserRound
                    size={17}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Basic profile
                  </p>

                  <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
                    View name, contact details and account information.
                  </p>
                </div>

              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">

                <Check
                  size={12}
                  strokeWidth={3}
                  className="text-slate-600"
                />

                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Always Available
                </span>

              </div>

            </div>

            {/* PASSWORD */}

            <div className="flex items-center justify-between gap-4 p-4">

              <div className="flex min-w-0 items-start gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    passwordAccess
                      ? "bg-slate-100"
                      : "bg-slate-50"
                  }`}
                >
                  <LockKeyhole
                    size={17}
                    className={
                      passwordAccess
                        ? "text-slate-600"
                        : "text-slate-400"
                    }
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Password changes
                  </p>

                  <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
                    Allow this user to change their account password from the profile menu.
                  </p>
                </div>

              </div>

              <Toggle
                enabled={
                  passwordAccess
                }
                label="Password changes"
                onChange={(value) =>
                  onProfilePermissionChange(
                    "resetPassword",
                    value
                  )
                }
              />

            </div>

          </div>

          <div className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
            <Info
              size={13}
              className="mt-0.5 shrink-0"
            />

            <p>
              Basic profile access is always available so users can verify their own account information and access account controls.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}