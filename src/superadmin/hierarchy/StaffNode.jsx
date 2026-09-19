import {
  Mail,
  Phone,
  MoreHorizontal,
  UserCog,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

export default function StaffNode({
  staff,
  compact = false,
  onSelect,
  selected = false,
}) {
  const name = staff.name || staff.fullName || "Unknown Staff";

  const role = staff.role || "Employee";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const normalizedRole = String(role).toLowerCase();

  const RoleIcon =
    normalizedRole === "admin"
      ? ShieldCheck
      : normalizedRole === "manager"
      ? UserCog
      : BriefcaseBusiness;

  const roleLabel =
    normalizedRole.charAt(0).toUpperCase() +
    normalizedRole.slice(1);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(staff)}
        className={`group flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
          selected
            ? "border-slate-400 bg-slate-50 shadow-sm"
            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-600">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-800">
            {name}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-slate-400">
            Employee
          </p>
        </div>

        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            String(staff.status).toLowerCase() === "inactive"
              ? "bg-slate-300"
              : "bg-emerald-500"
          }`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(staff)}
      className={`group w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-slate-400 bg-slate-50 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <RoleIcon size={11} className="text-slate-400" />

                <span className="text-[11px] font-medium text-slate-500">
                  {roleLabel}
                </span>
              </div>
            </div>

            <MoreHorizontal
              size={16}
              className="shrink-0 text-slate-300 transition group-hover:text-slate-500"
            />
          </div>

          {/* Contact */}
          <div className="mt-3 space-y-1">

            {staff.email && (
              <div className="flex min-w-0 items-center gap-1.5">
                <Mail
                  size={11}
                  className="shrink-0 text-slate-400"
                />

                <span className="truncate text-[10px] text-slate-400">
                  {staff.email}
                </span>
              </div>
            )}

            {staff.phone && (
              <div className="flex items-center gap-1.5">
                <Phone
                  size={11}
                  className="shrink-0 text-slate-400"
                />

                <span className="text-[10px] text-slate-400">
                  {staff.phone}
                </span>
              </div>
            )}

          </div>

          {/* Status */}
          <div className="mt-3 flex items-center justify-between">

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium ${
                String(staff.status).toLowerCase() === "inactive"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  String(staff.status).toLowerCase() === "inactive"
                    ? "bg-slate-400"
                    : "bg-emerald-500"
                }`}
              />

              {String(staff.status).toLowerCase() === "inactive"
                ? "Inactive"
                : "Active"}
            </span>

            {staff.department && (
              <span className="max-w-[90px] truncate text-[9px] text-slate-400">
                {staff.department}
              </span>
            )}

          </div>
        </div>

      </div>
    </button>
  );
}