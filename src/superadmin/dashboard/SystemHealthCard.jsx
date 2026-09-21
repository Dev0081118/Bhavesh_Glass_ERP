import { CheckCircle2, CircleDashed, TriangleAlert } from "lucide-react";

import { formatRelativeTime } from "./formatters";

const serviceCopy = {
  not_configured: { label: "Not configured", tone: "text-slate-400", Icon: CircleDashed },
  ready: { label: "Ready", tone: "text-emerald-600", Icon: CheckCircle2 },
  degraded: { label: "Degraded", tone: "text-amber-600", Icon: TriangleAlert },
};

export default function SystemHealthCard({ system, onNavigate }) {
  const isActive = Boolean(system?.isSystemActive);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onNavigate?.("kill-switch")}
        className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition hover:shadow-sm ${
          isActive ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <TriangleAlert size={16} className="text-red-600" />
            )}

            <p
              className={`text-sm font-semibold ${
                isActive ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {isActive ? "System operational" : "System disabled"}
            </p>
          </div>

          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
            {system?.reason || "No status note recorded."}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {system?.lastChangedAt
              ? `Changed ${formatRelativeTime(system.lastChangedAt)}${
                  system?.changedBy ? ` by ${system.changedBy}` : ""
                }`
              : "Never changed since installation"}
          </p>
        </div>

        <span className="shrink-0 rounded-lg bg-white/70 px-2 py-1 text-[11px] font-medium text-slate-500">
          Manage
        </span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] text-slate-400">Modules in use</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {system?.modulesInUse ?? 0}
            <span className="ml-1 text-xs font-normal text-slate-400">
              / {system?.totalModules ?? 0}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-[11px] text-slate-400">Enabled for everyone</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {system?.modulesOrgWide ?? 0}
            <span className="ml-1 text-xs font-normal text-slate-400">
              / {system?.totalModules ?? 0}
            </span>
          </p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Services
        </p>

        <ul className="mt-2 space-y-2">
          {(system?.services || []).map((service) => {
            const copy = serviceCopy[service.status] || serviceCopy.not_configured;
            const Icon = copy.Icon;

            return (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-xs font-medium text-slate-700">{service.label}</span>

                <span className={`inline-flex items-center gap-1.5 text-[11px] ${copy.tone}`}>
                  <Icon size={12} />
                  {copy.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
