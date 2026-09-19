import {
  ChevronDown,
  ChevronRight,
  Users,
  UserCog,
  BriefcaseBusiness,
} from "lucide-react";

import StaffNode from "./StaffNode";

export default function DepartmentNode({
  department,
  managers,
  employees,
  expanded,
  expandedManagers,
  toggleDepartment,
  toggleManager,
  onSelectStaff,
  selectedStaff,
}) {
  const departmentManagers = managers.filter(
    (manager) =>
      String(manager.department || "").toLowerCase() ===
      department.toLowerCase()
  );

  const departmentEmployees = employees.filter(
    (employee) =>
      String(employee.department || "").toLowerCase() ===
      department.toLowerCase()
  );

  const employeeCount = departmentEmployees.length;

  return (
    <div className="relative">

      {/* Department card */}
      <button
        type="button"
        onClick={() => toggleDepartment(department)}
        className="group relative z-10 w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-slate-900">
              <Users
                size={17}
                className="text-slate-600 transition group-hover:text-white"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {department}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {departmentManagers.length}{" "}
                {departmentManagers.length === 1
                  ? "Manager"
                  : "Managers"}{" "}
                · {employeeCount}{" "}
                {employeeCount === 1 ? "Employee" : "Employees"}
              </p>
            </div>

          </div>

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
            {expanded ? (
              <ChevronDown size={15} className="text-slate-500" />
            ) : (
              <ChevronRight size={15} className="text-slate-500" />
            )}
          </div>

        </div>
      </button>

      {/* Connector */}
      {expanded && (
        <div className="absolute left-1/2 top-[76px] h-5 w-px -translate-x-1/2 bg-slate-200" />
      )}

      {/* Managers */}
      {expanded && (
        <div className="mt-5 space-y-5 border-l border-slate-200 pl-4">

          {departmentManagers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-400">
                No manager assigned
              </p>
            </div>
          ) : (
            departmentManagers.map((manager) => {

              const managerEmployees = departmentEmployees.filter(
                (employee) =>
                  String(employee.managerId) ===
                  String(manager.id)
              );

              const managerExpanded = expandedManagers.has(manager.id);

              return (
                <div key={manager.id} className="relative">

                  {/* Manager */}
                  <div className="flex items-start gap-2">

                    <button
                      type="button"
                      onClick={() => toggleManager(manager.id)}
                      className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                    >
                      {managerExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <StaffNode
                        staff={manager}
                        onSelect={onSelectStaff}
                        selected={selectedStaff?.id === manager.id}
                      />
                    </div>

                  </div>

                  {/* Employees */}
                  {managerExpanded && (
                    <div className="ml-9 mt-3 space-y-2 border-l border-slate-200 pl-3">

                      {managerEmployees.length === 0 ? (
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-[11px] text-slate-400">
                            No employees assigned
                          </p>
                        </div>
                      ) : (
                        managerEmployees.map((employee) => (
                          <StaffNode
                            key={employee.id}
                            staff={employee}
                            compact
                            onSelect={onSelectStaff}
                            selected={
                              selectedStaff?.id === employee.id
                            }
                          />
                        ))
                      )}

                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      )}
    </div>
  );
}