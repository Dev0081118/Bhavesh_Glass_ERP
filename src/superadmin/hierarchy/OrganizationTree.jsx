import {
  Building2,
  ChevronDown,
  ChevronRight,
  Crown,
  ShieldCheck,
  Users,
} from "lucide-react";
import StaffNode from "./StaffNode";

export default function OrganizationTree({
  staff,
  departments,
  expandedDepartments,
  expandedManagers,
  toggleDepartment,
  toggleManager,
  onSelectStaff,
  selectedStaff,
}) {
  const admins = staff.filter((person) => String(person.role).toLowerCase() === "admin");
  const managers = staff.filter((person) => String(person.role).toLowerCase() === "manager");
  const employees = staff.filter((person) => String(person.role).toLowerCase() === "employee");

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Crown size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Organization owner</p>
              <h2 className="mt-1 text-base font-semibold">Super Admin</h2>
              <p className="mt-1 text-xs text-slate-400">Full system access</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[270px]">
            <Summary label="Admins" value={admins.length} />
            <Summary label="Managers" value={managers.length} />
            <Summary label="Employees" value={employees.length} />
          </div>
        </div>
      </div>

      {admins.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeading icon={ShieldCheck} title="Company administrators" count={admins.length} />
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {admins.map((admin) => (
              <StaffNode key={admin.id} staff={admin} onSelect={onSelectStaff} selected={selectedStaff?.id === admin.id} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading icon={Building2} title="Departments" count={departments.length} />
          <p className="text-xs text-slate-400">Select a department to view its reporting structure.</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {departments.map((department) => {
            const departmentManagers = managers.filter((manager) => String(manager.department || "").toLowerCase() === department.toLowerCase());
            const departmentEmployees = employees.filter((employee) => String(employee.department || "").toLowerCase() === department.toLowerCase());
            const expanded = expandedDepartments.has(department);

            return (
              <article key={department} className="overflow-hidden rounded-xl border border-slate-200">
                <button type="button" onClick={() => toggleDepartment(department)} className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100" aria-expanded={expanded}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm"><Users size={16} /></div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{department}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">{departmentManagers.length} manager{departmentManagers.length !== 1 ? "s" : ""} · {departmentEmployees.length} employee{departmentEmployees.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {expanded ? <ChevronDown size={16} className="shrink-0 text-slate-400" /> : <ChevronRight size={16} className="shrink-0 text-slate-400" />}
                </button>

                {expanded && (
                  <div className="space-y-4 border-t border-slate-200 p-4">
                    {departmentManagers.length === 0 ? <EmptyMessage text="No manager assigned" /> : departmentManagers.map((manager) => {
                      const managerEmployees = departmentEmployees.filter((employee) => String(employee.managerId) === String(manager.id));
                      const managerExpanded = expandedManagers.has(manager.id);

                      return (
                        <div key={manager.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <button type="button" onClick={() => toggleManager(manager.id)} className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" aria-label={`${managerExpanded ? "Collapse" : "Expand"} ${manager.name}`}>
                              {managerExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <div className="min-w-0 flex-1"><StaffNode staff={manager} onSelect={onSelectStaff} selected={selectedStaff?.id === manager.id} /></div>
                          </div>

                          {managerExpanded && (
                            <div className="ml-9 space-y-2 border-l-2 border-slate-100 pl-3">
                              {managerEmployees.length === 0 ? <EmptyMessage text="No employees assigned" /> : managerEmployees.map((employee) => (
                                <StaffNode key={employee.id} staff={employee} compact onSelect={onSelectStaff} selected={selectedStaff?.id === employee.id} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function SectionHeading({ icon: Icon, title, count }) {
  return <div className="flex items-center gap-2"><Icon size={16} className="text-slate-500" /><h2 className="text-sm font-semibold text-slate-900">{title}</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{count}</span></div>;
}

function Summary({ label, value }) {
  return <div className="rounded-lg bg-white/10 px-2 py-2 text-center"><p className="text-base font-semibold">{value}</p><p className="mt-0.5 text-[10px] text-slate-400">{label}</p></div>;
}

function EmptyMessage({ text }) {
  return <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-[11px] text-slate-400">{text}</p>;
}
