import {
  Power,
} from "lucide-react";

const KillSwitchHeader = () => {
  return (
    <div>
      <div className="flex items-center gap-2">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
          <Power
            size={17}
            className="text-slate-600"
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            System Control
          </h1>
        </div>

      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        Control whether staff can access the ERP. Super Admin access remains available during a shutdown.
      </p>
    </div>
  );
};

export default KillSwitchHeader;