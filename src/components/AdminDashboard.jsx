import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  CreditCard,
  Factory,
  FileText,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { getAnalytics } from "../lib/api";
import { moduleDefinitions } from "../data/accessControl";

const metricCards = [
  ["products", "Products", Package],
  ["inventoryItems", "Inventory", Boxes],
  ["purchases", "Purchases", ShoppingCart],
  ["productions", "Production", Factory],
  ["saleBills", "Sale Bills", FileText],
  ["payments", "Payments", CreditCard],
  ["dispatches", "Dispatches", Truck],
];

export default function AdminDashboard({ user, token, permissions }) {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    getAnalytics(token)
      .then(setAnalytics)
      .catch((loadError) => setError(loadError.message));
  }, [token]);

  const visibleModules = moduleDefinitions.filter(
    (module) => permissions?.[module.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-400">Analytics</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Welcome, {user?.name || "Admin"}.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor the modules and activity assigned to your profile.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([key, label, Icon]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {analytics?.metrics?.[key] ?? "-"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon size={19} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <BarChart3 size={19} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Operational snapshot</h2>
              <p className="mt-1 text-xs text-slate-400">Current workload across connected ERP records</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Snapshot label="Pending work" value={analytics?.metrics?.pending ?? "-"} />
            <Snapshot label="Enabled modules" value={visibleModules.length} />
            <Snapshot label="Role" value={user?.role || "-"} />
            <Snapshot label="Status" value={user?.status || "-"} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <p className="mt-1 text-xs text-slate-400">Latest changes in the organization</p>
          <div className="mt-5 space-y-4">
            {analytics?.activity?.length ? analytics.activity.map((entry) => (
              <div key={entry.id} className="border-l-2 border-slate-200 pl-3">
                <p className="text-xs font-medium text-slate-800">{entry.description}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {entry.actor} · {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            )) : (
              <p className="text-xs text-slate-400">No activity recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Snapshot({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
