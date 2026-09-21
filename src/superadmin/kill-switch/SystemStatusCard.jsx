import {
  Clock3,
  UserRound,
  CheckCircle2,
  CircleOff,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) {
    return "No changes recorded";
  }

  const normalizedDate =
    date instanceof Date
      ? date
      : new Date(date);

  if (
    Number.isNaN(
      normalizedDate.getTime()
    )
  ) {
    return "No changes recorded";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(normalizedDate);
};

const SystemStatusCard = ({
  isSystemActive,
  systemInfo,
}) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">

        <div className="flex items-start gap-4">

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isSystemActive
                ? "bg-emerald-50"
                : "bg-red-50"
            }`}
          >
            {isSystemActive ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <CircleOff className="h-5 w-5 text-red-600" />
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Current Status
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {isSystemActive
                ? "ERP is available"
                : "ERP access is paused"}
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              {isSystemActive
                ? "Staff with active accounts and valid module permissions can access the system normally."
                : "Regular staff access is currently blocked. Super Admin access remains available."}
            </p>
          </div>

        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isSystemActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isSystemActive
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />

          {isSystemActive
            ? "Online"
            : "Paused"}
        </div>

      </div>

      <div className="grid border-t border-slate-100 sm:grid-cols-2">

        <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r">

          <div className="flex items-center gap-2 text-slate-400">
            <Clock3 size={14} />

            <p className="text-[11px] font-medium uppercase tracking-wide">
              Last changed
            </p>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-700">
            {formatDate(
              systemInfo.lastChangedAt
            )}
          </p>

        </div>

        <div className="p-5">

          <div className="flex items-center gap-2 text-slate-400">
            <UserRound size={14} />

            <p className="text-[11px] font-medium uppercase tracking-wide">
              Changed by
            </p>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-700">
            {systemInfo.changedBy ||
              "Super Admin"}
          </p>

        </div>

      </div>

      {systemInfo.reason && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Reason
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {systemInfo.reason}
          </p>

        </div>
      )}

    </div>
  );
};

export default SystemStatusCard;