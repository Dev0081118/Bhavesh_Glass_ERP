import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import * as dummyData from "../../data/dummyData";
import AccessControlHeader from "./AccessControlHeader";
import StaffPermissionList from "./StaffPermissionList";
import PermissionPanel from "./PermissionPanel";
import PermissionSummary from "./PermissionSummary";

const staffSource =
  dummyData.dummyStaff ||
  dummyData.staff ||
  dummyData.DUMMY_STAFF ||
  dummyData.initialStaff ||
  [];

const departmentSource =
  dummyData.departments ||
  dummyData.DEPARTMENTS ||
  ["Account", "Sales", "Purchase", "Production", "Dispatch"];

const moduleSource =
  dummyData.modules ||
  dummyData.MODULES ||
  [
    "Dashboard",
    "Payment",
    "LR",
    "Ledger",
    "Product",
    "Sale Bill",
    "WhatsApp AI",
    "Inventory",
    "Purchase",
    "Production",
    "Dispatch",
    "Reports",
  ];

const normalizeModuleKey = (moduleName) =>
  String(moduleName)
    .toLowerCase()
    .replace(/\s+/g, "_");

const createInitialPermissions = (staff) => {
  const permissions = {};

  staff.forEach((person) => {
    const role = String(person.role || "").toLowerCase();

    permissions[person.id] = {};

    moduleSource.forEach((moduleName) => {
      const key = normalizeModuleKey(moduleName);

      // Admin gets all modules initially.
      if (role === "admin") {
        permissions[person.id][key] = true;
      } else {
        // Managers and Employees start with a smaller set.
        permissions[person.id][key] =
          moduleName === "Dashboard";
      }
    });
  });

  return permissions;
};

export default function AccessControl() {
  const [staff] = useState(staffSource);

  const [permissions, setPermissions] = useState(() =>
    createInitialPermissions(staffSource)
  );

  const [selectedStaffId, setSelectedStaffId] = useState(
    staffSource[0]?.id || null
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

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
          person.role,
          person.department,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const matchesRole =
        roleFilter === "All" ||
        String(person.role).toLowerCase() ===
          roleFilter.toLowerCase();

      const matchesDepartment =
        departmentFilter === "All" ||
        String(person.department || "").toLowerCase() ===
          departmentFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRole &&
        matchesDepartment
      );
    });
  }, [
    staff,
    search,
    roleFilter,
    departmentFilter,
  ]);

  const selectedStaff =
    staff.find(
      (person) => String(person.id) === String(selectedStaffId)
    ) || null;

  const selectedPermissions =
    selectedStaff && permissions[selectedStaff.id]
      ? permissions[selectedStaff.id]
      : {};

  const enabledCount = moduleSource.filter(
    (moduleName) =>
      selectedPermissions[normalizeModuleKey(moduleName)]
  ).length;

  const disabledCount =
    moduleSource.length - enabledCount;

  const updatePermission = (moduleName, value) => {
    if (!selectedStaff) return;

    const key = normalizeModuleKey(moduleName);

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: {
        ...(previous[selectedStaff.id] || {}),
        [key]: value,
      },
    }));
  };

  const enableAll = () => {
    if (!selectedStaff) return;

    const nextPermissions = {};

    moduleSource.forEach((moduleName) => {
      nextPermissions[normalizeModuleKey(moduleName)] = true;
    });

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
  };

  const disableAll = () => {
    if (!selectedStaff) return;

    const nextPermissions = {};

    moduleSource.forEach((moduleName) => {
      nextPermissions[normalizeModuleKey(moduleName)] = false;
    });

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
  };

  const resetPermissions = () => {
    if (!selectedStaff) return;

    const role = String(
      selectedStaff.role || ""
    ).toLowerCase();

    const nextPermissions = {};

    moduleSource.forEach((moduleName) => {
      nextPermissions[
        normalizeModuleKey(moduleName)
      ] =
        role === "admin"
          ? true
          : moduleName === "Dashboard";
    });

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
  };

  return (
    <div className="min-h-full bg-[#f7f7f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        <AccessControlHeader
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          departments={departmentSource}
        />

        <PermissionSummary
          totalStaff={staff.length}
          filteredStaff={filteredStaff.length}
          enabledCount={enabledCount}
          disabledCount={disabledCount}
          totalModules={moduleSource.length}
        />

        <div className="grid min-h-[650px] grid-cols-1 gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">

          <StaffPermissionList
            staff={filteredStaff}
            selectedStaffId={selectedStaffId}
            setSelectedStaffId={setSelectedStaffId}
            permissions={permissions}
            modules={moduleSource}
          />

          <PermissionPanel
            staff={selectedStaff}
            modules={moduleSource}
            permissions={selectedPermissions}
            onPermissionChange={updatePermission}
            onEnableAll={enableAll}
            onDisableAll={disableAll}
            onReset={resetPermissions}
          />

        </div>
      </div>
    </div>
  );
}