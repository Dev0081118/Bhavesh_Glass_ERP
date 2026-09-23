import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import PurchaseStatus from "./PurchaseStatus";

const money = (
  value
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        0,
    }
  ).format(
    Number(
      value ||
        0
    )
  );

const date = (
  value
) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
};

export default function PurchaseRow({
  purchase,

  onView,

  onEdit,

  onDelete,
}) {
  const totalOrdered =
    (
      purchase.items ||
      []
    ).reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity ||
            0
        ),
      0
    );

  const totalReceived =
    (
      purchase.items ||
      []
    ).reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.receivedQuantity ||
            0
        ),
      0
    );

  const progress =
    totalOrdered > 0
      ? Math.round(
          (
            totalReceived /
            totalOrdered
          ) *
            100
        )
      : 0;

  return (
    <tr className="hover:bg-slate-50/70">
      <td className="px-4 py-4">
        <button
          onClick={() =>
            onView(
              purchase
            )
          }
          className="text-left"
        >
          <p className="text-sm font-semibold text-slate-900">
            {purchase.purchaseNumber ||
              purchase.id}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {purchase.supplierInvoiceNumber ||
              "No supplier invoice"}
          </p>
        </button>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-medium text-slate-800">
          {purchase.supplierName ||
            "Unknown supplier"}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-700">
          {purchase.items?.length ||
            0}{" "}
          item(s)
        </p>

        <p className="mt-1 max-w-[200px] truncate text-xs text-slate-400">
          {(
            purchase.items ||
            []
          )
            .map(
              (
                item
              ) =>
                item.name
            )
            .filter(
              Boolean
            )
            .join(
              ", "
            )}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {date(
          purchase.purchaseDate
        )}
      </td>

      <td className="px-4 py-4">
        <p className="text-xs font-medium text-slate-700">
          {totalReceived} /{" "}
          {totalOrdered}
        </p>

        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
          <div
            style={{
              width: `${Math.min(
                progress,
                100
              )}%`,
            }}
            className="h-full rounded-full bg-slate-800"
          />
        </div>

        <p className="mt-1 text-[10px] text-slate-400">
          {progress}%
        </p>
      </td>

      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
        {money(
          purchase.grandTotal
        )}
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-700">
          {purchase.assignedToName ||
            "Not assigned"}
        </p>
      </td>

      <td className="px-4 py-4">
        <PurchaseStatus
          status={
            purchase.status
          }
        />
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {purchase.paymentStatus ||
          "Pending"}
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <button
            onClick={() =>
              onView(
                purchase
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            <Eye
              size={15}
            />
          </button>

          <button
            onClick={() =>
              onEdit(
                purchase
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil
              size={15}
            />
          </button>

          <button
            onClick={() =>
              onDelete(
                purchase
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2
              size={15}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}