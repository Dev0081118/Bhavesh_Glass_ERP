import {
  Download,
  FileText,
  Image,
  Package,
  Pencil,
  Trash2,
  Video,
  X,
} from "lucide-react";

import ProductStatus from "./ProductStatus";

export default function ProductDetails({
  product,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!product) return null;

  const conversion =
    product.conversions?.[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Product Master
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {product.name}
            </h2>
          </div>

          <button
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
              <Package className="h-6 w-6 text-slate-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                {
                  product.name
                }
              </h3>

              <p className="mt-1 font-mono text-xs text-slate-400">
                {product.sku}
              </p>

              <div className="mt-2">
                <ProductStatus
                  status={
                    product.status
                  }
                />
              </div>
            </div>
          </div>

          <Section title="Product Information">
            <Info
              label="Category"
              value={
                product.category
              }
            />

            <Info
              label="Sub Category"
              value={
                product.subCategory
              }
            />

            <Info
              label="Type"
              value={
                product.type
              }
            />

            <Info
              label="Material"
              value={
                product.material
              }
            />

            <Info
              label="Primary Unit"
              value={
                product.unit
              }
            />
          </Section>

          <Section title="Unit Conversion">
            <Info
              label="Conversion"
              value={
                product.conversionEnabled &&
                conversion
                  ? `1 ${product.unit} = ${conversion.factor} ${conversion.unit}`
                  : "Not enabled"
              }
            />

            {conversion?.description && (
              <Info
                label="Note"
                value={
                  conversion.description
                }
              />
            )}
          </Section>

          <Section title="Specification">
            <Info
              label="Frame Product"
              value={
                product.isFrame
                  ? "Yes"
                  : "No"
              }
            />

            {product.isFrame && (
              <Info
                label="Frame Size"
                value={`${product.frameSize?.width || "—"} × ${product.frameSize?.height || "—"} ${product.frameSize?.unit || ""}`}
              />
            )}

            <Info
              label="Dimensions"
              value={
                product.dimensions
                  ?.length ||
                product.dimensions
                  ?.width ||
                product.dimensions
                  ?.height
                  ? `${product.dimensions?.length || 0} × ${product.dimensions?.width || 0} × ${product.dimensions?.height || 0} ${product.dimensions?.unit || ""}`
                  : "—"
              }
            />

            <Info
              label="Weight"
              value={
                product.weight
                  ?.value
                  ? `${product.weight.value} ${product.weight.unit}`
                  : "—"
              }
            />
          </Section>

          <Section title="Inventory Settings">
            <Info
              label="Minimum Stock Level"
              value={`${product.minimumStockLevel || 0} ${product.unit}`}
            />

            <Info
              label="Location"
              value={
                product.location
              }
            />

            <Info
              label="Responsible Person"
              value={
                product.assignedTo
                  ?.name ||
                "Not assigned"
              }
            />
          </Section>

          <Section title="Pricing">
            <Info
              label="Purchase Price"
              value={`₹${Number(product.purchasePrice || 0).toLocaleString("en-IN")}`}
            />

            <Info
              label="Selling Price"
              value={`₹${Number(product.sellingPrice || 0).toLocaleString("en-IN")}`}
            />

            <Info
              label="Wholesale Price"
              value={`₹${Number(product.wholesalePrice || 0).toLocaleString("en-IN")}`}
            />

            <Info
              label="GST"
              value={`${product.gst || 0}%`}
            />

            <Info
              label="HSN"
              value={
                product.hsnCode
              }
            />
          </Section>

          {product.media?.length >
            0 && (
            <Section title="Media & Documents">
              <div className="space-y-2">
                {product.media.map(
                  (
                    media,
                    index
                  ) => (
                    <a
                      key={`${media.fileName}-${index}`}
                      href={
                        media.dataUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50"
                    >
                      {media.type ===
                      "image" ? (
                        <Image className="h-5 w-5 text-slate-500" />
                      ) : media.type ===
                        "video" ? (
                        <Video className="h-5 w-5 text-slate-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-slate-500" />
                      )}

                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                        {
                          media.fileName
                        }
                      </span>

                      <Download className="h-4 w-4 text-slate-400" />
                    </a>
                  )
                )}
              </div>
            </Section>
          )}

          {product.description && (
            <Section title="Description">
              <p className="text-sm leading-6 text-slate-600">
                {
                  product.description
                }
              </p>
            </Section>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button
            onClick={() =>
              onEdit(
                product
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            onClick={() =>
              onDelete(
                product
              )
            }
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <section className="mt-7">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
        {children}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}