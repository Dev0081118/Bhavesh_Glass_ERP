import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import EmptyState from "./EmptyState";
import { formatCompactCurrency, formatNumber } from "./formatters";

const severityStyles = {
  critical: {
    chip: "border-red-200 bg-red-50 text-red-700",
    Icon: TriangleAlert,
  },
  warning: {
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: AlertTriangle,
  },
  info: {
    chip: "border-slate-200 bg-slate-100 text-slate-600",
    Icon: Info,
  },
};

export default function AttentionRequired({ alerts, onNavigate }) {
  const items = alerts?.items || [];
  const [expandedId, setExpandedId] = useState(items[0]?.id || null);

  if (!items.length) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Nothing needs your attention"
        description="No overdue bills, low stock, stuck dispatches or unanswered approvals right now."
      />
    );
  }

  const counts = alerts?.counts || {};

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {counts.critical > 0 && (
          <span className="font-medium text-red-700">{formatNumber(counts.critical)} critical</span>
        )}
        {counts.warning > 0 && (
          <span className="font-medium text-amber-700">{formatNumber(counts.warning)} warning</span>
        )}
        {counts.info > 0 && <span>{formatNumber(counts.info)} informational</span>}
      </div>

      <ul className="space-y-2">
        {items.map((alert) => {
          const style = severityStyles[alert.severity] || severityStyles.info;
          const Icon = style.Icon;
          const isOpen = expandedId === alert.id;

          return (
            <li key={alert.id} className="overflow-hidden rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : alert.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${style.chip}`}
                >
                  <Icon size={14} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-slate-800">
                    {alert.title}
                  </span>

                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    {formatNumber(alert.count)} to review
                    {alert.amount ? ` · ${formatCompactCurrency(alert.amount)}` : ""}
                  </span>
                </span>

                <ChevronDown
                  size={15}
                  className={`shrink-0 text-slate-400 transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3">
                  <p className="text-[11px] leading-5 text-slate-500">{alert.description}</p>

                  {alert.items?.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {alert.items.map((entry) => (
                        <li
                          key={`${alert.id}-${entry.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[11px] font-medium text-slate-700">
                              {entry.label}
                            </span>

                            {entry.detail && (
                              <span className="block truncate text-[11px] text-slate-400">
                                {entry.detail}
                              </span>
                            )}
                          </span>

                          {entry.value ? (
                            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-800">
                              {formatCompactCurrency(entry.value)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigate?.(alert.module)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-slate-800"
                  >
                    {alert.cta || "Open module"}
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
