import { useState } from "react";
import {
  Activity,
  History,
  Power,
  PowerOff,
  ShieldCheck,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";

import EmptyState from "./EmptyState";
import { formatNumber, formatRelativeTime, getInitials } from "./formatters";

const actionStyles = {
  STAFF_CREATED: { Icon: UserPlus, tone: "bg-emerald-50 text-emerald-600" },
  STAFF_UPDATED: { Icon: UserCog, tone: "bg-sky-50 text-sky-600" },
  STAFF_DELETED: { Icon: UserMinus, tone: "bg-red-50 text-red-600" },
  ACCESS_UPDATED: { Icon: ShieldCheck, tone: "bg-violet-50 text-violet-600" },
  SYSTEM_ENABLED: { Icon: Power, tone: "bg-emerald-50 text-emerald-600" },
  SYSTEM_DISABLED: { Icon: PowerOff, tone: "bg-red-50 text-red-600" },
};

const categoryLabels = {
  all: "All",
  staff: "Staff",
  access: "Access",
  system: "System",
  other: "Other",
};

export default function RecentActivityFeed({ activity, onNavigate }) {
  const items = activity?.items || [];
  const [category, setCategory] = useState("all");

  const tabs = [
    { id: "all", count: activity?.total || 0 },
    ...(activity?.countsByCategory || []).map((entry) => ({
      id: entry.id,
      count: entry.count,
    })),
  ];

  const visible = category === "all" ? items : items.filter((entry) => entry.category === category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
              category === tab.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            {categoryLabels[tab.id] || tab.id}
            <span
              className={`tabular-nums ${
                category === tab.id ? "text-white/70" : "text-slate-400"
              }`}
            >
              {formatNumber(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity recorded yet"
          description="Staff changes, access updates and system switches will be logged here."
          compact
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((entry) => {
            const style = actionStyles[entry.action] || {
              Icon: Activity,
              tone: "bg-slate-100 text-slate-500",
            };
            const Icon = style.Icon;

            return (
              <li key={entry.id} className="flex gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.tone}`}
                >
                  <Icon size={14} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-5 text-slate-700">
                    {entry.description || entry.action}
                  </p>

                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500">{entry.actor}</span>
                    <span className="text-slate-300">·</span>
                    <span>{formatRelativeTime(entry.createdAt)}</span>
                  </p>
                </div>

                <span
                  title={entry.actor}
                  className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 sm:flex"
                >
                  {getInitials(entry.actor)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {activity?.total > items.length && (
        <button
          type="button"
          onClick={() => onNavigate?.("access")}
          className="w-full rounded-xl border border-slate-200 py-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Showing latest {items.length} of {formatNumber(activity.total)} events
        </button>
      )}
    </div>
  );
}
