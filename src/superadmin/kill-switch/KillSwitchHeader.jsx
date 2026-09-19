import { ShieldAlert } from "lucide-react";

const KillSwitchHeader = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
            Emergency Control
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Kill Switch
        </h1>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Control the global availability of the ERP system. Disabling the
          system will prevent all users from accessing the software.
        </p>
      </div>
    </div>
  );
};

export default KillSwitchHeader;