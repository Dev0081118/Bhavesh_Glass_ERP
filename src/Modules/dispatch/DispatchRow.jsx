import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import DispatchStatus from "./DispatchStatus";

export default function DispatchRow({
  dispatch,
  onView,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = (dispatch.items || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">
          {dispatch.id}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {dispatch.saleBillId}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {dispatch.customerName}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {dispatch.customerCity}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {totalItems.toLocaleString()}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {dispatch.items?.length || 0} product
          {(dispatch.items?.length || 0) !== 1 ? "s" : ""}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-600">
          {dispatch.dispatchDate || "Not dispatched"}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          ETA: {dispatch.expectedDeliveryDate || "—"}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-700">
          {dispatch.transporter || "—"}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {dispatch.vehicleNumber || "No vehicle"}
        </p>
      </td>

      <td className="px-5 py-4">
        {dispatch.lrId ? (
          <span className="text-sm font-medium text-slate-700">
            {dispatch.lrId}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            Not assigned
          </span>
        )}
      </td>

      <td className="px-5 py-4">
        <DispatchStatus status={dispatch.status} />
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          type="button"
          onClick={() =>
            setMenuOpen((current) => !current)
          }
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />

            <div className="absolute right-5 top-12 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onView(dispatch);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Eye size={15} />
                View
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(dispatch);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(dispatch);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}