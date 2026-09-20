import { useMemo, useState } from "react";
import PurchaseHeader from "./PurchaseHeader";
import PurchaseSummary from "./PurchaseSummary";
import PurchaseFilters from "./PurchaseFilters";
import PurchaseTable from "./PurchaseTable";
import PurchaseForm from "./PurchaseForm";
import useBackendResource from "../../hooks/useBackendResource";
import PurchaseDetails from "./PurchaseDetails";
import DeletePurchaseModal from "./DeletePurchaseModal";

const initialProducts = [
  {
    id: "PROD-001",
    name: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    category: "Photo Frame",
    size: "1 Inch",
    unit: "Piece",
    purchasePrice: 180,
    stock: 72,
  },
  {
    id: "PROD-002",
    name: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    category: "Photo Frame",
    size: "2 Inch",
    unit: "Piece",
    purchasePrice: 260,
    stock: 34,
  },
  {
    id: "PROD-003",
    name: "White MDF Frame",
    sku: "BG-FRM-003",
    category: "MDF Frame",
    size: "1 Inch",
    unit: "Piece",
    purchasePrice: 140,
    stock: 12,
  },
  {
    id: "PROD-004",
    name: "Golden Designer Frame",
    sku: "BG-FRM-004",
    category: "Designer Frame",
    size: "3 Inch",
    unit: "Piece",
    purchasePrice: 350,
    stock: 0,
  },
  {
    id: "PROD-005",
    name: "Frame Back Board",
    sku: "BG-BRD-001",
    category: "Raw Material",
    size: "12x18",
    unit: "Piece",
    purchasePrice: 45,
    stock: 145,
  },
  {
    id: "PROD-006",
    name: "Glass Sheet",
    sku: "BG-GLS-001",
    category: "Raw Material",
    size: "12x18",
    unit: "Sheet",
    purchasePrice: 80,
    stock: 85,
  },
  {
    id: "PROD-007",
    name: "Metal Frame Clip",
    sku: "BG-CLP-001",
    category: "Accessories",
    size: "Small",
    unit: "Piece",
    purchasePrice: 4,
    stock: 520,
  },
  {
    id: "PROD-008",
    name: "Photo Printing Paper",
    sku: "BG-PPR-001",
    category: "Printing Material",
    size: "A4",
    unit: "Pack",
    purchasePrice: 320,
    stock: 8,
  },
];

const suppliers = [
  {
    id: "SUP-001",
    name: "ABC Glass Supplier",
    contactPerson: "Rajesh Patel",
    phone: "+91 98765 43210",
    email: "abcglass@example.com",
    address: "Rajkot, Gujarat",
  },
  {
    id: "SUP-002",
    name: "Shree MDF Industries",
    contactPerson: "Amit Shah",
    phone: "+91 98254 12345",
    email: "shreemdf@example.com",
    address: "Ahmedabad, Gujarat",
  },
  {
    id: "SUP-003",
    name: "Royal Hardware Traders",
    contactPerson: "Kunal Mehta",
    phone: "+91 98980 56789",
    email: "royalhardware@example.com",
    address: "Rajkot, Gujarat",
  },
  {
    id: "SUP-004",
    name: "Print Material House",
    contactPerson: "Vivek Joshi",
    phone: "+91 99123 45678",
    email: "printmaterial@example.com",
    address: "Surat, Gujarat",
  },
];

const initialPurchases = [
  {
    id: "PUR-001",
    supplierId: "SUP-001",
    supplierName: "ABC Glass Supplier",
    purchaseDate: "2026-09-15",
    status: "Received",
    items: [
      {
        productId: "PROD-006",
        quantity: 50,
        rate: 80,
        receivedQuantity: 50,
      },
      {
        productId: "PROD-007",
        quantity: 500,
        rate: 4,
        receivedQuantity: 500,
      },
    ],
    gst: 18,
    discount: 500,
    notes: "Regular monthly raw material purchase.",
    paymentStatus: "Paid",
  },
  {
    id: "PUR-002",
    supplierId: "SUP-002",
    supplierName: "Shree MDF Industries",
    purchaseDate: "2026-09-16",
    status: "Partially Received",
    items: [
      {
        productId: "PROD-005",
        quantity: 200,
        rate: 45,
        receivedQuantity: 100,
      },
      {
        productId: "PROD-003",
        quantity: 50,
        rate: 140,
        receivedQuantity: 50,
      },
    ],
    gst: 18,
    discount: 250,
    notes: "MDF board shipment partially received.",
    paymentStatus: "Partial",
  },
  {
    id: "PUR-003",
    supplierId: "SUP-003",
    supplierName: "Royal Hardware Traders",
    purchaseDate: "2026-09-17",
    status: "Ordered",
    items: [
      {
        productId: "PROD-007",
        quantity: 1000,
        rate: 4,
        receivedQuantity: 0,
      },
    ],
    gst: 18,
    discount: 0,
    notes: "Hardware stock replenishment.",
    paymentStatus: "Pending",
  },
  {
    id: "PUR-004",
    supplierId: "SUP-004",
    supplierName: "Print Material House",
    purchaseDate: "2026-09-18",
    status: "Pending",
    items: [
      {
        productId: "PROD-008",
        quantity: 20,
        rate: 320,
        receivedQuantity: 0,
      },
    ],
    gst: 18,
    discount: 200,
    notes: "Printing paper requirement.",
    paymentStatus: "Pending",
  },
  {
    id: "PUR-005",
    supplierId: "SUP-001",
    supplierName: "ABC Glass Supplier",
    purchaseDate: "2026-09-18",
    status: "Draft",
    items: [
      {
        productId: "PROD-006",
        quantity: 100,
        rate: 80,
        receivedQuantity: 0,
      },
    ],
    gst: 18,
    discount: 0,
    notes: "",
    paymentStatus: "Pending",
  },
];

export default function Purchase({ token }) {
  const resource = useBackendResource(token, "purchases", initialPurchases);
  const { records: purchases, save, remove } = resource;

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        purchase.id.toLowerCase().includes(searchValue) ||
        purchase.supplierName.toLowerCase().includes(searchValue) ||
        purchase.items.some((item) =>
          item.productId.toLowerCase().includes(searchValue)
        );

      const matchesSupplier =
        supplierFilter === "All" ||
        purchase.supplierId === supplierFilter;

      const matchesStatus =
        statusFilter === "All" || purchase.status === statusFilter;

      const matchesDate =
        !dateFilter || purchase.purchaseDate === dateFilter;

      return (
        matchesSearch &&
        matchesSupplier &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    purchases,
    search,
    supplierFilter,
    statusFilter,
    dateFilter,
  ]);

  const calculateTotals = (purchase) => {
    const subtotal = purchase.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.rate),
      0
    );

    const tax = ((subtotal - Number(purchase.discount || 0)) *
      Number(purchase.gst || 0)) /
      100;

    const grandTotal =
      subtotal - Number(purchase.discount || 0) + tax;

    return {
      subtotal,
      tax,
      grandTotal,
    };
  };

  const summary = useMemo(() => {
    let purchaseValue = 0;

    purchases.forEach((purchase) => {
      purchaseValue += calculateTotals(purchase).grandTotal;
    });

    return {
      total: purchases.length,
      pending: purchases.filter(
        (p) =>
          p.status === "Draft" ||
          p.status === "Pending" ||
          p.status === "Ordered"
      ).length,
      received: purchases.filter(
        (p) => p.status === "Received"
      ).length,
      purchaseValue,
    };
  }, [purchases]);

  const handleAdd = () => {
    setEditingPurchase(null);
    setFormOpen(true);
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormOpen(true);
  };

  const handleView = (purchase) => {
    setSelectedPurchase(purchase);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (purchase) => {
    setPurchaseToDelete(purchase);
    setDeleteOpen(true);
  };

  const handleSave = async (purchaseData) => {
    await save(purchaseData, editingPurchase?.id);

    setFormOpen(false);
    setEditingPurchase(null);
  };

  const handleDelete = async () => {
    if (!purchaseToDelete) return;
    await remove(purchaseToDelete.id);

    setDeleteOpen(false);
    setPurchaseToDelete(null);

    if (
      selectedPurchase &&
      selectedPurchase.id === purchaseToDelete.id
    ) {
      setDetailsOpen(false);
      setSelectedPurchase(null);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSupplierFilter("All");
    setStatusFilter("All");
    setDateFilter("");
  };

  return (
    <div className="min-h-full bg-slate-50/60 p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <PurchaseHeader onAdd={handleAdd} />

        <PurchaseSummary summary={summary} />

        <PurchaseFilters
          search={search}
          setSearch={setSearch}
          supplierFilter={supplierFilter}
          setSupplierFilter={setSupplierFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          suppliers={suppliers}
          onClear={handleClearFilters}
        />

        <PurchaseTable
          purchases={filteredPurchases}
          products={initialProducts}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {formOpen && (
        <PurchaseForm
          purchase={editingPurchase}
          products={initialProducts}
          suppliers={suppliers}
          onClose={() => {
            setFormOpen(false);
            setEditingPurchase(null);
          }}
          onSave={handleSave}
        />
      )}

      {detailsOpen && selectedPurchase && (
        <PurchaseDetails
          purchase={selectedPurchase}
          products={initialProducts}
          suppliers={suppliers}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedPurchase(null);
          }}
          onEdit={() => {
            setDetailsOpen(false);
            handleEdit(selectedPurchase);
          }}
        />
      )}

      {deleteOpen && purchaseToDelete && (
        <DeletePurchaseModal
          purchase={purchaseToDelete}
          onClose={() => {
            setDeleteOpen(false);
            setPurchaseToDelete(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}