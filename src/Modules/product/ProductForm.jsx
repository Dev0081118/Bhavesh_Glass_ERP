import { useEffect, useState } from "react";
import { X, Package, Save } from "lucide-react";

const defaultForm = {
  name: "",
  sku: "",
  category: "Photo Frame",
  subCategory: "",
  type: "Finished Product",
  size: "",
  material: "",
  unit: "Piece",
  purchasePrice: "",
  sellingPrice: "",
  wholesalePrice: "",
  gst: "18",
  hsnCode: "",
  stock: "",
  reorderLevel: "",
  location: "",
  description: "",
  status: "Active",
};

export default function ProductForm({
  product,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (product) {
      setForm({
        ...defaultForm,
        ...product,
      });
    } else {
      setForm(defaultForm);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.sku.trim()) {
      return;
    }

    onSave({
      ...form,
      purchasePrice: Number(form.purchasePrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      wholesalePrice: Number(form.wholesalePrice) || 0,
      gst: Number(form.gst) || 0,
      stock: Number(form.stock) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Package size={17} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {product ? "Edit Product" : "Add Product"}
              </h2>

              <p className="text-xs text-slate-400">
                {product
                  ? "Update product information"
                  : "Create a new product master"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          <div className="space-y-6">

            {/* Basic Information */}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Product Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="SKU"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                />

                <SelectField
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  options={[
                    "Photo Frame",
                    "MDF Frame",
                    "Designer Frame",
                    "Raw Material",
                    "Accessories",
                    "Printing Material",
                    "Packaging Material",
                    "Machine",
                  ]}
                />

                <Field
                  label="Sub Category"
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                />

                <SelectField
                  label="Product Type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  options={[
                    "Finished Product",
                    "Raw Material",
                    "Accessory",
                    "Printing Material",
                    "Packaging Material",
                    "Machine",
                  ]}
                />

                <Field
                  label="Size"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Product Details */}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Product Details
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field
                  label="Material"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                />

                <SelectField
                  label="Unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  options={[
                    "Piece",
                    "Sheet",
                    "Pack",
                    "Box",
                    "Kg",
                    "Meter",
                  ]}
                />

                <Field
                  label="HSN Code"
                  name="hsnCode"
                  value={form.hsnCode}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="Product description..."
                />
              </div>
            </section>

            {/* Pricing */}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Pricing
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Field
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  prefix="₹"
                />

                <Field
                  label="Selling Price"
                  name="sellingPrice"
                  type="number"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  prefix="₹"
                />

                <Field
                  label="Wholesale Price"
                  name="wholesalePrice"
                  type="number"
                  value={form.wholesalePrice}
                  onChange={handleChange}
                  prefix="₹"
                />

                <Field
                  label="GST %"
                  name="gst"
                  type="number"
                  value={form.gst}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Inventory */}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Inventory
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field
                  label="Opening Stock"
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                />

                <Field
                  label="Reorder Level"
                  name="reorderLevel"
                  type="number"
                  value={form.reorderLevel}
                  onChange={handleChange}
                />

                <Field
                  label="Storage Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Status */}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Status
              </h3>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 md:w-64"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </section>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Save size={16} />

            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  prefix,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full rounded-xl border border-slate-200
            py-2.5 text-sm text-slate-900 outline-none
            transition focus:border-slate-400
            ${prefix ? "pl-8 pr-3" : "px-3"}
          `}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}