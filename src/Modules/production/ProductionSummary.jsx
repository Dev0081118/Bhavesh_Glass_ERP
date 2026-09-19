import {
  ClipboardList,
  Factory,
  CheckCircle2,
  Boxes,
} from "lucide-react";

export default function ProductionSummary({ productions }) {
  const totalOrders = productions.length;

  const activeOrders = productions.filter(
    (item) =>
      item.status === "Planned" ||
      item.status === "In Progress" ||
      item.status === "Partially Completed"
  ).length;

  const completedOrders = productions.filter(
    (item) => item.status === "Completed"
  ).length;

  const totalProduced = productions.reduce(
    (sum, item) => sum + Number(item.completedQuantity || 0),
    0
  );

  const cards = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ClipboardList,
      description: "All production orders",
    },
    {
      label: "Active Production",
      value: activeOrders,
      icon: Factory,
      description: "Planned / in progress",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: CheckCircle2,
      description: "Completed orders",
    },
    {
      label: "Total Produced",
      value: totalProduced.toLocaleString(),
      icon: Boxes,
      description: "Completed quantity",
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