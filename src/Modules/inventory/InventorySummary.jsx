import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  PackageX,
} from "lucide-react";

export default function InventorySummary({
  summary,
}) {
  const cards = [
    {
      label:
        "Inventory Products",

      value:
        summary.totalProducts,

      icon: Boxes,

      description:
        "Products registered in inventory",
    },

    {
      label: "In Stock",

      value:
        summary.inStock,

      icon:
        PackageCheck,

      description:
        "Healthy stock level",
    },

    {
      label:
        "Low Stock",

      value:
        summary.lowStock,

      icon:
        AlertTriangle,

      description:
        "Require replenishment",
    },

    {
      label:
        "Out of Stock",

      value:
        summary.outOfStock,

      icon:
        PackageX,

      description:
        "Currently unavailable",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(
        (card) => {
          const Icon =
            card.icon;

          return (
            <div
              key={
                card.label
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {card.label}
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {
                  card.description
                }
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}