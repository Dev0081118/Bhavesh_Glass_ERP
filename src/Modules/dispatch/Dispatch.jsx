import { useMemo, useState } from "react";
import DispatchHeader from "./DispatchHeader";
import DispatchSummary from "./DispatchSummary";
import DispatchFilters from "./DispatchFilters";
import DispatchTable from "./DispatchTable";
import DispatchForm from "./DispatchForm";
import DispatchDetails from "./DispatchDetails";
import DeleteDispatchModal from "./DeleteDispatchModal";

const products = [
  {
    id: "PROD-001",
    name: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    unit: "Piece",
    stock: 72,
  },
  {
    id: "PROD-002",
    name: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    unit: "Piece",
    stock: 34,
  },
  {
    id: "PROD-003",
    name: "White MDF Frame",
    sku: "BG-FRM-003",
    unit: "Piece",
    stock: 12,
  },
  {
    id: "PROD-004",
    name: "Golden Designer Frame",
    sku: "BG-FRM-004",
    unit: "Piece",
    stock: 25,
  },
  {
    id: "PROD-005",
    name: "Frame Back Board",
    sku: "BG-BRD-001",
    unit: "Piece",
    stock: 145,
  },
];

const customers = [
  {
    id: "CUS-001",
    name: "Rajkot Photo House",
    phone: "+91 98765 43210",
    city: "Rajkot",
    address: "Kalawad Road, Rajkot",
  },
  {
    id: "CUS-002",
    name: "Shreeji Frames",
    phone: "+91 98250 12345",
    city: "Ahmedabad",
    address: "C.G. Road, Ahmedabad",
  },
  {
    id: "CUS-003",
    name: "Royal Photo Studio",
    phone: "+91 98980 56789",
    city: "Surat",
    address: "Ring Road, Surat",
  },
];

const managers = [
  {
    id: "MGR-001",
    name: "Rahul Shah",
  },
  {
    id: "MGR-002",
    name: "Amit Patel",
  },
];

const initialDispatches = [
  {
    id: "DSP-001",
    saleBillId: "SB-001",
    customerId: "CUS-001",
    customerName: "Rajkot Photo House",
    customerPhone: "+91 98765 43210",
    customerCity: "Rajkot",

    dispatchDate: "2026-09-17",
    expectedDeliveryDate: "2026-09-19",

    warehouse: "Main Warehouse",

    transporter: "VRL Logistics",
    vehicleNumber: "GJ03AB1234",
    lrId: "LR-001",

    managerId: "MGR-001",
    managerName: "Rahul Shah",

    status: "In Transit",

    notes: "Handle frames carefully.",

    items: [
      {
        id: "DSP-ITEM-001",
        productId: "PROD-001",
        name: "Classic Black Photo Frame",
        sku: "BG-FRM-001",
        quantity: 20,
        unit: "Piece",
      },
      {
        id: "DSP-ITEM-002",
        productId: "PROD-002",
        name: "Premium Wooden Frame",
        sku: "BG-FRM-002",
        quantity: 10,
        unit: "Piece",
      },
    ],
  },

  {
    id: "DSP-002",
    saleBillId: "SB-002",
    customerId: "CUS-002",
    customerName: "Shreeji Frames",
    customerPhone: "+91 98250 12345",
    customerCity: "Ahmedabad",

    dispatchDate: "2026-09-16",
    expectedDeliveryDate: "2026-09-18",

    warehouse: "Main Warehouse",

    transporter: "Shree Transport",
    vehicleNumber: "GJ01CD5678",
    lrId: "LR-002",

    managerId: "MGR-002",
    managerName: "Amit Patel",

    status: "Delivered",

    notes: "Delivered successfully.",

    items: [
      {
        id: "DSP-ITEM-003",
        productId: "PROD-003",
        name: "White MDF Frame",
        sku: "BG-FRM-003",
        quantity: 15,
        unit: "Piece",
      },
    ],
  },

  {
    id: "DSP-003",
    saleBillId: "SB-003",
    customerId: "CUS-003",
    customerName: "Royal Photo Studio",
    customerPhone: "+91 98980 56789",
    customerCity: "Surat",

    dispatchDate: "2026-09-20",
    expectedDeliveryDate: "2026-09-22",

    warehouse: "Main Warehouse",

    transporter: "Patel Transport",
    vehicleNumber: "GJ05EF9012",
    lrId: "",

    managerId: "MGR-001",
    managerName: "Rahul Shah",

    status: "Ready to Dispatch",

    notes: "Waiting for vehicle confirmation.",

    items: [
      {
        id: "DSP-ITEM-004",
        productId: "PROD-004",
        name: "Golden Designer Frame",
        sku: "BG-FRM-004",
        quantity: 12,
        unit: "Piece",
      },
      {
        id: "DSP-ITEM-005",
        productId: "PROD-005",
        name: "Frame Back Board",
        sku: "BG-BRD-001",
        quantity: 30,
        unit: "Piece",
      },
    ],
  },

  {
    id: "DSP-004",
    saleBillId: "SB-004",
    customerId: "CUS-001",
    customerName: "Rajkot Photo House",
    customerPhone: "+91 98765 43210",
    customerCity: "Rajkot",

    dispatchDate: "",
    expectedDeliveryDate: "2026-09-25",

    warehouse: "Main Warehouse",

    transporter: "",
    vehicleNumber: "",
    lrId: "",

    managerId: "MGR-002",
    managerName: "Amit Patel",

    status: "Draft",

    notes: "",

    items: [
      {
        id: "DSP-ITEM-006",
        productId: "PROD-001",
        name: "Classic Black Photo Frame",
        sku: "BG-FRM-001",
        quantity: 25,
        unit: "Piece",
      },
    ],
  },
];

export default function Dispatch() {
  const [dispatches, setDispatches] = useState(initialDispatches);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    date: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState(null);
  const [viewingDispatch, setViewingDispatch] = useState(null);
  const [deletingDispatch, setDeletingDispatch] = useState(null);

  const filteredDispatches = useMemo(() => {
    return dispatches.filter((dispatch) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        dispatch.id.toLowerCase().includes(search) ||
        dispatch.customerName.toLowerCase().includes(search) ||
        dispatch.saleBillId.toLowerCase().includes(search) ||
        dispatch.customerCity.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "All" ||
        dispatch.status === filters.status;

      const matchesDate =
        !filters.date ||
        dispatch.dispatchDate === filters.date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [dispatches, filters]);

  const handleAdd = () => {
    setEditingDispatch(null);
    setFormOpen(true);
  };

  const handleEdit = (dispatch) => {
    setEditingDispatch(dispatch);
    setFormOpen(true);
  };

  const handleView = (dispatch) => {
    setViewingDispatch(dispatch);
  };

  const handleDelete = (dispatch) => {
    setDeletingDispatch(dispatch);
  };

  const handleSave = (formData) => {
    if (editingDispatch) {
      setDispatches((current) =>
        current.map((item) =>
          item.id === editingDispatch.id
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      );
    } else {
      const nextNumber =
        dispatches.length > 0
          ? Math.max(
              ...dispatches.map((item) =>
                Number(item.id.replace("DSP-", ""))
              )
            ) + 1
          : 1;

      const newDispatch = {
        ...formData,
        id: `DSP-${String(nextNumber).padStart(3, "0")}`,
      };

      setDispatches((current) => [
        newDispatch,
        ...current,
      ]);
    }

    setFormOpen(false);
    setEditingDispatch(null);
  };

  const confirmDelete = () => {
    if (!deletingDispatch) return;

    setDispatches((current) =>
      current.filter(
        (item) => item.id !== deletingDispatch.id
      )
    );

    setDeletingDispatch(null);
  };

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <DispatchHeader onAdd={handleAdd} />

        <DispatchSummary dispatches={dispatches} />

        <DispatchFilters
          filters={filters}
          setFilters={setFilters}
        />

        <DispatchTable
          dispatches={filteredDispatches}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {formOpen && (
        <DispatchForm
          dispatch={editingDispatch}
          products={products}
          customers={customers}
          managers={managers}
          onClose={() => {
            setFormOpen(false);
            setEditingDispatch(null);
          }}
          onSave={handleSave}
        />
      )}

      {viewingDispatch && (
        <DispatchDetails
          dispatch={viewingDispatch}
          onClose={() => setViewingDispatch(null)}
          onEdit={() => {
            setViewingDispatch(null);
            handleEdit(viewingDispatch);
          }}
        />
      )}

      {deletingDispatch && (
        <DeleteDispatchModal
          dispatch={deletingDispatch}
          onClose={() => setDeletingDispatch(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}