import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  Truck,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={19} className="text-slate-700" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function LRSummary({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        icon={Truck}
        label="Total LR"
        value={summary.total}
        description="Total logistics records"
      />

      <SummaryCard
        icon={CheckCircle2}
        label="Delivered"
        value={summary.delivered}
        description="Successfully delivered"
      />

      <SummaryCard
        icon={Truck}
        label="In Transit"
        value={summary.inTransit}
        description="Currently moving"
      />

      <SummaryCard
        icon={Clock3}
        label="Pending"
        value={summary.pending}
        description="Not yet delivered"
      />

      <SummaryCard
        icon={IndianRupee}
        label="Pending Freight"
        value={formatCurrency(summary.pendingFreight)}
        description="Freight payment pending"
      />
    </div>
  );
}

export default LRSummary;