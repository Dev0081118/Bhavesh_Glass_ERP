import { useEffect, useState } from "react";
import StaffManagement from "./staff/StaffManagement";
import Hierarchy from "./hierarchy/Hierarchy";
import AccessControl from "./access-control/AccessControl";
import KillSwitch from "./kill-switch/KillSwitch";
import Inventory from "../Modules/inventory/Inventory";
import Product from "../Modules/product/Product";
import Purchase from "../Modules/purchase/Purchase";
import Production from "../Modules/production/Production";
import Dispatch from "../Modules/dispatch/Dispatch";
import SaleBill from "../Modules/sale-bill/SaleBill";
import Payment from "../Modules/payment/Payment";
import Ledger from "../Modules/ledger/Ledger";
import LR from "../Modules/lr/LR";
import ComingSoon from "../components/ComingSoon";
import {
  Users,
  ShieldCheck,
  UserCog,
  UserRound,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { dashboardStats } from "../data/dummyData";
import { normalizeAccess } from "../data/accessControl";
import { getOverview } from "../lib/api";
import AdminDashboard from "../components/AdminDashboard";

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div
      className="
        rounded-2xl border border-slate-200 bg-white p-5
        transition duration-200
        hover:-translate-y-[1px] hover:shadow-sm
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Dashboard({ user, token }) {
  const [liveStats, setLiveStats] = useState(dashboardStats);
  const [liveSystem, setLiveSystem] = useState({ modules: 12, activeUsers: 0, departments: 5, pending: 0 });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!token) return;
    getOverview(token).then((result) => {
      setLiveStats(result.stats);
      setLiveSystem(result.system);
      setActivities(result.activities || []);
    });
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <p className="text-sm font-medium text-slate-400">
          Overview
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Good evening, {user?.name || "User"}.
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's what's happening across your organization.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={liveStats.totalStaff}
          icon={Users}
          description="All registered staff members"
        />

        <StatCard
          title="Administrators"
          value={liveStats.totalAdmins}
          icon={ShieldCheck}
          description="Users with admin access"
        />

        <StatCard
          title="Managers"
          value={liveStats.totalManagers}
          icon={UserCog}
          description="Active management staff"
        />

        <StatCard
          title="Employees"
          value={liveStats.totalEmployees}
          icon={UserRound}
          description="Active employees"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* System Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                System Overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current software status
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                System Operational
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Modules", liveSystem.modules],
              ["Active Users", liveSystem.activeUsers],
              ["Departments", liveSystem.departments],
              ["Pending", liveSystem.pending],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="text-[11px] text-slate-400">
                  {label}
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Activity size={17} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900">
                  System activity
                </p>

                <p className="text-[11px] text-slate-400">
                  All systems are functioning normally
                </p>
              </div>
            </div>

            <ArrowUpRight
              size={16}
              className="text-slate-400"
            />
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest system changes
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3"
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-300" />

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800">
                    {activity.description}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {activity.user}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-300">
                    {activity.time ? new Date(activity.time).toLocaleString() : "Just now"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organization preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Organization
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your organization's structure
            </p>
          </div>

          <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
            View hierarchy →
          </button>
        </div>

        <div className="mt-6 flex justify-center overflow-x-auto py-5">
          <div className="flex min-w-[600px] flex-col items-center">
            {/* Super Admin */}
            <div className="rounded-xl border border-slate-300 bg-slate-900 px-6 py-3 text-center text-white shadow-sm">
              <p className="text-xs font-semibold">
                Super Admin
              </p>
              <p className="mt-0.5 text-[10px] text-slate-300">
                System Owner
              </p>
            </div>

            <div className="h-8 w-px bg-slate-300" />

            {/* Admins */}
            <div className="relative flex gap-16">
              <div className="absolute left-1/2 top-0 h-px w-[calc(100%-80px)] -translate-x-1/2 bg-slate-300" />

              {["Arjun Mehta", "Rahul Shah"].map((name) => (
                <div key={name} className="pt-8">
                  <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-800">
                      {name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Admin
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900">Access restricted</h2>
        <p className="mt-1 text-sm text-slate-400">
          Ask a Super Admin to enable this module for your profile.
        </p>
      </div>
    </div>
  );
}

export default function SuperAdminPanel({ onLogout, user, token }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isSuperAdmin = user?.role === "Super Admin";
  const access = normalizeAccess(user);
  const canAccessModule = (module) => isSuperAdmin || Boolean(access.modules[module]);

 const renderContent = () => {
  if (!isSuperAdmin && activeSection === "dashboard") {
    return <AdminDashboard user={user} token={token} permissions={access.modules} />;
  }

  switch (activeSection) {
    // =========================
    // SUPER ADMIN
    // =========================

    case "dashboard":
      return <Dashboard user={user} token={token} />;

    case "staff":
      return isSuperAdmin ? <StaffManagement token={token} /> : <AccessDenied />;

    case "hierarchy":
      return isSuperAdmin ? <Hierarchy token={token} /> : <AccessDenied />;

    case "access":
      return isSuperAdmin ? <AccessControl token={token} /> : <AccessDenied />;

    case "modules":
      return isSuperAdmin ? <ComingSoon /> : <AccessDenied />;

    case "kill-switch":
      return isSuperAdmin ? <KillSwitch /> : <AccessDenied />;

    case "system-settings":
      return isSuperAdmin ? <ComingSoon /> : <AccessDenied />;

    // =========================
    // ERP MODULES
    // =========================

    case "inventory":
      return canAccessModule("inventory") ? <Inventory token={token} /> : <AccessDenied />;

    case "product":
      return canAccessModule("product") ? <Product token={token} /> : <AccessDenied />;

    case "purchase":
      return canAccessModule("purchase") ? <Purchase token={token} /> : <AccessDenied />;

    case "production":
      return canAccessModule("production") ? <Production token={token} /> : <AccessDenied />;

    case "dispatch":
      return canAccessModule("dispatch") ? <Dispatch token={token} /> : <AccessDenied />;

    case "sale-bill":
      return canAccessModule("sale_bill") ? <SaleBill token={token} /> : <AccessDenied />;

    case "payment":
      return canAccessModule("payment") ? <Payment token={token} /> : <AccessDenied />;

    case "ledger":
      return canAccessModule("ledger") ? <Ledger token={token} /> : <AccessDenied />;

    case "lr":
      return canAccessModule("lr") ? <LR token={token} /> : <AccessDenied />;

    case "whatsapp-ai":
      return canAccessModule("whatsapp_ai") ? <ComingSoon /> : <AccessDenied />;

    case "reports":
      return canAccessModule("reports") ? <ComingSoon /> : <AccessDenied />;

    default:
      return <Dashboard />;
  }
};

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        permissions={access.modules}
        isSuperAdmin={isSuperAdmin}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onLogout={onLogout}
          user={user}
          profileAccess={access.profile}
          onMenuOpen={() => setMobileSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}