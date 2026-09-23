import { useState } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Purely presentational navigation.
 *
 * Receives already-filtered `groups` from the shell, so section ids, labels,
 * icons, ordering and access rules all come from the routes registry in
 * src/superadmin/routes.js.
 */
export default function Sidebar({
  activeSection,
  setActiveSection,
  groups = [],
  mobileOpen = false,
  onMobileClose = () => {},
}) {
  const [collapsed, setCollapsed] = useState(false);

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = activeSection === item.id;

    return (
      <button
        key={item.id}
        type="button"
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
        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />

        {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200
          bg-white transition-transform duration-300 md:relative md:z-auto md:translate-x-0 md:transition-[width]
          ${collapsed ? "md:w-[76px]" : "w-[250px] md:w-[250px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 size={20} strokeWidth={2} />
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                  BHAVESH GLASS ERP
                </p>

                <p className="text-[11px] text-slate-400">Administration</p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group, index) => (
            <div key={group.id} className={index > 0 ? "mt-6" : ""}>
              {index > 0 && <div className="mb-6 border-t border-slate-100" />}

              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {group.label}
                </p>
              )}

              <nav className="space-y-1">{group.items.map(renderNavItem)}</nav>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="px-3 text-xs text-slate-400">No modules are enabled for your profile.</p>
          )}
        </div>

        {/* COLLAPSE */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((previous) => !previous)}
            className="flex w-full items-center justify-center rounded-xl py-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="ml-2 text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
