import {
  ChevronDown,
  ChevronRight,
  Crown,
  ShieldCheck,
  Building2,
} from "lucide-react";

import DepartmentNode from "./DepartmentNode";
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
  const admins = staff.filter(
    (person) => String(person.role).toLowerCase() === "admin"
  );

  const managers = staff.filter(
    (person) => String(person.role).toLowerCase() === "manager"
  );

  const employees = staff.filter(
    (person) => String(person.role).toLowerCase() === "employee"
  );

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-8">

      <div className="min-w-[950px]">

        {/* Super Admin */}
        <div className="flex flex-col items-center">

          <div className="relative">
            <div className="absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-slate-200" />

            <div className="w-[230px] rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Crown size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    SYSTEM OWNER
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold">
                    Super Admin
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Full system access
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Main vertical line */}
          <div className="relative mt-8 w-full">

            <div className="absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-slate-200" />

            {/* Admins */}
            {admins.length > 0 && (
              <div className="relative flex flex-col items-center pt-7">

                <div className="absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-slate-200" />

                <div className="mb-5 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                  <ShieldCheck size={15} className="text-slate-600" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Company Admins
                  </span>

                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                    {admins.length}
                  </span>
                </div>

                <div className="relative flex flex-wrap justify-center gap-5">
                  {admins.map((admin) => (
                    <StaffNode
                      key={admin.id}
                      staff={admin}
                      onSelect={onSelectStaff}
                      selected={selectedStaff?.id === admin.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Departments */}
            <div className="mt-12">

              <div className="mb-7 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                  <Building2 size={15} className="text-slate-600" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Departments
                  </span>

                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                    {departments.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-5">
                {departments.map((department) => (
                  <DepartmentNode
                    key={department}
                    department={department}
                    managers={managers}
                    employees={employees}
                    expanded={expandedDepartments.has(department)}
                    expandedManagers={expandedManagers}
                    toggleDepartment={toggleDepartment}
                    toggleManager={toggleManager}
                    onSelectStaff={onSelectStaff}
                    selectedStaff={selectedStaff}
                  />
                ))}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}