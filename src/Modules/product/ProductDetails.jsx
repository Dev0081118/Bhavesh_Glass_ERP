import {
  X,
  Pencil,
  Trash2,
  Package,
  MapPin,
  Tag,
} from "lucide-react";
import ProductStatus from "./ProductStatus";

export default function ProductDetails({
  product,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs text-slate-400">
              Product Details
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {product.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Package size={28} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {product.name}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {product.sku} · {product.id}
              </p>

              <div className="mt-2">
                <ProductStatus status={product.status} />
              </div>
            </div>
          </div>

          <Section title="Product Information">
            <Info label="Category" value={product.category} />
            <Info label="Sub Category" value={product.subCategory} />
            <Info label="Product Type" value={product.type} />
            <Info label="Size" value={product.size} />
            <Info label="Material" value={product.material} />
            <Info label="Unit" value={product.unit} />
            <Info label="HSN Code" value={product.hsnCode} />
          </Section>

          <Section title="Pricing">
            <Info
              label="Purchase Price"
              value={`₹${product.purchasePrice.toLocaleString("en-IN")}`}
            />

            <Info
              label="Selling Price"
              value={`₹${product.sellingPrice.toLocaleString("en-IN")}`}
            />

            <Info
              label="Wholesale Price"
              value={`₹${product.wholesalePrice.toLocaleString("en-IN")}`}
            />

            <Info label="GST" value={`${product.gst}%`} />
          </Section>

          <Section title="Inventory">
            <Info
              label="Current Stock"
              value={`${product.stock} ${product.unit}`}
            />

            <Info
              label="Reorder Level"
              value={`${product.reorderLevel} ${product.unit}`}
            />

            <Info
              label="Location"
              value={product.location}
            />
          </Section>

          {product.description && (
            <Section title="Description">
              <p className="text-sm leading-6 text-slate-500">
                {product.description}
              </p>
            </Section>
          )}
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Pencil size={16} />
              Edit Product
            </button>

            <button
              onClick={() => onDelete(product)}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-7">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}