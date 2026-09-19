import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  ShieldCheck,
  Boxes,
  Power,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "staff",
    label: "Staff",
    icon: Users,
  },
  {
    id: "hierarchy",
    label: "Hierarchy",
    icon: GitBranch,
  },
  {
    id: "access",
    label: "Access",
    icon: ShieldCheck,
  },
  {
    id: "modules",
    label: "Modules",
    icon: Boxes,
  },
  {
    id: "kill-switch",
    label: "Kill Switch",
    icon: Power,
  },
];

export default function Sidebar({ activeSection, setActiveSection }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex h-screen flex-col border-r border-slate-200
        bg-white transition-all duration-300
        ${collapsed ? "w-[76px]" : "w-[250px]"}
      `}
    >
      {/* Logo */}
      <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Building2 size={20} strokeWidth={2} />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                SAVVY ERP
              </p>
              <p className="text-[11px] text-slate-400">
                Administration
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p
          className={`
            mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em]
            text-slate-400
            ${collapsed ? "hidden" : "block"}
          `}
        >
          Management
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={collapsed ? item.label : undefined}
                className={`
                  group flex w-full items-center rounded-xl px-3 py-2.5
                  text-left transition-all duration-200
                  ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }
                  ${collapsed ? "justify-center" : "gap-3"}
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span className="text-[13px] font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <>
            <div className="my-6 border-t border-slate-100" />

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              System
            </p>

            <button
              className="
                flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                text-slate-500 transition hover:bg-slate-100
                hover:text-slate-900
              "
            >
              <Settings size={18} strokeWidth={1.8} />
              <span className="text-[13px] font-medium">Settings</span>
            </button>
          </>
        )}
      </div>

      {/* Collapse */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="
            flex w-full items-center justify-center rounded-xl
            py-2.5 text-slate-400 transition
            hover:bg-slate-100 hover:text-slate-900
          "
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span className="ml-2 text-xs font-medium">
                Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}