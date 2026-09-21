import { useEffect, useState } from "react";
import { CheckCircle2, Power, RefreshCw, TriangleAlert } from "lucide-react";

import { formatLongDate, formatRelativeTime, getGreeting } from "./formatters";

const RANGE_OPTIONS = [
  { key: "7d", label: "7D", title: "Last 7 days" },
  { key: "30d", label: "30D", title: "Last 30 days" },
  { key: "90d", label: "90D", title: "Last 90 days" },
];

export default function DashboardHeader({
  user,
  system,
  range,
  onRangeChange,
  onRefresh,
  isLoading,
  lastUpdatedAt,
  onNavigate,
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const isActive = system ? Boolean(system.isSystemActive) : true;
  const firstName = String(user?.name || "there").split(" ")[0];

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-400">Overview</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {getGreeting()}, {firstName}.
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>{formatLongDate()}</span>
          <span className="text-slate-300">·</span>
          <span>
            {lastUpdatedAt ? `Updated ${formatRelativeTime(lastUpdatedAt)}` : "Loading live data…"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate?.("kill-switch")}
          title="Open kill switch"
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
            isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          {isActive ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}
          {isActive ? "System operational" : "System disabled"}
          <Power size={12} className="opacity-50" />
        </button>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              title={option.title}
              onClick={() => onRangeChange(option.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                range === option.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}
