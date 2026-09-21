import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeIndianRupee,
  ClipboardList,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

import { getDashboardSummary } from "../../lib/api";
import DashboardHeader from "./DashboardHeader";
import DashboardSkeleton from "./DashboardSkeleton";
import KpiGrid from "./KpiGrid";
import SectionCard from "./SectionCard";
import TrendChart from "./TrendChart";
import OperationsPipeline from "./OperationsPipeline";
import AttentionRequired from "./AttentionRequired";
import SystemHealthCard from "./SystemHealthCard";
import WorkforceSnapshot from "./WorkforceSnapshot";
import ModuleAdoptionCard from "./ModuleAdoptionCard";
import RecentActivityFeed from "./RecentActivityFeed";
import QuickActions from "./QuickActions";
import { formatCompactCurrency, formatCurrency, formatNumber } from "./formatters";

const REFRESH_INTERVAL_MS = 60000;

const operationLabels = {
  saleBills: "Sale bills",
  purchases: "Purchases",
  payments: "Payments",
  dispatches: "Dispatches",
  lrs: "Lorry receipts",
  productions: "Production runs",
  products: "Products",
  inventoryItems: "Inventory rows",
  parties: "Parties",
};

export default function SuperAdminDashboard({ user, token, permissions = {}, onNavigate }) {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const isSuperAdmin = user?.role === "Super Admin";

  const canAccessModule = useCallback(
    (moduleId) => isSuperAdmin || Boolean(permissions[moduleId]),
    [isSuperAdmin, permissions]
  );

  const load = useCallback(
    async (nextRange = range, { silent = false } = {}) => {
      if (!token) return;

      if (!silent) setIsLoading(true);

      try {
        const result = await getDashboardSummary(token, nextRange);
        setData(result);
        setLastUpdatedAt(new Date());
        setError("");
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [token, range]
  );

  // Initial load + reload whenever the token or range changes.
  // State updates only happen inside promise callbacks so this stays a
  // subscription rather than a synchronous cascade.
  useEffect(() => {
    if (!token) return undefined;

    let isCurrent = true;

    getDashboardSummary(token, range)
      .then((result) => {
        if (!isCurrent) return;
        setData(result);
        setLastUpdatedAt(new Date());
        setError("");
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token, range]);

  useEffect(() => {
    if (!token) return undefined;

    const timer = setInterval(() => load(range, { silent: true }), REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [load, range, token]);

  const handleRangeChange = useCallback((nextRange) => {
    setIsLoading(true);
    setRange(nextRange);
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];

    const { kpis } = data;

    return [
      {
        id: "revenue",
        label: `Revenue · ${data.range.label}`,
        value: formatCompactCurrency(kpis.revenue.current),
        icon: BadgeIndianRupee,
        accent: "emerald",
        delta: kpis.revenue.changePct,
        deltaLabel: "vs previous period",
        hint: `${formatNumber(kpis.revenue.billCount)} bill(s) · all time ${formatCurrency(
          kpis.revenue.allTime
        )}`,
        series: kpis.revenue.series,
        seriesTone: "emerald",
        onClick: canAccessModule("sale_bill") ? () => onNavigate?.("sale-bill") : undefined,
      },
      {
        id: "receivables",
        label: "Outstanding receivables",
        value: formatCompactCurrency(kpis.receivables.outstanding),
        icon: Wallet,
        accent: kpis.receivables.overdueCount > 0 ? "red" : "neutral",
        hint:
          kpis.receivables.overdueCount > 0
            ? `${formatNumber(
                kpis.receivables.overdueCount
              )} bill(s) overdue · ${formatCompactCurrency(kpis.receivables.overdueAmount)}`
            : `${formatNumber(kpis.receivables.openBills)} open bill(s)`,
        children: (
          <div className="space-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <p>
              Billed in range{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrency(kpis.receivables.billedInRange)}
              </span>
            </p>
            <p>
              Collected in range{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrency(kpis.receivables.collectedInRange)}
              </span>
            </p>
          </div>
        ),
        onClick: canAccessModule("sale_bill") ? () => onNavigate?.("sale-bill") : undefined,
      },
      {
        id: "pending-work",
        label: "Pending work",
        value: formatNumber(kpis.pendingWork.total),
        icon: ClipboardList,
        accent: kpis.pendingWork.total > 0 ? "amber" : "neutral",
        delta: kpis.pendingWork.changePct,
        deltaLabel: `${formatNumber(kpis.pendingWork.inflow)} new in range`,
        hint: "Open items in purchase, payment, dispatch and production",
        children: (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px]">
            {[
              ["Purchases", kpis.pendingWork.breakdown.purchases],
              ["Payments", kpis.pendingWork.breakdown.payments],
              ["Dispatches", kpis.pendingWork.breakdown.dispatches],
              ["Production", kpis.pendingWork.breakdown.productions],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">{label}</dt>
                <dd className="font-semibold tabular-nums text-slate-700">{formatNumber(value)}</dd>
              </div>
            ))}
          </dl>
        ),
      },
      {
        id: "workforce",
        label: "Workforce",
        value: formatNumber(kpis.workforce.total),
        icon: Users,
        accent: "sky",
        hint: `${formatNumber(kpis.workforce.active)} active · ${formatNumber(
          kpis.workforce.inactive
        )} inactive`,
        children: (
          <div className="space-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <p>
              Signed in this period{" "}
              <span className="font-semibold text-slate-700">
                {formatNumber(kpis.workforce.loggedInInRange)}
              </span>
            </p>
            <p>
              Never signed in{" "}
              <span className="font-semibold text-slate-700">
                {formatNumber(kpis.workforce.neverLoggedIn)}
              </span>
            </p>
          </div>
        ),
        onClick: isSuperAdmin ? () => onNavigate?.("staff") : undefined,
      },
    ];
  }, [data, canAccessModule, isSuperAdmin, onNavigate]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        system={data?.system}
        range={range}
        onRangeChange={handleRangeChange}
        onRefresh={() => load(range)}
        isLoading={isLoading}
        lastUpdatedAt={lastUpdatedAt}
        onNavigate={onNavigate}
      />

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </p>

          <button
            type="button"
            onClick={() => load(range)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-100"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {!data && isLoading && <DashboardSkeleton />}

      {!data && !isLoading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">Dashboard unavailable</p>
          <p className="mt-1 text-xs text-slate-400">
            Sign in again to load live data from the ERP.
          </p>
        </div>
      )}

      {data && (
        <>
          <KpiGrid cards={cards} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SectionCard
              className="xl:col-span-2"
              title="Sales, purchase and collection trend"
              subtitle={`${data.range.label} · grouped by ${
                data.trend.granularity === "week" ? "week" : "day"
              }`}
            >
              <TrendChart trend={data.trend} />
            </SectionCard>

            <SectionCard
              title="Attention required"
              subtitle="Anything that needs a decision from you"
              bodyClassName="max-h-[560px] overflow-y-auto"
            >
              <AttentionRequired alerts={data.alerts} onNavigate={onNavigate} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SectionCard
              className="xl:col-span-2"
              title="Operations pipeline"
              subtitle="Total records and open work at every stage"
            >
              <OperationsPipeline pipeline={data.pipeline} onNavigate={onNavigate} />
            </SectionCard>

            <SectionCard title="System health" subtitle="Kill switch, modules and services">
              <SystemHealthCard system={data.system} onNavigate={onNavigate} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SectionCard
              title="Workforce and access"
              subtitle="Who is on the platform and where they sit"
            >
              <WorkforceSnapshot
                workforce={data.workforce}
                rangeLabel={data.range.label}
                onNavigate={onNavigate}
              />
            </SectionCard>

            <SectionCard
              title="Module adoption"
              subtitle="How many staff can open each module"
            >
              <ModuleAdoptionCard moduleAdoption={data.moduleAdoption} onNavigate={onNavigate} />
            </SectionCard>

            <SectionCard
              title="Recent activity"
              subtitle="Latest governance and system events"
            >
              <RecentActivityFeed activity={data.activity} onNavigate={onNavigate} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SectionCard title="Quick actions" subtitle="Jump straight into the work">
              <QuickActions
                isSuperAdmin={isSuperAdmin}
                canAccessModule={canAccessModule}
                onNavigate={onNavigate}
              />
            </SectionCard>

            <SectionCard
              className="xl:col-span-2"
              title="Records in the system"
              subtitle="Lifetime totals behind every module"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {Object.entries(operationLabels).map(([key, label]) => (
                  <div key={key} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] text-slate-400">{label}</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
                      {formatNumber(data.operations[key])}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] leading-5 text-slate-400">
                Totals include drafts and cancelled records. Financial figures use only confirmed
                sale bills and completed payments.
              </p>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
