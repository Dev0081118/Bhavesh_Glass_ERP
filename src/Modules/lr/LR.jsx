import { useMemo, useState } from "react";
import LRHeader from "./LRHeader";
import LRSummary from "./LRSummary";
import LRFilters from "./LRFilters";
import LRTable from "./LRTable";
import LRForm from "./LRForm";
import LRDetails from "./LRDetails";
import DeleteLRModal from "./DeleteLRModal";
import useBackendResource from "../../hooks/useBackendResource";

const initialLRs = [
  {
    id: "LR-001",
    lrNumber: "LR-2026-001",
    lrDate: "2026-09-18",

    dispatchId: "DSP-001",
    saleBillId: "SB-001",

    customerId: "CUS-001",
    customerName: "Rajkot Photo House",

    customerPhone: "+91 98765 43210",

    fromLocation: "Bhavesh Glass - Rajkot",
    toLocation: "Rajkot Photo House - Rajkot",

    transporter: "Shree Transport",
    vehicleNumber: "GJ03AB1234",

    driverName: "Rakesh Parmar",
    driverPhone: "+91 98765 12345",

    packageCount: 4,
    weight: 85,

    freightAmount: 1200,
    freightPaymentStatus: "Pending",

    expectedDeliveryDate: "2026-09-19",
    actualDeliveryDate: "",

    status: "In Transit",

    notes: "Handle glass and photo frames carefully.",
  },

  {
    id: "LR-002",
    lrNumber: "LR-2026-002",
    lrDate: "2026-09-17",

    dispatchId: "DSP-002",
    saleBillId: "SB-002",

    customerId: "CUS-002",
    customerName: "Shreeji Frames",

    customerPhone: "+91 98765 67890",

    fromLocation: "Bhavesh Glass - Rajkot",
    toLocation: "Shreeji Frames - Rajkot",

    transporter: "Rajkot Cargo",
    vehicleNumber: "GJ03CD5678",

    driverName: "Amit Solanki",
    driverPhone: "+91 98765 87654",

    packageCount: 6,
    weight: 120,

    freightAmount: 1800,
    freightPaymentStatus: "Paid",

    expectedDeliveryDate: "2026-09-18",
    actualDeliveryDate: "2026-09-18",

    status: "Delivered",

    notes: "Delivered successfully.",
  },

  {
    id: "LR-003",
    lrNumber: "LR-2026-003",
    lrDate: "2026-09-19",

    dispatchId: "DSP-003",
    saleBillId: "SB-003",

    customerId: "CUS-003",
    customerName: "Royal Photo Studio",

    customerPhone: "+91 98765 11223",

    fromLocation: "Bhavesh Glass - Rajkot",
    toLocation: "Royal Photo Studio - Rajkot",

    transporter: "Patel Logistics",
    vehicleNumber: "GJ03EF9012",

    driverName: "Mahesh Patel",
    driverPhone: "+91 98765 99887",

    packageCount: 2,
    weight: 45,

    freightAmount: 800,
    freightPaymentStatus: "Pending",

    expectedDeliveryDate: "2026-09-20",
    actualDeliveryDate: "",

    status: "Ready",

    notes: "Waiting for vehicle departure.",
  },

  {
    id: "LR-004",
    lrNumber: "LR-2026-004",
    lrDate: "2026-09-16",

    dispatchId: "DSP-004",
    saleBillId: "SB-004",

    customerId: "CUS-004",
    customerName: "Krishna Photo Studio",

    customerPhone: "+91 98251 45678",

    fromLocation: "Bhavesh Glass - Rajkot",
    toLocation: "Krishna Photo Studio - Gondal",

    transporter: "Gujarat Express",
    vehicleNumber: "GJ27GH3456",

    driverName: "Vijay Chauhan",
    driverPhone: "+91 98251 87654",

    packageCount: 8,
    weight: 175,

    freightAmount: 2500,
    freightPaymentStatus: "Paid",

    expectedDeliveryDate: "2026-09-17",
    actualDeliveryDate: "2026-09-17",

    status: "Delivered",

    notes: "All packages received in good condition.",
  },

  {
    id: "LR-005",
    lrNumber: "LR-2026-005",
    lrDate: "2026-09-19",

    dispatchId: "DSP-005",
    saleBillId: "SB-005",

    customerId: "CUS-005",
    customerName: "Modern Frame House",

    customerPhone: "+91 99041 22334",

    fromLocation: "Bhavesh Glass - Rajkot",
    toLocation: "Modern Frame House - Jamnagar",

    transporter: "Saurashtra Transport",
    vehicleNumber: "GJ10JK7890",

    driverName: "Sanjay Jadeja",
    driverPhone: "+91 99041 33445",

    packageCount: 10,
    weight: 220,

    freightAmount: 3200,
    freightPaymentStatus: "Pending",

    expectedDeliveryDate: "2026-09-21",
    actualDeliveryDate: "",

    status: "Booked",

    notes: "Vehicle booked for tomorrow morning.",
  },
];

const emptyFilters = {
  search: "",
  status: "All",
  transporter: "All",
  freightPaymentStatus: "All",
  dateFrom: "",
  dateTo: "",
};

function LR({ token }) {
  const resource = useBackendResource(token, "lrs", initialLRs);
  const { records: lrs, save, remove } = resource;

  const [filters, setFilters] = useState(emptyFilters);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLR, setEditingLR] = useState(null);

  const [selectedLR, setSelectedLR] = useState(null);

  const [deleteLR, setDeleteLR] = useState(null);

  const filteredLRs = useMemo(() => {
    return lrs.filter((lr) => {
      const search = filters.search.toLowerCase();

      const matchesSearch =
        !search ||
        lr.id.toLowerCase().includes(search) ||
        lr.lrNumber.toLowerCase().includes(search) ||
        lr.dispatchId.toLowerCase().includes(search) ||
        lr.saleBillId.toLowerCase().includes(search) ||
        lr.customerName.toLowerCase().includes(search) ||
        lr.vehicleNumber.toLowerCase().includes(search) ||
        lr.transporter.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "All" || lr.status === filters.status;

      const matchesTransporter =
        filters.transporter === "All" ||
        lr.transporter === filters.transporter;

      const matchesFreight =
        filters.freightPaymentStatus === "All" ||
        lr.freightPaymentStatus === filters.freightPaymentStatus;

      const matchesDateFrom =
        !filters.dateFrom || lr.lrDate >= filters.dateFrom;

      const matchesDateTo =
        !filters.dateTo || lr.lrDate <= filters.dateTo;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTransporter &&
        matchesFreight &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [lrs, filters]);

  const summary = useMemo(() => {
    const total = lrs.length;

    const delivered = lrs.filter(
      (lr) => lr.status === "Delivered"
    ).length;

    const inTransit = lrs.filter(
      (lr) => lr.status === "In Transit"
    ).length;

    const pending = lrs.filter(
      (lr) => lr.status !== "Delivered" && lr.status !== "Cancelled"
    ).length;

    const pendingFreight = lrs
      .filter((lr) => lr.freightPaymentStatus === "Pending")
      .reduce(
        (sum, lr) => sum + Number(lr.freightAmount || 0),
        0
      );

    return {
      total,
      delivered,
      inTransit,
      pending,
      pendingFreight,
    };
  }, [lrs]);

  const handleAdd = () => {
    setEditingLR(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lr) => {
    setSelectedLR(null);
    setEditingLR(lr);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    await save(formData, editingLR?.id);

    setIsFormOpen(false);
    setEditingLR(null);
  };

  const handleDelete = async () => {
    if (!deleteLR) return;
    await remove(deleteLR.id);

    if (selectedLR?.id === deleteLR.id) {
      setSelectedLR(null);
    }

    setDeleteLR(null);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <LRHeader onAdd={handleAdd} />

        <LRSummary summary={summary} />

        <LRFilters
          filters={filters}
          setFilters={setFilters}
          lrs={lrs}
          onClear={handleClearFilters}
        />

        <LRTable
          lrs={filteredLRs}
          onView={setSelectedLR}
          onEdit={handleEdit}
          onDelete={setDeleteLR}
        />
      </div>

      {isFormOpen && (
        <LRForm
          lr={editingLR}
          onClose={() => {
            setIsFormOpen(false);
            setEditingLR(null);
          }}
          onSave={handleSave}
        />
      )}

      {selectedLR && (
        <LRDetails
          lr={selectedLR}
          onClose={() => setSelectedLR(null)}
          onEdit={handleEdit}
        />
      )}

      {deleteLR && (
        <DeleteLRModal
          lr={deleteLR}
          onCancel={() => setDeleteLR(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default LR;