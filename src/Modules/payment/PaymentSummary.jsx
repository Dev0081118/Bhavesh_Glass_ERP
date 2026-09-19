import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Wallet,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function PaymentSummary({ summary }) {
  const cards = [
    {
      label: "Total Payments",
      value: summary.totalPayments,
      icon: CreditCard,
      description: "All payment records",
    },
    {
      label: "Total Received",
      value: formatCurrency(summary.totalReceived),
      icon: Wallet,
      description: "Completed payments",
    },
    {
      label: "Completed",
      value: summary.completedCount,
      icon: CheckCircle2,
      description: "Successful payments",
    },
    {
      label: "Pending",
      value: summary.pendingCount,
      icon: Clock3,
      description: "Awaiting completion",
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
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Icon
                  size={19}
                  className="text-slate-600"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}