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
  BarChart3,
  BookOpen,
  CreditCard,
  Factory,
  FileText,
  MessageCircle,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
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
  {
    id: "system-settings",
    label: "System Settings",
    icon: Settings,
  },
];

const erpModules = [
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
  },
  {
    id: "product",
    label: "Product",
    icon: Package,
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: ShoppingCart,
  },
  {
    id: "production",
    label: "Production",
    icon: Factory,
  },
  {
    id: "dispatch",
    label: "Dispatch",
    icon: Truck,
  },
  {
    id: "sale-bill",
    label: "Sale Bill",
    icon: Receipt,
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
  },
  {
    id: "ledger",
    label: "Ledger",
    icon: BookOpen,
  },
  {
    id: "lr",
    label: "LR",
    icon: FileText,
  },
  {
    id: "whatsapp-ai",
    label: "WhatsApp AI",
    icon: MessageCircle,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function Sidebar({
  activeSection,
  setActiveSection,
  permissions = {},
  isSuperAdmin = false,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const canAccessModule = (moduleId) =>
    isSuperAdmin || Boolean(permissions[moduleId.replace("-", "_")]);

  const visibleNavigation = isSuperAdmin ? navigation : [];
  const visibleErpModules = erpModules.filter((module) =>
    canAccessModule(module.id)
  );

  const renderNavItem = (item) => {
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
  };

  return (
    <aside
      className={`
        relative flex h-screen flex-col border-r border-slate-200
        bg-white transition-all duration-300
        ${collapsed ? "w-[76px]" : "w-[250px]"}
      `}
    >
      {/* ================================
          LOGO
      ================================= */}

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

      {/* ================================
          NAVIGATION
      ================================= */}

      <div className="flex-1 overflow-y-auto px-3 py-5">

        {/* Management */}

        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Management
          </p>
        )}

        <nav className="space-y-1">
          {visibleNavigation.map(renderNavItem)}
        </nav>

        {/* ================================
            ERP SECTION
        ================================= */}

        <div className="my-6 border-t border-slate-100" />

        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            ERP
          </p>
        )}

        <nav className="space-y-1">
          {visibleErpModules.map(renderNavItem)}
        </nav>

      </div>

      {/* ================================
          COLLAPSE
      ================================= */}

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