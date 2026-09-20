import {
  Activity,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "No changes recorded";

  const normalizedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(normalizedDate.getTime())) {
    return "No changes recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(normalizedDate);
};

const SystemStatusCard = ({ isSystemActive, systemInfo }) => {
  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
        isSystemActive ? "border-emerald-100" : "border-red-100"
      }`}
    >
      <div
        className={`border-b px-6 py-5 sm:px-8 ${
          isSystemActive
            ? "border-emerald-100 bg-emerald-50/50"
            : "border-red-100 bg-red-50/50"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isSystemActive ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {isSystemActive ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Current System Status
              </p>

              <h2
                className={`mt-1 text-xl font-semibold ${
                  isSystemActive ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {isSystemActive
                  ? "System Operational"
                  : "System Disabled"}
              </h2>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isSystemActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSystemActive ? "bg-emerald-500" : "bg-red-500"
              }`}
            />

            {isSystemActive ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-slate-400" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-800">
            {isSystemActive ? "Available to all users" : "Access blocked"}
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-4 w-4 text-slate-400" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last Changed
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-800">
            {formatDate(systemInfo.lastChangedAt)}
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="flex items-center gap-3">
            <UserRound className="h-4 w-4 text-slate-400" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Changed By
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-800">
            {systemInfo.changedBy}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-slate-100 px-6 py-4 sm:px-8">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Last Action Reason
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {systemInfo.reason}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard;