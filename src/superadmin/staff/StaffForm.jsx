import { useEffect, useState } from "react";
import {
  X,
  UserPlus,
} from "lucide-react";

import {
  departments,
  roles,
} from "../../data/dummyData";

export default function StaffForm({
  staff,
  editingStaff,
  onClose,
  onCreate,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    alternatePhone: "",
    address: "",
    aadhaar: "",
    role: "Employee",
    department: "",
    managerId: "",
  });

  const [errors, setErrors] = useState({});

  const isEditing = Boolean(editingStaff);

  // =========================
  // LOAD FORM DATA
  // =========================

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name || "",
        email: editingStaff.email || "",
        dob: editingStaff.dob
          ? new Date(editingStaff.dob)
              .toISOString()
              .split("T")[0]
          : "",
        phone: editingStaff.phone || "",
        alternatePhone:
          editingStaff.alternatePhone || "",
        address: editingStaff.address || "",
        aadhaar: editingStaff.aadhaar || "",
        role: editingStaff.role || "Employee",
        department:
          editingStaff.department || "",
        managerId:
          editingStaff.managerId || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        dob: "",
        phone: "",
        alternatePhone: "",
        address: "",
        aadhaar: "",
        role: "Employee",
        department: "",
        managerId: "",
      });
    }

    setErrors({});
  }, [editingStaff]);

  // =========================
  // CHANGE
  // =========================

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // =========================
  // ROLE
  // =========================

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,

      department:
        role === "Admin"
          ? ""
          : prev.department,

      managerId:
        role === "Employee"
          ? prev.managerId
          : "",
    }));

    setErrors({});
  };

  // =========================
  // DEPARTMENT
  // =========================

  const handleDepartmentChange = (department) => {
    setFormData((prev) => ({
      ...prev,
      department,
      managerId: "",
    }));

    setErrors((prev) => ({
      ...prev,
      department: "",
      managerId: "",
    }));
  };

  // =========================
  // AVAILABLE MANAGERS
  // =========================

  const availableManagers = staff.filter(
    (person) =>
      person.role === "Manager" &&
      person.department ===
        formData.department &&
      person.status !== "Inactive" &&
      String(person.id) !==
        String(editingStaff?.id)
  );

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.dob) {
      newErrors.dob =
        "Date of birth is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required";
    }

    // Aadhaar intentionally NOT required.
    // It is optional.

    if (
      formData.role !== "Admin" &&
      !formData.department
    ) {
      newErrors.department =
        "Department is required";
    }

    if (
      formData.role === "Employee" &&
      !formData.managerId
    ) {
      newErrors.managerId =
        "Manager is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      aadhaar: formData.aadhaar.trim() || "",
    };

    if (isEditing) {
      onUpdate(payload);
    } else {
      onCreate(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* OVERLAY */}

      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />

      {/* MODAL */}

      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <UserPlus size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing
                  ? "Edit Staff"
                  : "Create Staff"}
              </h2>

              <p className="text-xs text-slate-400">
                {isEditing
                  ? "Update staff information"
                  : "Add a new member to your organization"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* PERSONAL */}

            <section>
              <p className="text-xs font-semibold text-slate-900">
                Personal Information
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Basic information about the staff member.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  field="name"
                  value={formData.name}
                  error={errors.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />

                <Input
                  label="Email"
                  field="email"
                  type="email"
                  value={formData.email}
                  error={errors.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                />

                <Input
                  label="Date of Birth"
                  field="dob"
                  type="date"
                  value={formData.dob}
                  error={errors.dob}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number"
                  field="phone"
                  value={formData.phone}
                  error={errors.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                />

                <Input
                  label="Alternate Phone"
                  field="alternatePhone"
                  value={
                    formData.alternatePhone
                  }
                  error={
                    errors.alternatePhone
                  }
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />

                {/* AADHAAR - OPTIONAL */}

                <Input
                  label="Aadhaar"
                  field="aadhaar"
                  value={formData.aadhaar}
                  error={errors.aadhaar}
                  onChange={handleChange}
                  placeholder="XXXX XXXX XXXX (Optional)"
                />
              </div>

              {/* ADDRESS */}

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Address
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    handleChange(
                      "address",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Enter complete address"
                  className={`w-full resize-none rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:bg-white ${
                    errors.address
                      ? "border-red-300"
                      : "border-slate-200 focus:border-slate-300"
                  }`}
                />

                {errors.address && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.address}
                  </p>
                )}
              </div>
            </section>

            {/* ORGANIZATION */}

            <section className="border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold text-slate-900">
                Organization
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Define the staff member's role and hierarchy.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* ROLE */}

                <SelectField
                  label="Role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  options={roles}
                  required
                />

                {/* DEPARTMENT */}

                {formData.role !== "Admin" && (
                  <SelectField
                    label="Department"
                    value={formData.department}
                    onChange={
                      handleDepartmentChange
                    }
                    options={departments}
                    placeholder="Select department"
                    error={
                      errors.department
                    }
                    required
                  />
                )}

                {/* MANAGER */}

                {formData.role ===
                  "Employee" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Manager
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <select
                      value={
                        formData.managerId
                      }
                      onChange={(e) =>
                        handleChange(
                          "managerId",
                          e.target.value
                        )
                      }
                      disabled={
                        !formData.department
                      }
                      className={`h-10 w-full rounded-xl border bg-slate-50 px-3 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.managerId
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                    >
                      <option value="">
                        {!formData.department
                          ? "Select department first"
                          : availableManagers.length
                            ? "Select manager"
                            : "No active manager available"}
                      </option>

                      {availableManagers.map(
                        (manager) => (
                          <option
                            key={manager.id}
                            value={manager.id}
                          >
                            {manager.name}
                          </option>
                        )
                      )}
                    </select>

                    {errors.managerId && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {errors.managerId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ADMIN INFO */}

              {formData.role === "Admin" && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-700">
                    Company-wide administrator
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    Administrators do not belong to any department.
                    Their module access and visibility are managed
                    by the Super Admin.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              {isEditing
                ? "Save Changes"
                : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================
// INPUT
// =========================

function Input({
  label,
  field,
  type = "text",
  value,
  error,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={(e) =>
          onChange(
            field,
            e.target.value
          )
        }
        placeholder={placeholder}
        className={`h-10 w-full rounded-xl border bg-slate-50 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:bg-white ${
          error
            ? "border-red-300"
            : "border-slate-200 focus:border-slate-300"
        }`}
      />

      {error && (
        <p className="mt-1 text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

// =========================
// SELECT
// =========================

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`h-10 w-full rounded-xl border bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white ${
          error
            ? "border-red-300"
            : "border-slate-200"
        }`}
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}