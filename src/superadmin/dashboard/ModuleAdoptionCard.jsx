import { Boxes } from "lucide-react";

import EmptyState from "./EmptyState";
import { moduleDefinitions } from "../../data/accessControl";
import { formatNumber, formatPercent } from "./formatters";

const labelFor = (id) =>
  moduleDefinitions.find((module) => module.id === id)?.label ||
  String(id)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ModuleAdoptionCard({ moduleAdoption = [], onNavigate }) {
  if (!moduleAdoption.length) {
    return (
      <EmptyState
        icon={Boxes}
        title="No module access recorded"
        description="Module enablement appears here once staff accounts and their access maps exist."
      />
    );
  }

  const rows = moduleAdoption.map((row) => ({
    ...row,
    label: labelFor(row.id),
    percent: row.totalUsers ? (row.enabledFor / row.totalUsers) * 100 : 0,
  }));

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <span>Module</span>
        <span>Enabled for</span>
      </div>

      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.(row.id === "sale_bill" ? "sale-bill" : row.id.replace("_", "-"))}
              className="w-24 shrink-0 truncate text-left text-[11px] font-medium text-slate-700 transition hover:text-slate-900"
            >
              {row.label}
            </button>

            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className={`block h-full rounded-full ${
                  row.percent === 0
                    ? "bg-slate-200"
                    : row.percent === 100
                      ? "bg-emerald-500"
                      : "bg-slate-900"
                }`}
                style={{ width: `${Math.max(row.percent, row.enabledFor > 0 ? 4 : 0)}%` }}
              />
            </span>

            <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
              {formatNumber(row.enabledFor)}/{formatNumber(row.totalUsers)}
            </span>

            <span className="w-9 shrink-0 text-right text-[10px] font-medium tabular-nums text-slate-400">
              {formatPercent(row.percent)}
            </span>
          </li>
        ))}
      </ul>

      <p className="pt-1 text-[11px] leading-5 text-slate-400">
        Shows how many staff accounts have each module switched on. Use Access Control to expand or
        restrict access.
      </p>
    </div>
  );
}
