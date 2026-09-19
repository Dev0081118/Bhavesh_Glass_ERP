import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";

export default function DispatchSummary({ dispatches }) {
  const total = dispatches.length;

  const pending = dispatches.filter(
    (item) =>
      item.status === "Draft" ||
      item.status === "Ready to Dispatch"
  ).length;

  const inTransit = dispatches.filter(
    (item) => item.status === "In Transit"
  ).length;

  const delivered = dispatches.filter(
    (item) => item.status === "Delivered"
  ).length;

  const cards = [
    {
      label: "Total Dispatches",
      value: total,
      icon: Truck,
      description: "All dispatch orders",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      description: "Draft / ready",
    },
    {
      label: "In Transit",
      value: inTransit,
      icon: PackageCheck,
      description: "Currently moving",
    },
    {
      label: "Delivered",
      value: delivered,
      icon: CheckCircle2,
      description: "Successfully delivered",
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
                <p className="text-xs font-medium text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {card.value}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
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