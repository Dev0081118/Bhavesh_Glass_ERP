import {
  Calendar,
  Factory,
  Package,
  User,
  X,
} from "lucide-react";
import ProductionStatus from "./ProductionStatus";

export default function ProductionDetails({
  production,
  onClose,
  onEdit,
}) {
  const planned = Number(production.plannedQuantity || 0);
  const completed = Number(production.completedQuantity || 0);
  const wastage = Number(production.wastage || 0);

  const progress =
    planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Production Order
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {production.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Product */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                  <Package size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">
                    Finished Product
                  </p>

                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {production.productName}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {production.sku}
                  </p>
                </div>

                <ProductionStatus status={production.status} />
              </div>
            </div>

            {/* Progress */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Production Progress
              </h3>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      Completed Quantity
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {completed.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    {progress}%
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-800 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Stat
                    label="Planned"
                    value={planned}
                    unit={production.unit}
                  />

                  <Stat
                    label="Completed"
                    value={completed}
                    unit={production.unit}
                  />

                  <Stat
                    label="Wastage"
                    value={wastage}
                    unit={production.unit}
                  />
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Timeline
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoCard
                  icon={Calendar}
                  label="Start Date"
                  value={production.startDate || "—"}
                />

                <InfoCard
                  icon={Calendar}
                  label="Expected"
                  value={production.expectedDate || "—"}
                />

                <InfoCard
                  icon={Calendar}
                  label="Completed"
                  value={
                    production.actualCompletionDate || "Not completed"
                  }
                />
              </div>
            </section>

            {/* Manager / Location */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Assignment
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoCard
                  icon={User}
                  label="Production Manager"
                  value={production.managerName || "—"}
                />

                <InfoCard
                  icon={Factory}
                  label="Production Location"
                  value={production.location || "—"}
                />
              </div>
            </section>

            {/* Materials */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Raw Material Consumption
                </h3>

                <span className="text-xs text-slate-400">
                  {production.rawMaterials?.length || 0} materials
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Material
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Required
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Consumed
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {(production.rawMaterials || []).map(
                      (material) => (
                        <tr key={material.id}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800">
                              {material.name || "Unknown"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {material.unit}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-right text-sm text-slate-600">
                            {Number(
                              material.requiredQuantity || 0
                            ).toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-right text-sm font-medium text-slate-800">
                            {Number(
                              material.consumedQuantity || 0
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Notes */}
            {production.notes && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Notes
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-6 text-slate-600">
                  {production.notes}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit Production
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {Number(value).toLocaleString()}
        <span className="ml-1 text-[10px] font-normal text-slate-400">
          {unit}
        </span>
      </p>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <span className="text-[11px]">{label}</span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}