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

import {
  createStaff,
  deleteStaff as removeStaff,
  listStaff,
  updateStaff,
  updateStaffStatus,
} from "../../lib/api";

import { useToast } from "../../components/ToastProvider";

const dummyStaff = [];

const departments = [
  "Account",
  "Sales",
  "Purchase",
  "Production",
  "Dispatch",
];

export default function StaffManagement({ token }) {
  const { showToast } = useToast();

  const [staff, setStaff] = useState(
    token ? [] : dummyStaff
  );

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

  /*
   * =========================
   * LOAD STAFF
   * =========================
   */

  useEffect(() => {
    if (!token) return;

    const loadStaff = async () => {
      try {
        const result = await listStaff(token);

        const normalizedStaff = (
          result.staff || []
        ).map((person) => ({
          ...person,

          // Normalize IDs so all comparisons
          // work reliably with MongoDB ObjectIds.
          id: String(person.id),

          managerId: person.managerId
            ? String(person.managerId)
            : null,

          // Preserve backend-provided managerName.
          managerName:
            person.managerName || null,

          status:
            person.status || "Active",
        }));

        setStaff(normalizedStaff);
      } catch (loadError) {
        showToast(
          "error",
          "Unable to Load Staff",
          loadError.message ||
            "Something went wrong while loading staff."
        );
      }
    };

    loadStaff();
  }, [token, showToast]);

  /*
   * =========================
   * FILTER STAFF
   * =========================
   */

  const filteredStaff = staff.filter((person) => {
    const searchValue =
      search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      person.name
        ?.toLowerCase()
        .includes(searchValue) ||
      person.email
        ?.toLowerCase()
        .includes(searchValue) ||
      person.phone?.includes(searchValue);

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

  /*
   * =========================
   * MANAGER NAMES
   * =========================
   *
   * Backend already returns managerName.
   * We preserve it first.
   *
   * Local lookup is only a fallback.
   */

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
          person.managerName ||
          manager?.name ||
          null,
      };
    });

  /*
   * =========================
   * CREATE STAFF
   * =========================
   */

  const handleCreate = async (formData) => {
    try {
      const result = await createStaff(
        token,
        formData
      );

      const createdStaff = {
        ...result.staff,
        id: String(result.staff.id),

        managerId: result.staff.managerId
          ? String(result.staff.managerId)
          : null,

        managerName:
          result.staff.managerName || null,

        status:
          result.staff.status || "Active",
      };

      setStaff((prev) => [
        ...prev,
        createdStaff,
      ]);

      setShowForm(false);
      setEditingStaff(null);

      showToast(
        "success",
        "Staff Created",
        `${createdStaff.name} was created successfully.`
      );
    } catch (createError) {
      showToast(
        "error",
        "Creation Failed",
        createError.message ||
          "Unable to create staff."
      );
    }
  };

  /*
   * =========================
   * UPDATE STAFF
   * =========================
   */

  const handleUpdate = async (formData) => {
    if (!editingStaff) return;

    try {
      const result = await updateStaff(
        token,
        editingStaff.id,
        formData
      );

      const updatedStaff = {
        ...result.staff,

        id: String(result.staff.id),

        managerId: result.staff.managerId
          ? String(result.staff.managerId)
          : null,

        managerName:
          result.staff.managerName || null,

        status:
          result.staff.status || "Active",
      };

      setStaff((prev) =>
        prev.map((person) =>
          String(person.id) ===
          String(editingStaff.id)
            ? updatedStaff
            : person
        )
      );

      /*
       * If the edited person is currently selected
       * in the profile modal, update that too.
       */
      setSelectedStaff((prev) => {
        if (
          !prev ||
          String(prev.id) !==
            String(editingStaff.id)
        ) {
          return prev;
        }

        return updatedStaff;
      });

      setEditingStaff(null);
      setShowForm(false);

      showToast(
        "success",
        "Staff Updated",
        `${updatedStaff.name} was updated successfully.`
      );
    } catch (updateError) {
      showToast(
        "error",
        "Update Failed",
        updateError.message ||
          "Unable to update staff."
      );
    }
  };

  /*
   * =========================
   * TOGGLE STAFF STATUS
   * =========================
   *
   * Active -> Inactive
   * Inactive -> Active
   */

  const handleToggleStatus = async (person) => {
    if (!person?.id) {
      showToast(
        "error",
        "Status Update Failed",
        "Staff ID is missing."
      );

      return;
    }

    const currentStatus =
      person.status || "Active";

    const nextStatus =
      currentStatus === "Active"
        ? "Inactive"
        : "Active";

    try {
      const result =
        await updateStaffStatus(
          token,
          person.id,
          nextStatus
        );

      const updatedStaff = {
        ...result.staff,

        id: String(result.staff.id),

        managerId: result.staff.managerId
          ? String(result.staff.managerId)
          : null,

        managerName:
          result.staff.managerName ||
          person.managerName ||
          null,

        status:
          result.staff.status ||
          nextStatus,
      };

      /*
       * Update staff table immediately.
       */
      setStaff((prev) =>
        prev.map((staffMember) =>
          String(staffMember.id) ===
          String(person.id)
            ? updatedStaff
            : staffMember
        )
      );

      /*
       * Update profile if this staff member
       * is currently open.
       */
      setSelectedStaff((prev) => {
        if (
          !prev ||
          String(prev.id) !==
            String(person.id)
        ) {
          return prev;
        }

        return updatedStaff;
      });

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
        statusError.message ||
          `Unable to ${nextStatus === "Active" ? "activate" : "deactivate"} staff.`
      );
    }
  };

  /*
   * =========================
   * DELETE STAFF
   * =========================
   */

  const handleDelete = async () => {
    if (!deleteStaff?.id) return;

    try {
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

      /*
       * Close profile if the deleted person
       * was currently selected.
       */
      setSelectedStaff((prev) => {
        if (
          prev &&
          String(prev.id) ===
            String(deleteStaff.id)
        ) {
          return null;
        }

        return prev;
      });

      showToast(
        "success",
        "Staff Deleted",
        `${deleteStaff.name} was deleted successfully.`
      );

      setDeleteStaff(null);
    } catch (deleteError) {
      showToast(
        "error",
        "Delete Failed",
        deleteError.message ||
          "Unable to delete staff."
      );
    }
  };

  /*
   * =========================
   * EDIT STAFF
   * =========================
   */

  const handleEdit = (person) => {
    setEditingStaff(person);
    setShowForm(true);
  };

  /*
   * =========================
   * STATISTICS
   * =========================
   */

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

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

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
          type="button"
          onClick={() => {
            setEditingStaff(null);
            setShowForm(true);
          }}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-slate-900
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            shadow-sm
            transition
            hover:bg-slate-800
            active:scale-[0.98]
          "
        >
          <Plus size={17} />
          Create Staff
        </button>

      </div>

      {/* =========================
          STATISTICS
      ========================= */}

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

      {/* =========================
          FILTER BAR
      ========================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={17}
              className="
                absolute
                left-3
                top-1/2
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
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
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
              h-10
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              text-slate-600
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
              h-10
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              text-slate-600
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
            type="button"
            className="
              flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              px-3
              text-sm
              text-slate-500
              hover:bg-slate-50
            "
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

        </div>

      </div>

      {/* =========================
          STAFF TABLE
      ========================= */}

      <StaffTable
        staff={staffWithManagerNames}
        onView={setSelectedStaff}
        onEdit={handleEdit}
        onDelete={setDeleteStaff}
        onToggleStatus={
          handleToggleStatus
        }
      />

      {/* =========================
          CREATE / EDIT FORM
      ========================= */}

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

      {/* =========================
          PROFILE
      ========================= */}

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

      {/* =========================
          DELETE MODAL
      ========================= */}

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

/*
 * =========================
 * STAT CARD
 * =========================
 */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        transition
        hover:shadow-sm
      "
    >
      <div className="flex items-center gap-3">

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-100
          "
        >
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

