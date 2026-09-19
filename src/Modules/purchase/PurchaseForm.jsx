import { useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
  X,
  ShoppingCart,
} from "lucide-react";

const statuses = [
  "Draft",
  "Pending",
  "Ordered",
  "Partially Received",
  "Received",
  "Cancelled",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PurchaseForm({
  purchase,
  products,
  suppliers,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(purchase);

  const [supplierId, setSupplierId] = useState(
    purchase?.supplierId || ""
  );

  const [purchaseDate, setPurchaseDate] = useState(
    purchase?.purchaseDate ||
      new Date().toISOString().split("T")[0]
  );

  const [status, setStatus] = useState(
    purchase?.status || "Draft"
  );

  const [gst, setGst] = useState(
    purchase?.gst !== undefined ? purchase.gst : 18
  );

  const [discount, setDiscount] = useState(
    purchase?.discount !== undefined ? purchase.discount : 0
  );

  const [notes, setNotes] = useState(
    purchase?.notes || ""
  );

  const [paymentStatus, setPaymentStatus] = useState(
    purchase?.paymentStatus || "Pending"
  );

  const [items, setItems] = useState(
    purchase?.items?.length
      ? purchase.items.map((item) => ({ ...item }))
      : [
          {
            productId: "",
            quantity: 1,
            rate: 0,
            receivedQuantity: 0,
          },
        ]
  );

  const selectedSupplier = suppliers.find(
    (supplier) => supplier.id === supplierId
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.rate || 0),
      0
    );

    const discountAmount = Math.min(
      Number(discount || 0),
      subtotal
    );

    const taxableAmount = Math.max(
      subtotal - discountAmount,
      0
    );

    const tax =
      (taxableAmount * Number(gst || 0)) / 100;

    const grandTotal = taxableAmount + tax;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      tax,
      grandTotal,
    };
  }, [items, discount, gst]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "productId") {
          const product = products.find(
            (product) => product.id === value
          );

          return {
            ...item,
            productId: value,
            rate: product?.purchasePrice || 0,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: 1,
        rate: 0,
        receivedQuantity: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!supplierId) {
      alert("Please select a supplier.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.productId &&
        Number(item.quantity) > 0 &&
        Number(item.rate) >= 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    const supplier = suppliers.find(
      (item) => item.id === supplierId
    );

    const purchaseData = {
      supplierId,
      supplierName: supplier?.name || "",
      purchaseDate,
      status,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        receivedQuantity: Math.min(
          Number(item.receivedQuantity || 0),
          Number(item.quantity)
        ),
      })),
      gst: Number(gst || 0),
      discount: Number(discount || 0),
      notes,
      paymentStatus,
    };

    onSave(purchaseData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShoppingCart size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isEditing
                  ? `Edit Purchase ${purchase.id}`
                  : "Create New Purchase"}
              </h2>

              <p className="text-xs text-slate-400">
                Add supplier, products and purchase information.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Purchase Information */}
              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Purchase Information
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Basic information about this purchase.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Supplier *
                    </label>

                    <select
                      value={supplierId}
                      onChange={(e) =>
                        setSupplierId(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    >
                      <option value="">
                        Select supplier
                      </option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Purchase Date *
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) =>
                          setPurchaseDate(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    >
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Payment Status
                    </label>

                    <select
                      value={paymentStatus}
                      onChange={(e) =>
                        setPaymentStatus(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {selectedSupplier && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                      <div>
                        <p className="text-slate-400">
                          Contact Person
                        </p>
                        <p className="mt-1 font-medium text-slate-700">
                          {selectedSupplier.contactPerson}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Phone
                        </p>
                        <p className="mt-1 font-medium text-slate-700">
                          {selectedSupplier.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Address
                        </p>
                        <p className="mt-1 font-medium text-slate-700">
                          {selectedSupplier.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Products */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Purchase Items
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Add one or more products to this purchase.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                  >
                    <Plus size={14} />
                    Add Product
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Product
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Quantity
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Rate
                          </th>

                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Received
                          </th>

                          <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Amount
                          </th>

                          <th className="w-12 px-2 py-3" />
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => {
                          const product = products.find(
                            (product) =>
                              product.id === item.productId
                          );

                          const amount =
                            Number(item.quantity || 0) *
                            Number(item.rate || 0);

                          return (
                            <tr
                              key={index}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3">
                                <select
                                  value={item.productId}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "productId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                                >
                                  <option value="">
                                    Select product
                                  </option>

                                  {products.map((product) => (
                                    <option
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name} —{" "}
                                      {product.sku}
                                    </option>
                                  ))}
                                </select>

                                {product && (
                                  <p className="mt-1 text-[10px] text-slate-400">
                                    {product.category} •{" "}
                                    {product.size} •{" "}
                                    {product.unit}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                                />
                              </td>

                              <td className="px-4 py-3">
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                    ₹
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.rate}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "rate",
                                        e.target.value
                                      )
                                    }
                                    className="w-28 rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-xs outline-none focus:border-slate-400"
                                  />
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantity}
                                  value={
                                    item.receivedQuantity
                                  }
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "receivedQuantity",
                                      e.target.value
                                    )
                                  }
                                  className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                                />
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className="text-xs font-semibold text-slate-800">
                                  {formatCurrency(amount)}
                                </span>
                              </td>

                              <td className="px-2 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(index)
                                  }
                                  disabled={items.length === 1}
                                  className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Additional Information
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Add tax, discount and notes.
                    </p>

                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            GST (%)
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={gst}
                            onChange={(e) =>
                              setGst(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Discount (₹)
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(e) =>
                              setDiscount(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                          Notes
                        </label>

                        <textarea
                          rows={4}
                          value={notes}
                          onChange={(e) =>
                            setNotes(e.target.value)
                          }
                          placeholder="Add purchase notes..."
                          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Purchase Summary
                    </h3>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-medium text-slate-800">
                          {formatCurrency(totals.subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Discount
                        </span>

                        <span className="font-medium text-red-600">
                          - {formatCurrency(totals.discountAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Taxable Amount
                        </span>

                        <span className="font-medium text-slate-800">
                          {formatCurrency(totals.taxableAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          GST ({gst}%)
                        </span>

                        <span className="font-medium text-slate-800">
                          {formatCurrency(totals.tax)}
                        </span>
                      </div>

                      <div className="my-3 border-t border-slate-200" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          Grand Total
                        </span>

                        <span className="text-xl font-bold tracking-tight text-slate-900">
                          {formatCurrency(totals.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              {isEditing
                ? "Update Purchase"
                : "Create Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}