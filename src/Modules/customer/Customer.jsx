import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  UserX,
} from "lucide-react";

import {
  createCustomer,
  deleteCustomer,
  getAssignableCustomerStaff,
  listCustomers,
  updateCustomer,
} from "../../lib/api";

import {
  useToast,
} from "../../components/ToastProvider";

import CustomerForm from "./CustomerForm";
import CustomerDetails from "./CustomerDetails";
import DeleteCustomerModal from "./DeleteCustomerModal";

const normalizeCustomer = (
  customer
) => ({
  ...customer,

  id:
    customer._id ||
    customer.id,
});

export default function Customer({
  token,
}) {
  const { showToast } =
    useToast();

  const [
    customers,
    setCustomers,
  ] = useState([]);

  const [
    staff,
    setStaff,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    assignedFilter,
    setAssignedFilter,
  ] = useState("All");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(null);

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const loadData =
    async () => {
      try {
        setLoading(true);

        const [
          customerResult,
          staffResult,
        ] =
          await Promise.all([
            listCustomers(
              token
            ),

            getAssignableCustomerStaff(
              token
            ),
          ]);

        setCustomers(
          (
            customerResult.data ||
            []
          ).map(
            normalizeCustomer
          )
        );

        setStaff(
          staffResult.data ||
            []
        );
      } catch (error) {
        showToast(
          "error",
          "Unable to load customers",
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadData();
  }, [token]);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return customers.filter(
        (customer) => {
          const searchable = [
            customer.name,
            customer.companyName,
            customer.phone,
            customer.email,
            customer.city,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchable.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "All" ||
            customer.status ===
              statusFilter;

          let matchesAssigned =
            true;

          if (
            assignedFilter ===
            "Unassigned"
          ) {
            matchesAssigned =
              !customer.assignedTo;
          } else if (
            assignedFilter !==
            "All"
          ) {
            const assignedId =
              customer.assignedTo
                ?._id ||
              customer.assignedTo;

            matchesAssigned =
              String(
                assignedId
              ) ===
              String(
                assignedFilter
              );
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesAssigned
          );
        }
      );
    }, [
      customers,
      search,
      statusFilter,
      assignedFilter,
    ]);

  const handleSave =
    async (data) => {
      try {
        setSaving(true);

        const result =
          editing
            ? await updateCustomer(
                token,
                editing.id,
                data
              )
            : await createCustomer(
                token,
                data
              );

        const saved =
          normalizeCustomer(
            result.data
          );

        setCustomers(
          (current) =>
            editing
              ? current.map(
                  (item) =>
                    item.id ===
                    editing.id
                      ? saved
                      : item
                )
              : [
                  saved,
                  ...current,
                ]
        );

        setShowForm(false);
        setEditing(null);

        showToast(
          "success",
          editing
            ? "Customer updated"
            : "Customer created",
          editing
            ? "Customer updated successfully."
            : "Customer created successfully."
        );
      } catch (error) {
        showToast(
          "error",
          "Unable to save customer",
          error.message
        );
      } finally {
        setSaving(false);
      }
    };

  const toggleStatus =
    async (customer) => {
      try {
        const status =
          customer.status ===
          "Active"
            ? "Inactive"
            : "Active";

        const result =
          await updateCustomer(
            token,
            customer.id,
            {
              status,
            }
          );

        const updated =
          normalizeCustomer(
            result.data
          );

        setCustomers(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                customer.id
                  ? updated
                  : item
            )
        );

        showToast(
          "success",
          status === "Active"
            ? "Customer activated"
            : "Customer deactivated",
          `${customer.name} is now ${status.toLowerCase()}.`
        );
      } catch (error) {
        showToast(
          "error",
          "Unable to update status",
          error.message
        );
      }
    };

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setDeleting(true);

        await deleteCustomer(
          token,
          deleteTarget.id
        );

        setCustomers(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                deleteTarget.id
            )
        );

        if (
          selected?.id ===
          deleteTarget.id
        ) {
          setSelected(null);
        }

        showToast(
          "success",
          "Customer deleted",
          "Customer deleted successfully."
        );

        setDeleteTarget(null);
      } catch (error) {
        showToast(
          "error",
          "Unable to delete customer",
          error.message
        );
      } finally {
        setDeleting(false);
      }
    };

  const total =
    customers.length;

  const active =
    customers.filter(
      (customer) =>
        customer.status ===
        "Active"
    ).length;

  const assigned =
    customers.filter(
      (customer) =>
        customer.assignedTo
    ).length;

  const unassigned =
    total - assigned;

  return (
    <div className="min-h-full bg-slate-50 p-1">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Users size={21} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Customers
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Manage customer information and staff assignments.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
        >
          <Plus size={17} />
          Add Customer
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary
          label="Total Customers"
          value={total}
          icon={Users}
        />

        <Summary
          label="Active Customers"
          value={active}
          icon={
            CheckCircle2
          }
        />

        <Summary
          label="Assigned Customers"
          value={assigned}
          icon={UserCheck}
        />

        <Summary
          label="Unassigned Customers"
          value={unassigned}
          icon={UserX}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search name, company, phone, email or city..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <select
            value={
              assignedFilter
            }
            onChange={(
              event
            ) =>
              setAssignedFilter(
                event.target
                  .value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          >
            <option value="All">
              All Employees
            </option>

            <option value="Unassigned">
              Unassigned
            </option>

            {staff.map(
              (person) => (
                <option
                  key={
                    person._id ||
                    person.id
                  }
                  value={
                    person._id ||
                    person.id
                  }
                >
                  {
                    person.name
                  }
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading customers...
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="p-12 text-center">
            <UserRound className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No customers found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Add your first customer or change the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Company
                  </th>

                  <th className="px-5 py-4">
                    WhatsApp
                  </th>

                  <th className="px-5 py-4">
                    Location
                  </th>

                  <th className="px-5 py-4">
                    Assigned To
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map(
                  (
                    customer
                  ) => (
                    <tr
                      key={
                        customer.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {
                            customer.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {customer.email ||
                            "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {customer.companyName ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {
                          customer.phone
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {[
                          customer.city,
                          customer.state,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ", "
                          ) ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        {customer
                          .assignedTo
                          ?.name ? (
                          <>
                            <p className="text-sm font-medium text-slate-700">
                              {
                                customer
                                  .assignedTo
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                customer
                                  .assignedTo
                                  .role
                              }
                              {customer
                                .assignedTo
                                .department
                                ? ` • ${customer.assignedTo.department}`
                                : ""}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            toggleStatus(
                              customer
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.status ===
                            "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {
                            customer.status
                          }
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            title="View"
                            onClick={() =>
                              setSelected(
                                customer
                              )
                            }
                            icon={Eye}
                          />

                          <ActionButton
                            title="Edit"
                            onClick={() => {
                              setEditing(
                                customer
                              );

                              setShowForm(
                                true
                              );
                            }}
                            icon={
                              Pencil
                            }
                          />

                          <ActionButton
                            title="Delete"
                            onClick={() =>
                              setDeleteTarget(
                                customer
                              )
                            }
                            icon={
                              Trash2
                            }
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={
            editing
          }
          staff={staff}
          saving={saving}
          onClose={() => {
            if (saving) {
              return;
            }

            setShowForm(
              false
            );

            setEditing(null);
          }}
          onSave={
            handleSave
          }
        />
      )}

      {selected && (
        <CustomerDetails
          customer={
            selected
          }
          onClose={() =>
            setSelected(
              null
            )
          }
          onEdit={(
            customer
          ) => {
            setSelected(
              null
            );

            setEditing(
              customer
            );

            setShowForm(
              true
            );
          }}
          onDelete={(
            customer
          ) =>
            setDeleteTarget(
              customer
            )
          }
        />
      )}

      {deleteTarget && (
        <DeleteCustomerModal
          customer={
            deleteTarget
          }
          deleting={
            deleting
          }
          onCancel={() =>
            !deleting &&
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  onClick,
  danger = false,
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}