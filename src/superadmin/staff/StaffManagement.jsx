import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  UserCog,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import StaffTable from "./StaffTable";
import StaffForm from "./StaffForm";
import StaffProfile from "./StaffProfile";
import DeleteStaffModal from "./DeleteStaffModal";
import Toast from "../../components/Toast";

import {
  createStaff,
  deleteStaff as removeStaff,
  listStaff,
  updateStaff,
} from "../../lib/api";

const dummyStaff = [];

const departments = [
  "Account",
  "Sales",
  "Purchase",
  "Production",
  "Dispatch",
];

export default function StaffManagement({
  token,
}) {
  const [staff, setStaff] = useState(
    token ? [] : dummyStaff
  );

  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState("All");

  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [editingStaff, setEditingStaff] =
    useState(null);

  const [selectedStaff, setSelectedStaff] =
    useState(null);

  const [deleteStaff, setDeleteStaff] =
    useState(null);

  // =========================
  // TOAST
  // =========================

  const showToast = (
    type,
    title,
    message
  ) => {
    setToast({
      type,
      title,
      message,
    });
  };

  // =========================
  // LOAD STAFF
  // =========================

  useEffect(() => {
    if (!token) return;

    listStaff(token)
      .then((result) => {
        setStaff(result.staff || []);
        setError("");
      })
      .catch((loadError) => {
        setError(loadError.message);

        showToast(
          "error",
          "Unable to Load Staff",
          loadError.message
        );
      });
  }, [token]);

  // =========================
  // FILTER
  // =========================

  const filteredStaff = staff.filter(
    (person) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        person.name
          ?.toLowerCase()
          .includes(searchValue) ||
        person.email
          ?.toLowerCase()
          .includes(searchValue) ||
        person.phone
          ?.includes(search);

      const matchesRole =
        roleFilter === "All" ||
        person.role === roleFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        person.department ===
          departmentFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesDepartment
      );
    }
  );

  // =========================
  // MANAGER NAMES
  // =========================

  const staffWithManagerNames =
    filteredStaff.map((person) => {
      const manager = staff.find(
        (item) =>
          String(item.id) ===
          String(person.managerId)
      );

      return {
        ...person,
        managerName:
          manager?.name ||
          person.managerName ||
          null,
      };
    });

  // =========================
  // CREATE
  // =========================

  const handleCreate = async (
    formData
  ) => {
    try {
      setError("");

      const result = await createStaff(
        token,
        formData
      );

      setStaff((prev) => [
        result.staff,
        ...prev,
      ]);

      setShowForm(false);

      showToast(
        "success",
        "Staff Created",
        `${result.staff.name} has been created successfully.`
      );
    } catch (createError) {
      setError(createError.message);

      showToast(
        "error",
        "Creation Failed",
        createError.message
      );
    }
  };

  // =========================
  // UPDATE
  // =========================

  const handleUpdate = async (
    formData
  ) => {
    if (!editingStaff) return;

    try {
      setError("");

      const result = await updateStaff(
        token,
        editingStaff.id,
        formData
      );

      setStaff((prev) =>
        prev.map((person) =>
          String(person.id) ===
          String(editingStaff.id)
            ? result.staff
            : person
        )
      );

      setEditingStaff(null);
      setShowForm(false);

      showToast(
        "success",
        "Staff Updated",
        `${result.staff.name}'s information has been updated successfully.`
      );
    } catch (updateError) {
      setError(updateError.message);

      showToast(
        "error",
        "Update Failed",
        updateError.message
      );
    }
  };

  // =========================
  // STATUS
  // =========================

  const handleStatusChange = async (
    person
  ) => {
    const nextStatus =
      person.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      setError("");

      const result = await updateStaff(
        token,
        person.id,
        {
          status: nextStatus,
        }
      );

      setStaff((prev) =>
        prev.map((item) =>
          String(item.id) ===
          String(person.id)
            ? result.staff
            : item
        )
      );

      showToast(
        "success",
        nextStatus === "Active"
          ? "Staff Activated"
          : "Staff Deactivated",
        `${person.name} is now ${nextStatus.toLowerCase()}.`
      );
    } catch (statusError) {
      showToast(
        "error",
        "Status Update Failed",
        statusError.message
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async () => {
    if (!deleteStaff) return;

    try {
      setError("");

      await removeStaff(
        token,
        deleteStaff.id
      );

      setStaff((prev) =>
        prev.filter(
          (person) =>
            String(person.id) !==
            String(deleteStaff.id)
        )
      );

      showToast(
        "success",
        "Staff Deleted",
        `${deleteStaff.name} has been deleted successfully.`
      );

      setDeleteStaff(null);
    } catch (deleteError) {
      setError(deleteError.message);

      showToast(
        "error",
        "Delete Failed",
        deleteError.message
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (person) => {
    setError("");
    setEditingStaff(person);
    setShowForm(true);
  };

  // =========================
  // STATS
  // =========================

  const totalStaff = staff.length;

  const admins = staff.filter(
    (person) =>
      person.role === "Admin"
  ).length;

  const managers = staff.filter(
    (person) =>
      person.role === "Manager"
  ).length;

  const employees = staff.filter(
    (person) =>
      person.role === "Employee"
  ).length;

  return (
    <div className="space-y-6">
      {/* ERROR */}

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Organization
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Staff Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage administrators, managers and employees.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingStaff(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
        >
          <Plus size={17} />
          Create Staff
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={totalStaff}
          icon={Users}
          description="All registered staff"
        />

        <StatCard
          title="Administrators"
          value={admins}
          icon={ShieldCheck}
          description="Company-wide users"
        />

        <StatCard
          title="Managers"
          value={managers}
          icon={UserCog}
          description="Department managers"
        />

        <StatCard
          title="Employees"
          value={employees}
          icon={UserRound}
          description="Department employees"
        />
      </div>

      {/* FILTER BAR */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search staff by name, email or phone..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
            />
          </div>

          {/* ROLE */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
          >
            <option value="All">
              All Roles
            </option>

            <option value="Admin">
              Admin
            </option>

            <option value="Manager">
              Manager
            </option>

            <option value="Employee">
              Employee
            </option>
          </select>

          {/* DEPARTMENT */}

          <select
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(
                e.target.value
              )
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
          >
            <option value="All">
              All Departments
            </option>

            {departments.map(
              (department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500 hover:bg-slate-50"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* TABLE */}

      <StaffTable
        staff={staffWithManagerNames}
        onView={setSelectedStaff}
        onEdit={handleEdit}
        onDelete={setDeleteStaff}
        onStatusChange={
          handleStatusChange
        }
      />

      {/* CREATE / EDIT */}

      {showForm && (
        <StaffForm
          staff={staff}
          editingStaff={editingStaff}
          onClose={() => {
            setShowForm(false);
            setEditingStaff(null);
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* PROFILE */}

      {selectedStaff && (
        <StaffProfile
          staff={selectedStaff}
          onClose={() =>
            setSelectedStaff(null)
          }
          onEdit={() => {
            handleEdit(selectedStaff);
            setSelectedStaff(null);
          }}
        />
      )}

      {/* DELETE */}

      {deleteStaff && (
        <DeleteStaffModal
          staff={deleteStaff}
          onCancel={() =>
            setDeleteStaff(null)
          }
          onConfirm={handleDelete}
        />
      )}

      {/* TOAST */}

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

// =========================
// STAT CARD
// =========================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon
            size={17}
            className="text-slate-600"
          />
        </div>

        <div>
          <p className="text-[11px] text-slate-400">
            {title}
          </p>

          <p className="text-xl font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        {description}
      </p>
    </div>
  );
}