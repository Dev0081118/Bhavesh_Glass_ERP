import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import AccessControlHeader from "./AccessControlHeader";
import StaffPermissionList from "./StaffPermissionList";
import PermissionPanel from "./PermissionPanel";
import PermissionSummary from "./PermissionSummary";
import { getAccessUsers, updateAccessUser } from "../../lib/api";

const staffSource = [];
const departmentSource = ["Account", "Sales", "Purchase", "Production", "Dispatch"];
const moduleSource = [
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

    permissions[person.id] = {
      ...(person.access?.modules || {}),
      profile: person.access?.profile || {
        view: true,
        edit: role === "admin",
        resetPassword: role === "admin",
      },
    };

    moduleSource.forEach((moduleName) => {
      const key = normalizeModuleKey(moduleName);

      if (typeof permissions[person.id][key] !== "boolean") {
        permissions[person.id][key] = moduleName === "Dashboard";
      }
    });
  });

  return permissions;
};

export default function AccessControl({ token }) {
  const [staff, setStaff] = useState(staffSource);

  const [permissions, setPermissions] = useState(() =>
    createInitialPermissions(staffSource)
  );

  const [selectedStaffId, setSelectedStaffId] = useState(
    staffSource[0]?.id || null
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadStaff = async () => {
      try {
        const result = await getAccessUsers(token);
        const nextStaff = result.users.map((person) => ({
          ...person,
          id: person.userId,
        }));
        setStaff(nextStaff);
        setPermissions(createInitialPermissions(nextStaff));
        setSelectedStaffId(nextStaff[0]?.id || null);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStaff();
  }, [token]);

  const persistPermissions = (staffId, nextPermissions) => {
    if (!token) return;

    updateAccessUser(token, staffId, {
      modules: Object.fromEntries(
        Object.entries(nextPermissions).filter(([key]) => key !== "profile")
      ),
      profile: nextPermissions.profile,
    }).catch((saveError) => setError(saveError.message));
  };

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

  const selectedProfilePermissions = selectedPermissions.profile || {
    view: true,
    edit: false,
    resetPassword: false,
  };

  const enabledCount = moduleSource.filter(
    (moduleName) =>
      selectedPermissions[normalizeModuleKey(moduleName)]
  ).length;

  const disabledCount =
    moduleSource.length - enabledCount;

  const updatePermission = (moduleName, value) => {
    if (!selectedStaff) return;

    const key = normalizeModuleKey(moduleName);

    const nextPermissions = {
      ...(permissions[selectedStaff.id] || {}),
      [key]: value,
    };

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
    persistPermissions(selectedStaff.id, nextPermissions);
  };

  const updateProfilePermission = (permission, value) => {
    if (!selectedStaff) return;

    const nextPermissions = {
      ...(permissions[selectedStaff.id] || {}),
      profile: {
        ...(permissions[selectedStaff.id]?.profile || {}),
        [permission]: value,
      },
    };

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
    persistPermissions(selectedStaff.id, nextPermissions);
  };

  const enableAll = () => {
    if (!selectedStaff) return;

    const nextPermissions = {
      ...Object.fromEntries(moduleSource.map((moduleName) => [normalizeModuleKey(moduleName), true])),
      profile: permissions[selectedStaff.id]?.profile || selectedProfilePermissions,
    };

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
    persistPermissions(selectedStaff.id, nextPermissions);
  };

  const disableAll = () => {
    if (!selectedStaff) return;

    const nextPermissions = {
      ...Object.fromEntries(moduleSource.map((moduleName) => [normalizeModuleKey(moduleName), false])),
      profile: permissions[selectedStaff.id]?.profile || selectedProfilePermissions,
    };

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextPermissions,
    }));
    persistPermissions(selectedStaff.id, nextPermissions);
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

    const nextRolePermissions = {
      ...nextPermissions,
      profile: permissions[selectedStaff.id]?.profile || selectedProfilePermissions,
    };

    setPermissions((previous) => ({
      ...previous,
      [selectedStaff.id]: nextRolePermissions,
    }));
    persistPermissions(selectedStaff.id, nextRolePermissions);
  };

  return (
    <div className="min-h-full bg-[#f7f7f8]  p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading staff access...
          </div>
        )}

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
            profilePermissions={selectedProfilePermissions}
            onPermissionChange={updatePermission}
            onProfilePermissionChange={updateProfilePermission}
            onEnableAll={enableAll}
            onDisableAll={disableAll}
            onReset={resetPermissions}
          />

        </div>
      </div>
    </div>
  );
}