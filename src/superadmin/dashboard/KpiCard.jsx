import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import Sparkline from "./Sparkline";
import { formatDelta } from "./formatters";

const accentStyles = {
  neutral: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
};

const deltaStyles = {
  up: "bg-emerald-50 text-emerald-700",
  down: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-500",
};

export default function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "neutral",
  delta,
  deltaLabel = "vs previous period",
  hint,
  series,
  seriesTone = "neutral",
  onClick,
  children,
}) {
  const { label: deltaText, tone } = formatDelta(delta);
  const DeltaIcon = tone === "up" ? ArrowUpRight : tone === "down" ? ArrowDownRight : Minus;

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={`flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left transition ${
        onClick ? "hover:-translate-y-[1px] hover:shadow-sm" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium text-slate-400">{label}</p>

        {Icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              accentStyles[accent] || accentStyles.neutral
            }`}
          >
            <Icon size={17} strokeWidth={1.9} />
          </span>
        )}
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>

      {(delta !== undefined || hint) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {delta !== undefined && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                deltaStyles[tone]
              }`}
            >
              <DeltaIcon size={12} strokeWidth={2.4} />
              {deltaText}
            </span>
          )}

          {delta !== undefined && deltaLabel && (
            <span className="text-[11px] text-slate-400">{deltaLabel}</span>
          )}

          {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}

      {Array.isArray(series) && series.length > 1 && (
        <div className="mt-3">
          <Sparkline values={series} tone={seriesTone} />
        </div>
      )}
    </Wrapper>
  );
}
