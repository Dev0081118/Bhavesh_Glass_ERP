import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import ProductionStatus from "./ProductionStatus";

export default function ProductionRow({
  production,
  onView,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const planned = Number(production.plannedQuantity || 0);
  const completed = Number(production.completedQuantity || 0);

  const progress =
    planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {production.id}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {production.sku}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {production.productName}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {production.location}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm font-medium text-slate-800">
          {planned.toLocaleString()}
        </span>

        <span className="ml-1 text-xs text-slate-400">
          {production.unit}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm font-medium text-slate-800">
          {completed.toLocaleString()}
        </span>

        <span className="ml-1 text-xs text-slate-400">
          {production.unit}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="w-[130px]">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              {progress}%
            </span>

            <span className="text-[10px] text-slate-400">
              {completed}/{planned}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-800 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-slate-600">
          {production.startDate || "—"}
        </span>
      </td>

      <td className="px-5 py-4">
        <ProductionStatus status={production.status} />
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />

            <div className="absolute right-5 top-12 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onView(production);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Eye size={15} />
                View
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(production);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(production);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}