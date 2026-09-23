import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import ProductionStatus from "./ProductionStatus";

const date = (
  value
) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
};

export default function ProductionRow({
  production,

  onView,

  onEdit,

  onDelete,
}) {
  const planned =
    Number(
      production.plannedQuantity ||
        0
    );

  const completed =
    Number(
      production.completedQuantity ||
        0
    );

  const progress =
    planned > 0
      ? Math.min(
          100,
          Math.round(
            (
              completed /
              planned
            ) *
              100
          )
        )
      : 0;

  return (
    <tr className="hover:bg-slate-50/70">
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-slate-900">
          {production.productionNumber ||
            production.id}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-medium text-slate-800">
          {production.productName ||
            "Unknown product"}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {production.product?.sku ||
            ""}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-700">
        {planned.toLocaleString()}{" "}
        {production.product?.unit ||
          ""}
      </td>

      <td className="px-4 py-4 text-sm font-medium text-slate-800">
        {completed.toLocaleString()}{" "}
        {production.product?.unit ||
          ""}
      </td>

      <td className="px-4 py-4">
        <div className="w-32">
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="font-medium text-slate-700">
              {progress}%
            </span>

            <span className="text-slate-400">
              {completed}/
              {planned}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-800"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-700">
          {production.managerName ||
            "Not assigned"}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {date(
          production.expectedDate
        )}
      </td>

      <td className="px-4 py-4">
        <ProductionStatus
          status={
            production.status
          }
        />
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <button
            onClick={() =>
              onView(
                production
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            <Eye
              size={15}
            />
          </button>

          <button
            onClick={() =>
              onEdit(
                production
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil
              size={15}
            />
          </button>

          <button
            onClick={() =>
              onDelete(
                production
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2
              size={15}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}