import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  Power,
  Receipt,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export default function QuickActions({ isSuperAdmin, canAccessModule, onNavigate }) {
  const actions = [
    ...(isSuperAdmin
      ? [
          {
            id: "staff",
            label: "Create staff",
            description: "Add an Admin, Manager or Employee",
            Icon: UserPlus,
          },
          {
            id: "access",
            label: "Manage access",
            description: "Change module permissions",
            Icon: ShieldCheck,
          },
          {
            id: "kill-switch",
            label: "Kill switch",
            description: "Enable or disable the ERP",
            Icon: Power,
          },
        ]
      : []),
    ...(canAccessModule("sale_bill")
      ? [
          {
            id: "sale-bill",
            label: "Sale bills",
            description: "Raise and track customer bills",
            Icon: Receipt,
          },
        ]
      : []),
    ...(canAccessModule("inventory")
      ? [
          {
            id: "inventory",
            label: "Inventory",
            description: "Stock levels and locations",
            Icon: Boxes,
          },
        ]
      : []),
    ...(canAccessModule("reports")
      ? [
          {
            id: "reports",
            label: "Reports",
            description: "Business reporting",
            Icon: BarChart3,
          },
        ]
      : []),
  ];

  if (!actions.length) {
    return <p className="text-xs text-slate-400">No shortcuts are available for your profile.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
      {actions.map((action) => {
        const Icon = action.Icon;

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onNavigate?.(action.id)}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
              <Icon size={15} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-slate-800">
                {action.label}
              </span>

              <span className="block truncate text-[11px] text-slate-400">
                {action.description}
              </span>
            </span>

            <ArrowUpRight size={14} className="shrink-0 text-slate-300 group-hover:text-slate-600" />
          </button>
        );
      })}
    </div>
  );
}
