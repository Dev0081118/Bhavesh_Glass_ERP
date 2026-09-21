import { ChevronRight, Clock3 } from "lucide-react";

import { formatNumber } from "./formatters";

export default function OperationsPipeline({ pipeline = [], onNavigate }) {
  if (!pipeline.length) return null;

  const hasRecords = pipeline.some((stage) => stage.total > 0 || stage.active > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {pipeline.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => onNavigate?.(stage.module)}
            className={`group flex flex-col rounded-xl border p-3 text-left transition hover:-translate-y-[1px] hover:shadow-sm ${
              stage.isBottleneck
                ? "border-amber-200 bg-amber-50/60"
                : "border-slate-200 bg-slate-50/70 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {stage.label}
              </span>

              {stage.isBottleneck ? (
                <Clock3 size={13} className="shrink-0 text-amber-600" />
              ) : (
                index < pipeline.length - 1 && (
                  <ChevronRight
                    size={13}
                    className="shrink-0 text-slate-300 transition group-hover:text-slate-500"
                  />
                )
              )}
            </div>

            <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">
              {formatNumber(stage.total)}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">records</p>

            <p
              className={`mt-2 text-[11px] font-medium ${
                stage.active > 0 ? "text-amber-700" : "text-slate-400"
              }`}
            >
              {stage.active > 0 ? `${formatNumber(stage.active)} in progress` : "nothing open"}
            </p>
          </button>
        ))}
      </div>

      {!hasRecords ? (
        <p className="text-xs text-slate-400">
          No purchase, production, dispatch, sale bill or payment records exist yet. Create one from
          any ERP module and the pipeline will fill in here.
        </p>
      ) : (
        pipeline.some((stage) => stage.isBottleneck) && (
          <p className="text-xs text-amber-700">
            Backlog is concentrated in{" "}
            <span className="font-semibold">
              {pipeline.find((stage) => stage.isBottleneck)?.label}
            </span>
            . Open the module to move those records forward.
          </p>
        )
      )}
    </div>
  );
}
