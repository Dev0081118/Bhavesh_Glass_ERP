import {
  Users,
  UserCheck,
  ShieldCheck,
  ShieldMinus,
} from "lucide-react";

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon
            size={18}
            className="text-slate-600"
          />
        </div>

      </div>
    </div>
  );
}

export default function PermissionSummary({
  totalStaff,
  activeStaff,
  fullAccess,
  restrictedAccess,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

      <SummaryCard
        icon={Users}
        label="Managed Users"
        value={totalStaff}
        description="Accounts under access control"
      />

      <SummaryCard
        icon={UserCheck}
        label="Active Accounts"
        value={activeStaff}
        description="Can currently sign in"
      />

      <SummaryCard
        icon={ShieldCheck}
        label="Full Access"
        value={fullAccess}
        description="All ERP modules enabled"
      />

      <SummaryCard
        icon={ShieldMinus}
        label="Restricted Access"
        value={restrictedAccess}
        description="One or more modules restricted"
      />

    </div>
  );
}