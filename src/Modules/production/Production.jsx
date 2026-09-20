import { useMemo, useState } from "react";
import ProductionHeader from "./ProductionHeader";
import ProductionSummary from "./ProductionSummary";
import ProductionFilters from "./ProductionFilters";
import ProductionTable from "./ProductionTable";
import ProductionForm from "./ProductionForm";
import useBackendResource from "../../hooks/useBackendResource";
import ProductionDetails from "./ProductionDetails";
import DeleteProductionModal from "./DeleteProductionModal";

const initialProducts = [
  {
    id: "PROD-001",
    name: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    unit: "Piece",
  },
  {
    id: "PROD-002",
    name: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    unit: "Piece",
  },
  {
    id: "PROD-003",
    name: "White MDF Frame",
    sku: "BG-FRM-003",
    unit: "Piece",
  },
  {
    id: "PROD-004",
    name: "Golden Designer Frame",
    sku: "BG-FRM-004",
    unit: "Piece",
  },
];

const initialProduction = [
  {
    id: "PRD-001",
    productId: "PROD-001",
    productName: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    plannedQuantity: 100,
    completedQuantity: 60,
    wastage: 3,
    unit: "Piece",

    startDate: "2026-09-12",
    expectedDate: "2026-09-22",
    actualCompletionDate: "",

    managerId: "MGR-001",
    managerName: "Rahul Shah",

    location: "Production Unit 1",

    status: "In Progress",

    rawMaterials: [
      {
        id: "RM-001",
        productId: "RM-001",
        name: "MDF Board",
        requiredQuantity: 100,
        consumedQuantity: 60,
        unit: "Piece",
      },
      {
        id: "RM-002",
        productId: "RM-002",
        name: "Glass Sheet",
        requiredQuantity: 100,
        consumedQuantity: 60,
        unit: "Sheet",
      },
      {
        id: "RM-003",
        productId: "RM-003",
        name: "Frame Back Board",
        requiredQuantity: 100,
        consumedQuantity: 60,
        unit: "Piece",
      },
      {
        id: "RM-004",
        productId: "RM-004",
        name: "Metal Frame Clip",
        requiredQuantity: 400,
        consumedQuantity: 240,
        unit: "Piece",
      },
    ],

    notes: "Production running normally.",
  },

  {
    id: "PRD-002",
    productId: "PROD-002",
    productName: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    plannedQuantity: 80,
    completedQuantity: 80,
    wastage: 2,
    unit: "Piece",

    startDate: "2026-09-05",
    expectedDate: "2026-09-15",
    actualCompletionDate: "2026-09-14",

    managerId: "MGR-002",
    managerName: "Amit Patel",

    location: "Production Unit 1",

    status: "Completed",

    rawMaterials: [
      {
        id: "RM-005",
        productId: "RM-005",
        name: "Wooden Board",
        requiredQuantity: 80,
        consumedQuantity: 80,
        unit: "Piece",
      },
      {
        id: "RM-006",
        productId: "RM-006",
        name: "Glass Sheet",
        requiredQuantity: 80,
        consumedQuantity: 80,
        unit: "Sheet",
      },
    ],

    notes: "Completed successfully.",
  },

  {
    id: "PRD-003",
    productId: "PROD-003",
    productName: "White MDF Frame",
    sku: "BG-FRM-003",
    plannedQuantity: 150,
    completedQuantity: 0,
    wastage: 0,
    unit: "Piece",

    startDate: "2026-09-20",
    expectedDate: "2026-09-30",
    actualCompletionDate: "",

    managerId: "MGR-001",
    managerName: "Rahul Shah",

    location: "Production Unit 2",

    status: "Planned",

    rawMaterials: [
      {
        id: "RM-007",
        productId: "RM-007",
        name: "MDF Board",
        requiredQuantity: 150,
        consumedQuantity: 0,
        unit: "Piece",
      },
      {
        id: "RM-008",
        productId: "RM-008",
        name: "Glass Sheet",
        requiredQuantity: 150,
        consumedQuantity: 0,
        unit: "Sheet",
      },
    ],

    notes: "Scheduled for next production cycle.",
  },

  {
    id: "PRD-004",
    productId: "PROD-004",
    productName: "Golden Designer Frame",
    sku: "BG-FRM-004",
    plannedQuantity: 50,
    completedQuantity: 20,
    wastage: 1,
    unit: "Piece",

    startDate: "2026-09-10",
    expectedDate: "2026-09-25",
    actualCompletionDate: "",

    managerId: "MGR-002",
    managerName: "Amit Patel",

    location: "Production Unit 2",

    status: "Partially Completed",

    rawMaterials: [
      {
        id: "RM-009",
        productId: "RM-009",
        name: "Designer MDF Board",
        requiredQuantity: 50,
        consumedQuantity: 20,
        unit: "Piece",
      },
      {
        id: "RM-010",
        productId: "RM-010",
        name: "Designer Glass",
        requiredQuantity: 50,
        consumedQuantity: 20,
        unit: "Sheet",
      },
    ],

    notes: "Waiting for additional raw material.",
  },
];

const managers = [
  {
    id: "MGR-001",
    name: "Rahul Shah",
    department: "Production",
  },
  {
    id: "MGR-002",
    name: "Amit Patel",
    department: "Production",
  },
];

export default function Production({ token }) {
  const resource = useBackendResource(token, "production", initialProduction);
  const { records: productions, save, remove } = resource;

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    date: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [viewingProduction, setViewingProduction] = useState(null);
  const [deletingProduction, setDeletingProduction] = useState(null);

  const filteredProductions = useMemo(() => {
    return productions.filter((production) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        production.id.toLowerCase().includes(search) ||
        production.productName.toLowerCase().includes(search) ||
        production.sku.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "All" ||
        production.status === filters.status;

      const matchesDate =
        !filters.date ||
        production.startDate === filters.date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [productions, filters]);

  const handleAdd = () => {
    setEditingProduction(null);
    setFormOpen(true);
  };

  const handleEdit = (production) => {
    setEditingProduction(production);
    setFormOpen(true);
  };

  const handleView = (production) => {
    setViewingProduction(production);
  };

  const handleDelete = (production) => {
    setDeletingProduction(production);
  };

  const handleSave = async (formData) => {
    await save(formData, editingProduction?.id);
    setFormOpen(false);
    setEditingProduction(null);
  };

  const confirmDelete = async () => {
    if (!deletingProduction) return;
    await remove(deletingProduction.id);

    setDeletingProduction(null);
  };

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <ProductionHeader onAdd={handleAdd} />

        <ProductionSummary productions={productions} />

        <ProductionFilters
          filters={filters}
          setFilters={setFilters}
        />

        <ProductionTable
          productions={filteredProductions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {formOpen && (
        <ProductionForm
          production={editingProduction}
          products={initialProducts}
          managers={managers}
          onClose={() => {
            setFormOpen(false);
            setEditingProduction(null);
          }}
          onSave={handleSave}
        />
      )}

      {viewingProduction && (
        <ProductionDetails
          production={viewingProduction}
          onClose={() => setViewingProduction(null)}
          onEdit={() => {
            setViewingProduction(null);
            handleEdit(viewingProduction);
          }}
        />
      )}

      {deletingProduction && (
        <DeleteProductionModal
          production={deletingProduction}
          onClose={() => setDeletingProduction(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}