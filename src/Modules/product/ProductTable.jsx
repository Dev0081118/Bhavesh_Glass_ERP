import { PackageOpen } from "lucide-react";
import ProductRow from "./ProductRow";

export default function ProductTable({
  products,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Product List
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {products.length} products found
            </p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <PackageOpen size={22} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            No products found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Type
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Size
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Selling Price
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Stock
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}