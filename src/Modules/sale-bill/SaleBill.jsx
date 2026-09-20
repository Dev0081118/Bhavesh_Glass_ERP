import { useMemo, useState } from "react";
import SaleBillHeader from "./SaleBillHeader";
import SaleBillSummary from "./SaleBillSummary";
import SaleBillFilters from "./SaleBillFilters";
import SaleBillTable from "./SaleBillTable";
import SaleBillForm from "./SaleBillForm";
import SaleBillDetails from "./SaleBillDetails";
import DeleteSaleBillModal from "./DeleteSaleBillModal";
import useBackendResource from "../../hooks/useBackendResource";

const products = [
  {
    id: "PROD-001",
    name: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    unit: "Piece",
    sellingPrice: 299,
    gst: 18,
    stock: 72,
  },
  {
    id: "PROD-002",
    name: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    unit: "Piece",
    sellingPrice: 499,
    gst: 18,
    stock: 34,
  },
  {
    id: "PROD-003",
    name: "White MDF Frame",
    sku: "BG-FRM-003",
    unit: "Piece",
    sellingPrice: 249,
    gst: 18,
    stock: 12,
  },
  {
    id: "PROD-004",
    name: "Golden Designer Frame",
    sku: "BG-FRM-004",
    unit: "Piece",
    sellingPrice: 699,
    gst: 18,
    stock: 25,
  },
  {
    id: "PROD-005",
    name: "Frame Back Board",
    sku: "BG-BRD-001",
    unit: "Piece",
    sellingPrice: 80,
    gst: 18,
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
    phone: "+91 98254 12345",
    city: "Ahmedabad",
    address: "C.G. Road, Ahmedabad",
  },
  {
    id: "CUS-003",
    name: "Royal Photo Studio",
    phone: "+91 99045 67890",
    city: "Jamnagar",
    address: "Station Road, Jamnagar",
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

const initialSaleBills = [
  {
    id: "SB-001",
    customerId: "CUS-001",
    customerName: "Rajkot Photo House",
    customerPhone: "+91 98765 43210",
    customerCity: "Rajkot",
    customerAddress: "Kalawad Road, Rajkot",
    billDate: "2026-09-17",
    dueDate: "2026-09-27",
    managerId: "MGR-001",
    managerName: "Rahul Shah",
    status: "Confirmed",
    paymentStatus: "Partial",
    paidAmount: 10000,
    notes: "Regular wholesale customer.",
    items: [
      {
        id: "ITEM-001",
        productId: "PROD-001",
        name: "Classic Black Photo Frame",
        sku: "BG-FRM-001",
        quantity: 30,
        unit: "Piece",
        rate: 299,
        discount: 5,
        gst: 18,
      },
      {
        id: "ITEM-002",
        productId: "PROD-002",
        name: "Premium Wooden Frame",
        sku: "BG-FRM-002",
        quantity: 10,
        unit: "Piece",
        rate: 499,
        discount: 3,
        gst: 18,
      },
    ],
  },
  {
    id: "SB-002",
    customerId: "CUS-002",
    customerName: "Shreeji Frames",
    customerPhone: "+91 98254 12345",
    customerCity: "Ahmedabad",
    customerAddress: "C.G. Road, Ahmedabad",
    billDate: "2026-09-18",
    dueDate: "2026-09-25",
    managerId: "MGR-002",
    managerName: "Amit Patel",
    status: "Partially Dispatched",
    paymentStatus: "Paid",
    paidAmount: 14770,
    notes: "Urgent order.",
    items: [
      {
        id: "ITEM-003",
        productId: "PROD-004",
        name: "Golden Designer Frame",
        sku: "BG-FRM-004",
        quantity: 20,
        unit: "Piece",
        rate: 699,
        discount: 0,
        gst: 18,
      },
    ],
  },
  {
    id: "SB-003",
    customerId: "CUS-003",
    customerName: "Royal Photo Studio",
    customerPhone: "+91 99045 67890",
    customerCity: "Jamnagar",
    customerAddress: "Station Road, Jamnagar",
    billDate: "2026-09-19",
    dueDate: "2026-10-03",
    managerId: "MGR-001",
    managerName: "Rahul Shah",
    status: "Draft",
    paymentStatus: "Unpaid",
    paidAmount: 0,
    notes: "",
    items: [
      {
        id: "ITEM-004",
        productId: "PROD-003",
        name: "White MDF Frame",
        sku: "BG-FRM-003",
        quantity: 15,
        unit: "Piece",
        rate: 249,
        discount: 0,
        gst: 18,
      },
      {
        id: "ITEM-005",
        productId: "PROD-005",
        name: "Frame Back Board",
        sku: "BG-BRD-001",
        quantity: 20,
        unit: "Piece",
        rate: 80,
        discount: 0,
        gst: 18,
      },
    ],
  },
];

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let discount = 0;
  let gstAmount = 0;

  items.forEach((item) => {
    const lineSubtotal = Number(item.quantity || 0) * Number(item.rate || 0);
    const lineDiscount =
      lineSubtotal * (Number(item.discount || 0) / 100);
    const taxable = lineSubtotal - lineDiscount;
    const lineGst = taxable * (Number(item.gst || 0) / 100);

    subtotal += lineSubtotal;
    discount += lineDiscount;
    gstAmount += lineGst;
  });

  const taxableAmount = subtotal - discount;
  const grandTotal = taxableAmount + gstAmount;

  return {
    subtotal,
    discount,
    taxableAmount,
    gstAmount,
    grandTotal,
  };
};

const prepareBill = (bill) => ({
  ...bill,
  ...calculateTotals(bill.items),
});

export default function SaleBill({ token }) {
  const resource = useBackendResource(token, "sale-bills", initialSaleBills.map(prepareBill));
  const { records: saleBills, save, remove } = resource;

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    paymentStatus: "All",
    date: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteBill, setDeleteBill] = useState(null);

  const filteredBills = useMemo(() => {
    return saleBills.filter((bill) => {
      const search = filters.search.toLowerCase();

      const matchesSearch =
        !search ||
        bill.id.toLowerCase().includes(search) ||
        bill.customerName.toLowerCase().includes(search) ||
        bill.customerPhone.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "All" || bill.status === filters.status;

      const matchesPayment =
        filters.paymentStatus === "All" ||
        bill.paymentStatus === filters.paymentStatus;

      const matchesDate =
        !filters.date || bill.billDate === filters.date;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesDate
      );
    });
  }, [saleBills, filters]);

  const summary = useMemo(() => {
    const totalSales = saleBills.reduce(
      (sum, bill) => sum + Number(bill.grandTotal || 0),
      0
    );

    const pendingPayment = saleBills
      .filter((bill) =>
        ["Unpaid", "Partial", "Overdue"].includes(bill.paymentStatus)
      )
      .reduce(
        (sum, bill) =>
          sum +
          Math.max(
            Number(bill.grandTotal || 0) -
              Number(bill.paidAmount || 0),
            0
          ),
        0
      );

    return {
      totalBills: saleBills.length,
      confirmed: saleBills.filter(
        (bill) =>
          bill.status === "Confirmed" ||
          bill.status === "Partially Dispatched"
      ).length,
      pendingPayment,
      totalSales,
    };
  }, [saleBills]);

  const handleSave = async (formData) => {
    const totals = calculateTotals(formData.items);

    await save({ ...formData, ...totals }, editingBill?.id);

    setShowForm(false);
    setEditingBill(null);
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteBill) return;
    await remove(deleteBill.id);

    if (selectedBill?.id === deleteBill.id) {
      setSelectedBill(null);
    }

    setDeleteBill(null);
  };

  const handleExport = () => {
    console.log("Sale Bill export:", filteredBills);
  };

  return (
    <div className="space-y-6">
      <SaleBillHeader
        onAdd={() => {
          setEditingBill(null);
          setShowForm(true);
        }}
        onExport={handleExport}
      />

      <SaleBillSummary summary={summary} />

      <SaleBillFilters
        filters={filters}
        setFilters={setFilters}
      />

      <SaleBillTable
        bills={filteredBills}
        onView={setSelectedBill}
        onEdit={handleEdit}
        onDelete={setDeleteBill}
      />

      {showForm && (
        <SaleBillForm
          bill={editingBill}
          products={products}
          customers={customers}
          managers={managers}
          onClose={() => {
            setShowForm(false);
            setEditingBill(null);
          }}
          onSave={handleSave}
        />
      )}

      {selectedBill && (
        <SaleBillDetails
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onEdit={() => {
            handleEdit(selectedBill);
            setSelectedBill(null);
          }}
        />
      )}

      {deleteBill && (
        <DeleteSaleBillModal
          bill={deleteBill}
          onClose={() => setDeleteBill(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}