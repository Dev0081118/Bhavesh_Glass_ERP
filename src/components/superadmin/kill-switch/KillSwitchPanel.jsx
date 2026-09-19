import {
  AlertTriangle,
  LockKeyhole,
  Power,
  ShieldCheck,
} from "lucide-react";

const KillSwitchPanel = ({
  isSystemActive,
  onDisable,
  onEnable,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
            <LockKeyhole className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Global System Control
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              This control affects the entire ERP application. Use it only
              when you need to temporarily prevent every user from accessing
              the system.
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            isSystemActive
              ? "border-amber-100 bg-amber-50/60"
              : "border-red-100 bg-red-50/60"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                isSystemActive ? "text-amber-600" : "text-red-600"
              }`}
            />

            <div>
              <p
                className={`text-sm font-semibold ${
                  isSystemActive ? "text-amber-800" : "text-red-800"
                }`}
              >
                {isSystemActive
                  ? "Emergency shutdown control"
                  : "System access is currently blocked"}
              </p>

              <p
                className={`mt-1 text-sm leading-6 ${
                  isSystemActive ? "text-amber-700" : "text-red-700"
                }`}
              >
                {isSystemActive
                  ? "Disabling the system will immediately prevent all users from accessing the ERP application."
                  : "Users will remain blocked until the Super Admin enables the system again."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isSystemActive ? (
            <button
              type="button"
              onClick={onDisable}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Power className="h-4 w-4" />
              Disable Entire System
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnable}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Enable System
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KillSwitchPanel;