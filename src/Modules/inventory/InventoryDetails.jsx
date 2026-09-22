import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardPenLine,
  Clock3,
  MapPin,
  Package,
  User,
  X,
} from "lucide-react";

import StockStatus from "./StockStatus";

export default function InventoryDetails({
  open,
  inventory,
  movements = [],
  getStatus,
  onClose,
}) {
  if (
    !open ||
    !inventory
  ) {
    return null;
  }

  const status =
    getStatus(
      inventory
    );

  const conversion =
    inventory.conversions?.[0];

  const equivalent =
    inventory.conversionEnabled &&
    conversion
      ? inventory.available *
        Number(
          conversion.factor
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Inventory
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {
                inventory.name
              }
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {
                    inventory.name
                  }
                </p>

                <p className="mt-1 font-mono text-xs text-slate-400">
                  {
                    inventory.sku
                  }
                </p>
              </div>

              <StockStatus
                status={
                  status
                }
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Card
              label="Available Stock"
              value={`${inventory.available} ${inventory.unit}`}
            />

            <Card
              label="Reserved"
              value={`${inventory.reserved} ${inventory.unit}`}
            />

            <Card
              label="Minimum Level"
              value={`${inventory.minimumStockLevel} ${inventory.unit}`}
            />

            <Card
              label="Convertible Stock"
              value={
                equivalent !==
                null
                  ? `${equivalent.toLocaleString()} ${conversion.unit}`
                  : "Not enabled"
              }
            />
          </div>

          <Section title="Product & Responsibility">
            <Info
              icon={Package}
              label="Category"
              value={
                inventory.category
              }
            />

            <Info
              icon={Boxes}
              label="Frame Size"
              value={
                inventory.size ||
                "—"
              }
            />

            <Info
              icon={MapPin}
              label="Location"
              value={
                inventory.location
              }
            />

            <Info
              icon={User}
              label="Responsible"
              value={
                inventory.assignedTo
                  ?.name ||
                "Not assigned"
              }
            />
          </Section>

          <Section title="Recent Stock Movements">
            {movements.length ===
            0 ? (
              <p className="py-5 text-center text-sm text-slate-400">
                No stock movements yet.
              </p>
            ) : (
              <div className="space-y-2">
                {movements.map(
                  (
                    movement
                  ) => (
                    <div
                      key={
                        movement._id
                      }
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          movement.type ===
                          "IN"
                            ? "bg-emerald-50 text-emerald-600"
                            : movement.type ===
                              "OUT"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {movement.type ===
                        "IN" ? (
                          <ArrowDownToLine className="h-4 w-4" />
                        ) : movement.type ===
                          "OUT" ? (
                          <ArrowUpFromLine className="h-4 w-4" />
                        ) : (
                          <ClipboardPenLine className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <p className="text-sm font-medium text-slate-700">
                            {
                              movement.source
                            }
                          </p>

                          <span className="text-sm font-semibold text-slate-900">
                            {movement.type ===
                            "OUT"
                              ? "-"
                              : movement.type ===
                                "IN"
                              ? "+"
                              : ""}
                            {
                              movement.quantity
                            }{" "}
                            {
                              movement.unit
                            }
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {movement.reason ||
                            "Stock movement"}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock3 className="h-3 w-3" />

                          {new Date(
                            movement.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={
              onClose
            }
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <div className="rounded-2xl border border-slate-200 p-4">
        {children}
      </div>
    </section>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />

        <span className="text-sm text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-right text-sm font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}