import {
  Package,
  CheckCircle2,
  XCircle,
  Layers3,
} from "lucide-react";

export default function ProductSummary({ products }) {
  const total = products.length;

  const active = products.filter(
    (product) => product.status === "Active"
  ).length;

  const inactive = products.filter(
    (product) => product.status === "Inactive"
  ).length;

  const categories = new Set(
    products.map((product) => product.category)
  ).size;

  const cards = [
    {
      label: "Total Products",
      value: total,
      icon: Package,
    },
    {
      label: "Active Products",
      value: active,
      icon: CheckCircle2,
    },
    {
      label: "Inactive Products",
      value: inactive,
      icon: XCircle,
    },
    {
      label: "Categories",
      value: categories,
      icon: Layers3,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="
              rounded-2xl border border-slate-200 bg-white
              p-5 shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {card.label}
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon size={17} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}