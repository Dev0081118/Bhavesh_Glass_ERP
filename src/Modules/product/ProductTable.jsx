import {
  PackageOpen,
} from "lucide-react";

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
        <h2 className="text-sm font-semibold text-slate-900">
          Product Master
        </h2>

        <p className="mt-0.5 text-xs text-slate-400">
          {products.length} products found
        </p>
      </div>

      {products.length ===
      0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <PackageOpen className="h-8 w-8 text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-700">
            No products found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Type",
                  "Frame Size",
                  "Primary Unit",
                  "Conversion",
                  "Minimum Stock",
                  "Responsible",
                  "Status",
                  "Actions",
                ].map(
                  (
                    heading
                  ) => (
                    <th
                      key={
                        heading
                      }
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {
                        heading
                      }
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {products.map(
                (
                  product
                ) => (
                  <ProductRow
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    onView={
                      onView
                    }
                    onEdit={
                      onEdit
                    }
                    onDelete={
                      onDelete
                    }
                    onToggleStatus={
                      onToggleStatus
                    }
                  />
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}