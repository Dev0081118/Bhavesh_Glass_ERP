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

const dummyStaff = [];
const departments = ["Account", "Sales", "Purchase", "Production", "Dispatch"];
import {
  createStaff,
  deleteStaff as removeStaff,
  listStaff,
  updateStaff,
} from "../../lib/api";

export default function StaffManagement({ token }) {
  const [staff, setStaff] = useState(token ? [] : dummyStaff);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listStaff(token)
      .then((result) => setStaff(result.staff))
      .catch((loadError) => setError(loadError.message));
  }, [token]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] =
    useState(null);

  const [selectedStaff, setSelectedStaff] =
    useState(null);

  const [deleteStaff, setDeleteStaff] =
    useState(null);

  // =========================
  // FILTER
  // =========================

  const filteredStaff = staff.filter((person) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      person.name
        .toLowerCase()
        .includes(searchValue) ||
      person.email
        .toLowerCase()
        .includes(searchValue) ||
      person.phone.includes(search);

    const matchesRole =
      roleFilter === "All" ||
      person.role === roleFilter;

    const matchesDepartment =
      departmentFilter === "All" ||
      person.department === departmentFilter;

    return (
      matchesSearch &&
      matchesRole &&
      matchesDepartment
    );
  });

  // =========================
  // ADD MANAGER NAME
  // =========================

  const staffWithManagerNames =
    filteredStaff.map((person) => {
      const manager = staff.find(
        (item) =>
          String(item.id) === String(person.managerId)
      );

      return {
        ...person,
        managerName:
          manager?.name || null,
      };
    });

  // =========================
  // CREATE
  // =========================

  const handleCreate = async (formData) => {
    try {
      const result = await createStaff(token, formData);
      setStaff((prev) => [...prev, result.staff]);
      setShowForm(false);
    } catch (createError) {
      setError(createError.message);
    }
  };

  // =========================
  // UPDATE
  // =========================

  const handleUpdate = async (formData) => {
    try {
      const result = await updateStaff(token, editingStaff.id, formData);
      setStaff((prev) => prev.map((person) =>
        person.id === editingStaff.id ? result.staff : person
      ));
      setEditingStaff(null);
      setShowForm(false);
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async () => {
    if (!deleteStaff) return;
    try {
      await removeStaff(token, deleteStaff.id);
      setStaff((prev) => prev.filter((person) => person.id !== deleteStaff.id));
      setDeleteStaff(null);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (person) => {
    setEditingStaff(person);
    setShowForm(true);
  };

  // =========================
  // STATS
  // =========================

  const totalStaff = staff.length;

  const admins = staff.filter(
    (person) => person.role === "Admin"
  ).length;

  const managers = staff.filter(
    (person) => person.role === "Manager"
  ).length;

  const employees = staff.filter(
    (person) => person.role === "Employee"
  ).length;

  return (
    <div className="space-y-6">

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
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
          className="
            inline-flex items-center justify-center
            gap-2 rounded-xl bg-slate-900
            px-4 py-2.5 text-sm font-medium
            text-white shadow-sm transition
            hover:bg-slate-800
            active:scale-[0.98]
          "
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
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search staff by name, email or phone..."
              className="
                h-10 w-full rounded-xl
                border border-slate-200
                bg-slate-50 pl-10 pr-4
                text-sm text-slate-700
                outline-none transition
                placeholder:text-slate-400
                focus:border-slate-300
                focus:bg-white
              "
            />

          </div>

          {/* ROLE */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="
              h-10 rounded-xl
              border border-slate-200
              bg-white px-3
              text-sm text-slate-600
              outline-none
            "
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
            className="
              h-10 rounded-xl
              border border-slate-200
              bg-white px-3
              text-sm text-slate-600
              outline-none
            "
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
            className="
              flex h-10 items-center
              justify-center gap-2
              rounded-xl border
              border-slate-200 px-3
              text-sm text-slate-500
              hover:bg-slate-50
            "
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
    <div
      className="
        rounded-2xl border
        border-slate-200 bg-white p-4
        transition hover:shadow-sm
      "
    >
      <div className="flex items-center gap-3">

        <div className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl bg-slate-100
        ">
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