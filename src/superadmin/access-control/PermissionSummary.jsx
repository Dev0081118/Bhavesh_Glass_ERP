import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon
            size={18}
            className="text-slate-700"
          />
        </div>

      </div>
    </div>
  );
}

export default function PermissionSummary({
  totalStaff,
  filteredStaff,
  enabledCount,
  disabledCount,
  totalModules,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

      <SummaryCard
        icon={Users}
        label="Total Staff"
        value={totalStaff}
        description={`${filteredStaff} currently shown`}
      />

      <SummaryCard
        icon={ShieldCheck}
        label="Modules"
        value={totalModules}
        description="Available system modules"
      />

      <SummaryCard
        icon={CheckCircle2}
        label="Enabled"
        value={enabledCount}
        description="For selected staff"
      />

      <SummaryCard
        icon={XCircle}
        label="Disabled"
        value={disabledCount}
        description="For selected staff"
      />

    </div>
  );
}