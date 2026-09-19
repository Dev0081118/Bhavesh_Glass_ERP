import {
  ClipboardList,
  IndianRupee,
  PackageCheck,
  Clock3,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PurchaseSummary({ summary }) {
  const cards = [
    {
      label: "Total Purchases",
      value: summary.total,
      icon: ClipboardList,
      description: "All purchase records",
    },
    {
      label: "Pending / Ordered",
      value: summary.pending,
      icon: Clock3,
      description: "Awaiting completion",
    },
    {
      label: "Received",
      value: summary.received,
      icon: PackageCheck,
      description: "Completed purchases",
    },
    {
      label: "Purchase Value",
      value: formatCurrency(summary.purchaseValue),
      icon: IndianRupee,
      description: "Total purchase amount",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {card.value}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon size={18} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}