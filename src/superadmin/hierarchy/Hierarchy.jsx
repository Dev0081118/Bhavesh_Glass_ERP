import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCog,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";

import HierarchyHeader from "./HierarchyHeader";
import OrganizationTree from "./OrganizationTree";
import { listStaff } from "../../lib/api";

const staffSource = [];
const departmentSource = ["Account", "Sales", "Purchase", "Production", "Dispatch"];

export default function Hierarchy({ token }) {
  const [staff, setStaff] = useState(token ? [] : staffSource);

  useEffect(() => {
    if (!token) return;
    listStaff(token).then((result) => setStaff(result.staff));
  }, [token]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [expandedDepartments, setExpandedDepartments] = useState(
    () => new Set(departmentSource)
  );

  const [expandedManagers, setExpandedManagers] = useState(() => new Set());

  const [selectedStaff, setSelectedStaff] = useState(null);

  const stats = useMemo(() => {
    return {
      total: staff.length,
      admins: staff.filter(
        (person) => String(person.role).toLowerCase() === "admin"
      ).length,
      managers: staff.filter(
        (person) => String(person.role).toLowerCase() === "manager"
      ).length,
      employees: staff.filter(
        (person) => String(person.role).toLowerCase() === "employee"
      ).length,
    };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((person) => {
      const matchesSearch =
        !query ||
        [
          person.name,
          person.fullName,
          person.email,
          person.phone,
          person.department,
          person.role,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const matchesRole =
        roleFilter === "All" ||
        String(person.role).toLowerCase() === roleFilter.toLowerCase();

      const matchesDepartment =
        departmentFilter === "All" ||
        String(person.department || "").toLowerCase() ===
          departmentFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [staff, search, roleFilter, departmentFilter]);

  const toggleDepartment = (department) => {
    setExpandedDepartments((previous) => {
      const next = new Set(previous);

      if (next.has(department)) {
        next.delete(department);
      } else {
        next.add(department);
      }

      return next;
    });
  };

  const toggleManager = (managerId) => {
    setExpandedManagers((previous) => {
      const next = new Set(previous);

      if (next.has(managerId)) {
        next.delete(managerId);
      } else {
        next.add(managerId);
      }

      return next;
    });
  };

  const expandAll = () => {
    setExpandedDepartments(new Set(departmentSource));

    const managerIds = staff
      .filter(
        (person) =>
          String(person.role).toLowerCase() === "manager"
      )
      .map((manager) => manager.id);

    setExpandedManagers(new Set(managerIds));
  };

  const collapseAll = () => {
    setExpandedDepartments(new Set());
    setExpandedManagers(new Set());
  };

  return (
    <div className="min-h-full bg-[#f7f7f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* Header */}
        <HierarchyHeader
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          departments={departmentSource}
          expandAll={expandAll}
          collapseAll={collapseAll}
        />

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <SummaryCard
            icon={Users}
            label="Total Staff"
            value={stats.total}
          />

          <SummaryCard
            icon={ShieldCheck}
            label="Admins"
            value={stats.admins}
          />

          <SummaryCard
            icon={UserCog}
            label="Managers"
            value={stats.managers}
          />

          <SummaryCard
            icon={BriefcaseBusiness}
            label="Employees"
            value={stats.employees}
          />

        </div>

        {/* Organization tree */}
        <OrganizationTree
          staff={filteredStaff}
          departments={departmentSource}
          expandedDepartments={expandedDepartments}
          expandedManagers={expandedManagers}
          toggleDepartment={toggleDepartment}
          toggleManager={toggleManager}
          onSelectStaff={setSelectedStaff}
          selectedStaff={selectedStaff}
        />

      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={19} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
}