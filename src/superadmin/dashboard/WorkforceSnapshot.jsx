import { UserRound } from "lucide-react";

import { formatNumber, formatRelativeTime, getInitials } from "./formatters";

const barTones = {
  slate: "bg-slate-900",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
};

function DistributionList({ title, rows, tone = "slate" }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  if (!rows.length) {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-2 text-xs text-slate-400">No data yet.</p>
      </div>
    );
  }

  const peak = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>

      <ul className="mt-2.5 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-[11px] text-slate-500">{row.label}</span>

            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className={`block h-full rounded-full ${barTones[tone]}`}
                style={{ width: `${Math.max((row.count / peak) * 100, 4)}%` }}
              />
            </span>

            <span className="w-10 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-700">
              {formatNumber(row.count)}
            </span>

            <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-slate-400">
              {total ? `${Math.round((row.count / total) * 100)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkforceSnapshot({ workforce, rangeLabel, onNavigate }) {
  const tiles = [
    { label: "Total staff", value: workforce?.total, tone: "text-slate-900" },
    { label: "Active", value: workforce?.active, tone: "text-emerald-600" },
    { label: "Inactive", value: workforce?.inactive, tone: "text-red-600" },
    {
      label: "Signed in",
      value: workforce?.loggedInInRange,
      hint: rangeLabel,
      tone: "text-slate-900",
    },
    { label: "Never signed in", value: workforce?.neverLoggedIn, tone: "text-amber-600" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] leading-4 text-slate-400">{tile.label}</p>

            <p className={`mt-0.5 text-lg font-semibold tabular-nums ${tile.tone}`}>
              {formatNumber(tile.value)}
            </p>
          </div>
        ))}
      </div>

      <DistributionList title="By role" rows={workforce?.byRole || []} />

      <DistributionList title="By department" rows={workforce?.byDepartment || []} tone="emerald" />

      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recent joins
          </p>

          <button
            type="button"
            onClick={() => onNavigate?.("staff")}
            className="text-[11px] font-medium text-slate-500 transition hover:text-slate-900"
          >
            Manage staff
          </button>
        </div>

        {workforce?.recentJoins?.length ? (
          <ul className="mt-2.5 space-y-2">
            {workforce.recentJoins.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                  {getInitials(member.name)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-slate-800">
                    {member.name}
                  </span>

                  <span className="block truncate text-[11px] text-slate-400">
                    {[member.role, member.department].filter(Boolean).join(" · ")}
                  </span>
                </span>

                <span className="shrink-0 text-[11px] text-slate-400">
                  {formatRelativeTime(member.joinedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
            <UserRound size={14} /> No staff accounts created yet.
          </p>
        )}
      </div>
    </div>
  );
}
