import { useState } from "react";
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

function Dashboard() {
  const activities = [
    {
      id: 1,
      title: "New employee added",
      user: "Jay Patel",
      time: "12 minutes ago",
    },
    {
      id: 2,
      title: "Access permissions updated",
      user: "Arjun Mehta",
      time: "34 minutes ago",
    },
    {
      id: 3,
      title: "Manager profile updated",
      user: "Karan Patel",
      time: "1 hour ago",
    },
    {
      id: 4,
      title: "Inventory module assigned",
      user: "Ravi Joshi",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <p className="text-sm font-medium text-slate-400">
          Overview
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Good evening, Super Admin.
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's what's happening across your organization.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={dashboardStats.totalStaff}
          icon={Users}
          description="All registered staff members"
        />

        <StatCard
          title="Administrators"
          value={dashboardStats.totalAdmins}
          icon={ShieldCheck}
          description="Users with admin access"
        />

        <StatCard
          title="Managers"
          value={dashboardStats.totalManagers}
          icon={UserCog}
          description="Active management staff"
        />

        <StatCard
          title="Employees"
          value={dashboardStats.totalEmployees}
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
              ["Modules", "12"],
              ["Active Users", "39"],
              ["Departments", "5"],
              ["Pending", "3"],
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
                    {activity.title}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {activity.user}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-300">
                    {activity.time}
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

function Placeholder({ section }) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Boxes size={24} className="text-slate-500" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          {section}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          This module will be built next.
        </p>
      </div>
    </div>
  );
}

export default function SuperAdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");

 const renderContent = () => {
  switch (activeSection) {
    // =========================
    // SUPER ADMIN
    // =========================

    case "dashboard":
      return <Dashboard />;

    case "staff":
      return <StaffManagement />;

    case "hierarchy":
      return <Hierarchy />;

    case "access":
      return <AccessControl />;

    case "modules":
      return <Placeholder section="Module Management" />;

    case "kill-switch":
      return <KillSwitch />;

    case "system-settings":
      return <Placeholder section="System Settings" />;

    // =========================
    // ERP MODULES
    // =========================

    case "inventory":
      return <Inventory />;

    case "product":
      return <Product />;

    case "purchase":
      return <Purchase />;

    case "production":
       return <Production />;

    case "dispatch":
       return <Dispatch />;

    case "sale-bill":
       return <SaleBill />;

    case "payment":
      return <Placeholder section="Payment Management" />;

    case "ledger":
      return <Placeholder section="Ledger Management" />;

    case "lr":
      return <Placeholder section="LR Management" />;

    case "whatsapp-ai":
      return <Placeholder section="WhatsApp AI" />;

    case "reports":
      return <Placeholder section="Reports" />;

    default:
      return <Dashboard />;
  }
};

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}