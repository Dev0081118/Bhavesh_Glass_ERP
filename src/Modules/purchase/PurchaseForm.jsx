import {
  useMemo,
  useState,
} from "react";

import {
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import SearchCreateCombobox from "../../components/SearchCreateCombobox";
import QuickSupplierModal from "./QuickSupplierModal";

const statuses = [
  "Draft",
  "Pending",
  "Ordered",
  "Partially Received",
  "Received",
  "Cancelled",
];

const paymentStatuses = [
  "Pending",
  "Partially Paid",
  "Paid",
];

const createItem =
  () => ({
    productId:
      "",

    quantity:
      1,

    unit:
      "",

    rate:
      0,

    receivedQuantity:
      0,

    notes:
      "",
  });

const dateInput =
  (value) =>
    value
      ? String(
          value
        ).slice(
          0,
          10
        )
      : "";

export default function PurchaseForm({
  purchase,

  products = [],

  suppliers = [],

  staff = [],

  loading = false,

  onCreateSupplier,

  onClose,

  onSave,
}) {
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    supplierModal,
    setSupplierModal,
  ] = useState(false);

  const [
    supplierSeedName,
    setSupplierSeedName,
  ] = useState("");

  const [
    supplierSaving,
    setSupplierSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    supplierId:
      purchase?.supplierId ||
      purchase?.supplier
        ?._id ||
      "",

    supplierInvoiceNumber:
      purchase
        ?.supplierInvoiceNumber ||
      "",

    assignedToId:
      purchase
        ?.assignedToId ||
      purchase?.assignedTo
        ?._id ||
      "",

    purchaseDate:
      dateInput(
        purchase
          ?.purchaseDate
      ) ||
      new Date()
        .toISOString()
        .slice(
          0,
          10
        ),

    expectedDeliveryDate:
      dateInput(
        purchase
          ?.expectedDeliveryDate
      ),

    actualReceiptDate:
      dateInput(
        purchase
          ?.actualReceiptDate
      ),

    status:
      purchase?.status ||
      "Draft",

    paymentStatus:
      purchase
        ?.paymentStatus ||
      "Pending",

    gst:
      purchase?.gst ??
      18,

    discount:
      purchase
        ?.discount ??
      0,

    notes:
      purchase?.notes ||
      "",

    items:
      purchase?.items
        ?.length
        ? purchase.items.map(
            (item) => ({
              productId:
                item.productId ||
                item.product
                  ?._id ||
                item.product,

              quantity:
                Number(
                  item.quantity ||
                    0
                ),

              unit:
                item.unit ||
                item.productData
                  ?.unit ||
                "",

              rate:
                Number(
                  item.rate ||
                    0
                ),

              receivedQuantity:
                Number(
                  item.receivedQuantity ||
                    0
                ),

              notes:
                item.notes ||
                "",
            })
          )
        : [
            createItem(),
          ],
  });

  const setField =
    (
      field,
      value
    ) =>
      setForm(
        (current) => ({
          ...current,

          [field]:
            value,
        })
      );

  const updateItem =
    (
      index,
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          items:
            current.items.map(
              (
                item,
                itemIndex
              ) => {
                if (
                  itemIndex !==
                  index
                ) {
                  return item;
                }

                if (
                  field ===
                  "productId"
                ) {
                  const product =
                    products.find(
                      (entry) =>
                        String(
                          entry.id ||
                            entry._id
                        ) ===
                        String(
                          value
                        )
                    );

                  return {
                    ...item,

                    productId:
                      value,

                    unit:
                      product
                        ?.unit ||
                      "",

                    rate:
                      Number(
                        product
                          ?.purchasePrice ||
                          0
                      ),
                  };
                }

                return {
                  ...item,

                  [field]:
                    value,
                };
              }
            ),
        })
      );
    };

  const totals =
    useMemo(
      () => {
        const subtotal =
          form.items.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity ||
                  0
              ) *
                Number(
                  item.rate ||
                    0
                ),
            0
          );

        const discount =
          Math.min(
            Math.max(
              Number(
                form.discount ||
                  0
              ),
              0
            ),
            subtotal
          );

        const taxable =
          Math.max(
            subtotal -
              discount,
            0
          );

        const tax =
          taxable *
          (
            Number(
              form.gst ||
                0
            ) /
            100
          );

        return {
          subtotal,
          discount,
          taxable,
          tax,

          total:
            taxable +
            tax,
        };
      },
      [
        form,
      ]
    );

  const submit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");

      if (
        !form.supplierId
      ) {
        setError(
          "Please select or create a supplier."
        );

        return;
      }

      const validItems =
        form.items.filter(
          (item) =>
            item.productId
        );

      if (
        validItems.length ===
        0
      ) {
        setError(
          "Add at least one product."
        );

        return;
      }

      const ids =
        validItems.map(
          (item) =>
            String(
              item.productId
            )
        );

      if (
        new Set(
          ids
        ).size !==
        ids.length
      ) {
        setError(
          "The same product cannot be added twice."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        await onSave({
          ...form,

          supplierId:
            form.supplierId,

          assignedToId:
            form.assignedToId ||
            null,

          gst:
            Number(
              form.gst ||
                0
            ),

          discount:
            Number(
              form.discount ||
                0
            ),

          items:
            validItems.map(
              (item) => ({
                productId:
                  item.productId,

                quantity:
                  Number(
                    item.quantity ||
                      0
                  ),

                unit:
                  item.unit,

                rate:
                  Number(
                    item.rate ||
                      0
                  ),

                receivedQuantity:
                  Number(
                    item.receivedQuantity ||
                      0
                  ),

                notes:
                  item.notes ||
                  "",
              })
            ),
        });
      } catch (
        saveError
      ) {
        setError(
          saveError.message
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
        <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShoppingCart
                  size={18}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {purchase
                    ? "Edit Purchase"
                    : "New Purchase"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Purchase products from suppliers and receive them into inventory.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            >
              <X
                size={19}
              />
            </button>
          </div>

          <form
            onSubmit={
              submit
            }
            className="flex-1 overflow-y-auto"
          >
            <div className="space-y-8 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Purchase Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Supplier *">
                    <SearchCreateCombobox
                      value={
                        form.supplierId
                      }

                      items={
                        suppliers
                      }

                      placeholder="Type supplier name..."

                      emptyText="No supplier found."

                      createLabel="Create supplier"

                      onChange={(
                        id
                      ) =>
                        setField(
                          "supplierId",
                          id
                        )
                      }

                      onCreate={(
                        name
                      ) => {
                        setSupplierSeedName(
                          name
                        );

                        setSupplierModal(
                          true
                        );
                      }}

                      renderSecondary={(
                        supplier
                      ) => (
                        <>
                          {supplier.phone ||
                            "No phone"}
                          {supplier.gstNumber
                            ? ` • GST: ${supplier.gstNumber}`
                            : ""}
                        </>
                      )}
                    />
                  </Field>

                  <Field label="Responsible Person">
                    <select
                      value={
                        form.assignedToId
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "assignedToId",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="">
                        Not assigned
                      </option>

                      {staff.map(
                        (person) => (
                          <option
                            key={
                              person.id ||
                              person._id
                            }
                            value={
                              person.id ||
                              person._id
                            }
                          >
                            {person.name}
                            {" — "}
                            {person.role}
                            {person.department
                              ? ` • ${person.department}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </Field>

                  <Field label="Supplier Invoice">
                    <input
                      value={
                        form.supplierInvoiceNumber
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "supplierInvoiceNumber",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Status">
                    <select
                      value={
                        form.status
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "status",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {statuses.map(
                        (status) => (
                          <option
                            key={
                              status
                            }
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </Field>

                  <Field label="Purchase Date">
                    <input
                      type="date"
                      required
                      value={
                        form.purchaseDate
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "purchaseDate",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Expected Delivery">
                    <input
                      type="date"
                      value={
                        form.expectedDeliveryDate
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "expectedDeliveryDate",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Actual Receipt">
                    <input
                      type="date"
                      value={
                        form.actualReceiptDate
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "actualReceiptDate",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Payment Status">
                    <select
                      value={
                        form.paymentStatus
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "paymentStatus",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {paymentStatuses.map(
                        (status) => (
                          <option
                            key={
                              status
                            }
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Products
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Received quantity is the quantity that affects inventory.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setForm(
                        (current) => ({
                          ...current,

                          items: [
                            ...current.items,
                            createItem(),
                          ],
                        })
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  >
                    <Plus
                      size={15}
                    />
                    Add Product
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[950px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <Th>
                          Product
                        </Th>

                        <Th>
                          Current Stock
                        </Th>

                        <Th>
                          Quantity
                        </Th>

                        <Th>
                          Rate
                        </Th>

                        <Th>
                          Received
                        </Th>

                        <Th>
                          Pending
                        </Th>

                        <Th />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {form.items.map(
                        (
                          item,
                          index
                        ) => {
                          const product =
                            products.find(
                              (entry) =>
                                String(
                                  entry.id ||
                                    entry._id
                                ) ===
                                String(
                                  item.productId
                                )
                            );

                          const pending =
                            Math.max(
                              Number(
                                item.quantity ||
                                  0
                              ) -
                                Number(
                                  item.receivedQuantity ||
                                    0
                                ),
                              0
                            );

                          return (
                            <tr
                              key={
                                index
                              }
                            >
                              <td className="min-w-[260px] px-3 py-3">
                                <select
                                  value={
                                    item.productId
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateItem(
                                      index,
                                      "productId",
                                      event.target.value
                                    )
                                  }
                                  className={
                                    inputClass
                                  }
                                >
                                  <option value="">
                                    Select product
                                  </option>

                                  {products.map(
                                    (entry) => (
                                      <option
                                        key={
                                          entry.id ||
                                          entry._id
                                        }
                                        value={
                                          entry.id ||
                                          entry._id
                                        }
                                      >
                                        {entry.name} ({entry.sku})
                                      </option>
                                    )
                                  )}
                                </select>

                                {product && (
                                  <p className="mt-1 text-[10px] text-slate-400">
                                    {product.type}
                                    {" • "}
                                    {product.unit}

                                    {product.assignedTo
                                      ?.name
                                      ? ` • Owner: ${product.assignedTo.name}`
                                      : ""}
                                  </p>
                                )}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-600">
                                {Number(
                                  product?.availableQuantity ??
                                    product?.available ??
                                    0
                                ).toLocaleString()}
                                {" "}
                                {product?.stockUnit ||
                                  product?.unit ||
                                  ""}
                              </td>

                              <td className="px-3 py-3">
                                <NumberInput
                                  value={
                                    item.quantity
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateItem(
                                      index,
                                      "quantity",
                                      value
                                    )
                                  }
                                />
                              </td>

                              <td className="px-3 py-3">
                                <NumberInput
                                  value={
                                    item.rate
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateItem(
                                      index,
                                      "rate",
                                      value
                                    )
                                  }
                                />
                              </td>

                              <td className="px-3 py-3">
                                <NumberInput
                                  value={
                                    item.receivedQuantity
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateItem(
                                      index,
                                      "receivedQuantity",
                                      value
                                    )
                                  }
                                />
                              </td>

                              <td className="px-3 py-3 text-sm font-medium text-slate-700">
                                {pending}
                              </td>

                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  disabled={
                                    form.items.length ===
                                    1
                                  }
                                  onClick={() =>
                                    setForm(
                                      (current) => ({
                                        ...current,

                                        items:
                                          current.items.filter(
                                            (
                                              _,
                                              itemIndex
                                            ) =>
                                              itemIndex !==
                                              index
                                          ),
                                      })
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Field label="Notes">
                  <textarea
                    rows={5}
                    value={
                      form.notes
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "notes",
                        event.target.value
                      )
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none"
                  />
                </Field>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="GST %">
                      <NumberInput
                        value={
                          form.gst
                        }
                        onChange={(
                          value
                        ) =>
                          setField(
                            "gst",
                            value
                          )
                        }
                      />
                    </Field>

                    <Field label="Discount">
                      <NumberInput
                        value={
                          form.discount
                        }
                        onChange={(
                          value
                        ) =>
                          setField(
                            "discount",
                            value
                          )
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    <Total
                      label="Subtotal"
                      value={
                        totals.subtotal
                      }
                    />

                    <Total
                      label="Discount"
                      value={
                        -totals.discount
                      }
                    />

                    <Total
                      label="Tax"
                      value={
                        totals.tax
                      }
                    />

                    <div className="border-t border-slate-200 pt-3">
                      <Total
                        strong
                        label="Grand Total"
                        value={
                          totals.total
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  submitting
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loading
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : purchase
                    ? "Update Purchase"
                    : "Create Purchase"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {supplierModal && (
        <QuickSupplierModal
          initialName={
            supplierSeedName
          }

          saving={
            supplierSaving
          }

          onClose={() => {
            setSupplierModal(
              false
            );

            setSupplierSeedName(
              ""
            );
          }}

          onSave={async (
            payload
          ) => {
            try {
              setSupplierSaving(
                true
              );

              const supplier =
                await onCreateSupplier(
                  payload
                );

              setField(
                "supplierId",
                supplier.id ||
                  supplier._id
              );

              setSupplierModal(
                false
              );

              setSupplierSeedName(
                ""
              );
            } finally {
              setSupplierSaving(
                false
              );
            }
          }}
        />
      )}
    </>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}

function Th({
  children,
}) {
  return (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}

function NumberInput({
  value,
  onChange,
}) {
  return (
    <input
      type="number"
      min="0"
      step="0.01"
      value={
        value
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
    />
  );
}

function Total({
  label,
  value,
  strong,
}) {
  return (
    <div className="flex justify-between">
      <span
        className={
          strong
            ? "font-semibold text-slate-900"
            : "text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-slate-900"
            : "font-medium text-slate-800"
        }
      >
        {new Intl.NumberFormat(
          "en-IN",
          {
            style:
              "currency",

            currency:
              "INR",
          }
        ).format(
          Number(
            value ||
              0
          )
        )}
      </span>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-400";