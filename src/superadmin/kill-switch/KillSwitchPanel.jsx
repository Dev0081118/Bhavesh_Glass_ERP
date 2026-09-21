import {
  Power,
  ShieldCheck,
  Info,
} from "lucide-react";

const KillSwitchPanel = ({
  isSystemActive,
  onDisable,
  onEnable,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="max-w-2xl">

          <h2 className="text-sm font-semibold text-slate-900">
            Global ERP Access
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {isSystemActive
              ? "Pause ERP access when maintenance or an emergency requires staff to temporarily stop using the system."
              : "ERP access is paused. Enable the system when staff can safely resume work."}
          </p>

          <div className="mt-3 flex items-start gap-2">

            <Info
              size={14}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <p className="text-xs leading-5 text-slate-400">
              This does not deactivate staff accounts or change module permissions.
            </p>

          </div>

        </div>

        <div className="shrink-0">

          {isSystemActive ? (
            <button
              type="button"
              onClick={onDisable}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
            >
              <Power size={16} />

              Pause ERP Access
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnable}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              <ShieldCheck size={16} />

              Restore ERP Access
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default KillSwitchPanel;