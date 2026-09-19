import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  lrDate: new Date().toISOString().split("T")[0],

  dispatchId: "",
  saleBillId: "",

  customerId: "",
  customerName: "",
  customerPhone: "",

  fromLocation: "Bhavesh Glass - Rajkot",
  toLocation: "",

  transporter: "",
  vehicleNumber: "",

  driverName: "",
  driverPhone: "",

  packageCount: "",
  weight: "",

  freightAmount: "",
  freightPaymentStatus: "Pending",

  expectedDeliveryDate: "",
  actualDeliveryDate: "",

  status: "Draft",

  notes: "",
};

const customers = [
  {
    id: "CUS-001",
    name: "Rajkot Photo House",
    phone: "+91 98765 43210",
  },
  {
    id: "CUS-002",
    name: "Shreeji Frames",
    phone: "+91 98765 67890",
  },
  {
    id: "CUS-003",
    name: "Royal Photo Studio",
    phone: "+91 98765 11223",
  },
  {
    id: "CUS-004",
    name: "Krishna Photo Studio",
    phone: "+91 98251 45678",
  },
  {
    id: "CUS-005",
    name: "Modern Frame House",
    phone: "+91 99041 22334",
  },
];

function LRForm({
  lr,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lr) {
      setForm({
        lrDate: lr.lrDate || "",

        dispatchId: lr.dispatchId || "",
        saleBillId: lr.saleBillId || "",

        customerId: lr.customerId || "",
        customerName: lr.customerName || "",
        customerPhone: lr.customerPhone || "",

        fromLocation: lr.fromLocation || "",
        toLocation: lr.toLocation || "",

        transporter: lr.transporter || "",
        vehicleNumber: lr.vehicleNumber || "",

        driverName: lr.driverName || "",
        driverPhone: lr.driverPhone || "",

        packageCount: lr.packageCount || "",
        weight: lr.weight || "",

        freightAmount: lr.freightAmount || "",
        freightPaymentStatus:
          lr.freightPaymentStatus || "Pending",

        expectedDeliveryDate:
          lr.expectedDeliveryDate || "",
        actualDeliveryDate:
          lr.actualDeliveryDate || "",

        status: lr.status || "Draft",

        notes: lr.notes || "",
      });
    } else {
      setForm({
        ...initialForm,
        lrDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [lr]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(
      (item) => item.id === customerId
    );

    setForm((current) => ({
      ...current,
      customerId,
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
    }));

    setErrors((current) => ({
      ...current,
      customerId: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.lrDate) {
      nextErrors.lrDate = "LR date is required.";
    }

    if (!form.dispatchId.trim()) {
      nextErrors.dispatchId = "Dispatch ID is required.";
    }

    if (!form.saleBillId.trim()) {
      nextErrors.saleBillId = "Sale Bill ID is required.";
    }

    if (!form.customerId) {
      nextErrors.customerId = "Customer is required.";
    }

    if (!form.toLocation.trim()) {
      nextErrors.toLocation =
        "Destination is required.";
    }

    if (!form.transporter.trim()) {
      nextErrors.transporter =
        "Transporter is required.";
    }

    if (!form.vehicleNumber.trim()) {
      nextErrors.vehicleNumber =
        "Vehicle number is required.";
    }

    if (!form.driverName.trim()) {
      nextErrors.driverName =
        "Driver name is required.";
    }

    if (!form.packageCount || Number(form.packageCount) <= 0) {
      nextErrors.packageCount =
        "Package count must be greater than 0.";
    }

    if (!form.weight || Number(form.weight) <= 0) {
      nextErrors.weight =
        "Weight must be greater than 0.";
    }

    if (
      form.freightAmount === "" ||
      Number(form.freightAmount) < 0
    ) {
      nextErrors.freightAmount =
        "Enter a valid freight amount.";
    }

    if (!form.expectedDeliveryDate) {
      nextErrors.expectedDeliveryDate =
        "Expected delivery date is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    onSave({
      ...form,
      packageCount: Number(form.packageCount),
      weight: Number(form.weight),
      freightAmount: Number(form.freightAmount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {lr ? "Edit Lorry Receipt" : "Create Lorry Receipt"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Add transportation and delivery details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5"
        >
          <div className="space-y-7">
            {/* Basic Information */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                LR Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    LR Date *
                  </label>

                  <input
                    type="date"
                    value={form.lrDate}
                    onChange={(e) =>
                      updateField("lrDate", e.target.value)
                    }
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.lrDate
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.lrDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.lrDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Dispatch ID *
                  </label>

                  <input
                    type="text"
                    value={form.dispatchId}
                    onChange={(e) =>
                      updateField(
                        "dispatchId",
                        e.target.value
                      )
                    }
                    placeholder="DSP-001"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.dispatchId
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.dispatchId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.dispatchId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Sale Bill ID *
                  </label>

                  <input
                    type="text"
                    value={form.saleBillId}
                    onChange={(e) =>
                      updateField(
                        "saleBillId",
                        e.target.value
                      )
                    }
                    placeholder="SB-001"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.saleBillId
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.saleBillId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.saleBillId}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Customer */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Customer & Route
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Customer *
                  </label>

                  <select
                    value={form.customerId}
                    onChange={(e) =>
                      handleCustomerChange(e.target.value)
                    }
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.customerId
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name} ({customer.id})
                      </option>
                    ))}
                  </select>

                  {errors.customerId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.customerId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Customer Phone
                  </label>

                  <input
                    type="text"
                    value={form.customerPhone}
                    readOnly
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    From Location *
                  </label>

                  <input
                    type="text"
                    value={form.fromLocation}
                    onChange={(e) =>
                      updateField(
                        "fromLocation",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    To Location *
                  </label>

                  <input
                    type="text"
                    value={form.toLocation}
                    onChange={(e) =>
                      updateField(
                        "toLocation",
                        e.target.value
                      )
                    }
                    placeholder="Customer delivery address"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.toLocation
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.toLocation && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.toLocation}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Transport */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Transport Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Transporter *
                  </label>

                  <input
                    type="text"
                    value={form.transporter}
                    onChange={(e) =>
                      updateField(
                        "transporter",
                        e.target.value
                      )
                    }
                    placeholder="Transport company"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.transporter
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.transporter && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.transporter}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Vehicle Number *
                  </label>

                  <input
                    type="text"
                    value={form.vehicleNumber}
                    onChange={(e) =>
                      updateField(
                        "vehicleNumber",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="GJ03AB1234"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm uppercase outline-none ${
                      errors.vehicleNumber
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.vehicleNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.vehicleNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Driver Name *
                  </label>

                  <input
                    type="text"
                    value={form.driverName}
                    onChange={(e) =>
                      updateField(
                        "driverName",
                        e.target.value
                      )
                    }
                    placeholder="Driver name"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.driverName
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.driverName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.driverName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Driver Phone
                  </label>

                  <input
                    type="tel"
                    value={form.driverPhone}
                    onChange={(e) =>
                      updateField(
                        "driverPhone",
                        e.target.value
                      )
                    }
                    placeholder="+91..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* Shipment */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Shipment Details
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Package Count *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.packageCount}
                    onChange={(e) =>
                      updateField(
                        "packageCount",
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.packageCount
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.packageCount && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.packageCount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Weight (kg) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) =>
                      updateField(
                        "weight",
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.weight
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.weight && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.weight}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Freight Amount *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.freightAmount}
                    onChange={(e) =>
                      updateField(
                        "freightAmount",
                        e.target.value
                      )
                    }
                    placeholder="₹0"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.freightAmount
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.freightAmount && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.freightAmount}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Delivery & Status
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Expected Delivery *
                  </label>

                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    onChange={(e) =>
                      updateField(
                        "expectedDeliveryDate",
                        e.target.value
                      )
                    }
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.expectedDeliveryDate
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.expectedDeliveryDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.expectedDeliveryDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Actual Delivery
                  </label>

                  <input
                    type="date"
                    value={form.actualDeliveryDate}
                    onChange={(e) =>
                      updateField(
                        "actualDeliveryDate",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    LR Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Booked">Booked</option>
                    <option value="Ready">Ready</option>
                    <option value="In Transit">
                      In Transit
                    </option>
                    <option value="Delivered">
                      Delivered
                    </option>
                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Freight Status
                  </label>

                  <select
                    value={form.freightPaymentStatus}
                    onChange={(e) =>
                      updateField(
                        "freightPaymentStatus",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Notes
              </label>

              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) =>
                  updateField("notes", e.target.value)
                }
                placeholder="Add transportation or delivery notes..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </section>
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {lr ? "Update LR" : "Create LR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LRForm;