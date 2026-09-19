import { useMemo, useState } from "react";
import InventoryHeader from "./InventoryHeader";
import InventorySummary from "./InventorySummary";
import InventoryFilters from "./InventoryFilters";
import InventoryTable from "./InventoryTable";
import StockMovementModal from "./StockMovementModal";
import StockAdjustmentModal from "./StockAdjustmentModal";
import InventoryDetails from "./InventoryDetails";

const INITIAL_INVENTORY = [
  {
    id: "INV-001",
    productId: "PROD-001",
    name: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    category: "Photo Frame",
    size: "1 Inch",
    location: "Main Warehouse",
    available: 72,
    reserved: 10,
    reorderLevel: 20,
    unit: "Piece",
  },
  {
    id: "INV-002",
    productId: "PROD-002",
    name: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    category: "Photo Frame",
    size: "2 Inch",
    location: "Main Warehouse",
    available: 34,
    reserved: 5,
    reorderLevel: 15,
    unit: "Piece",
  },
  {
    id: "INV-003",
    productId: "PROD-003",
    name: "White MDF Frame",
    sku: "BG-FRM-003",
    category: "MDF Frame",
    size: "1 Inch",
    location: "Production Store",
    available: 12,
    reserved: 4,
    reorderLevel: 20,
    unit: "Piece",
  },
  {
    id: "INV-004",
    productId: "PROD-004",
    name: "Golden Designer Frame",
    sku: "BG-FRM-004",
    category: "Designer Frame",
    size: "3 Inch",
    location: "Main Warehouse",
    available: 0,
    reserved: 0,
    reorderLevel: 10,
    unit: "Piece",
  },
  {
    id: "INV-005",
    productId: "PROD-005",
    name: "Frame Back Board",
    sku: "BG-BRD-001",
    category: "Raw Material",
    size: "12x18",
    location: "Raw Material Store",
    available: 145,
    reserved: 20,
    reorderLevel: 50,
    unit: "Piece",
  },
  {
    id: "INV-006",
    productId: "PROD-006",
    name: "Glass Sheet",
    sku: "BG-GLS-001",
    category: "Raw Material",
    size: "12x18",
    location: "Glass Store",
    available: 85,
    reserved: 12,
    reorderLevel: 30,
    unit: "Sheet",
  },
  {
    id: "INV-007",
    productId: "PROD-007",
    name: "Metal Frame Clip",
    sku: "BG-CLP-001",
    category: "Accessories",
    size: "Small",
    location: "Accessories Store",
    available: 520,
    reserved: 50,
    reorderLevel: 100,
    unit: "Piece",
  },
  {
    id: "INV-008",
    productId: "PROD-008",
    name: "Photo Printing Paper",
    sku: "BG-PPR-001",
    category: "Printing Material",
    size: "A4",
    location: "Printing Store",
    available: 8,
    reserved: 2,
    reorderLevel: 25,
    unit: "Pack",
  },
];

const Inventory = () => {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [status, setStatus] = useState("All");
  const [location, setLocation] = useState("All");

  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatus = (item) => {
    if (item.available === 0) return "Out of Stock";
    if (item.available <= item.reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const searchableText = [
        item.name,
        item.sku,
        item.category,
        item.size,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        search.toLowerCase()
      );

      const matchesCategory =
        category === "All" || item.category === category;

      const matchesSize =
        size === "All" || item.size === size;

      const matchesLocation =
        location === "All" || item.location === location;

      const itemStatus = getStatus(item);

      const matchesStatus =
        status === "All" || itemStatus === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesLocation &&
        matchesStatus
      );
    });
  }, [inventory, search, category, size, status, location]);

  const summary = useMemo(() => {
    const totalProducts = inventory.length;

    const totalUnits = inventory.reduce(
      (sum, item) => sum + item.available,
      0
    );

    const lowStock = inventory.filter(
      (item) =>
        item.available > 0 &&
        item.available <= item.reorderLevel
    ).length;

    const outOfStock = inventory.filter(
      (item) => item.available === 0
    ).length;

    return {
      totalProducts,
      totalUnits,
      lowStock,
      outOfStock,
    };
  }, [inventory]);

  const categories = [
    "All",
    ...new Set(inventory.map((item) => item.category)),
  ];

  const sizes = [
    "All",
    ...new Set(inventory.map((item) => item.size)),
  ];

  const locations = [
    "All",
    ...new Set(inventory.map((item) => item.location)),
  ];

  const handleStockMovement = ({
    inventoryId,
    type,
    quantity,
    reason,
  }) => {
    setInventory((current) =>
      current.map((item) => {
        if (item.id !== inventoryId) return item;

        let newAvailable = item.available;

        if (type === "in") {
          newAvailable += quantity;
        }

        if (type === "out") {
          newAvailable = Math.max(
            0,
            newAvailable - quantity
          );
        }

        return {
          ...item,
          available: newAvailable,
        };
      })
    );

    setShowMovementModal(false);
  };

  const handleAdjustment = ({
    inventoryId,
    quantity,
    reason,
  }) => {
    setInventory((current) =>
      current.map((item) =>
        item.id === inventoryId
          ? {
              ...item,
              available: Math.max(0, quantity),
            }
          : item
      )
    );

    setShowAdjustmentModal(false);
  };

  const handleViewDetails = (item) => {
    setSelectedInventory(item);
    setShowDetails(true);
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <InventoryHeader
          onStockMovement={() =>
            setShowMovementModal(true)
          }
          onStockAdjustment={() =>
            setShowAdjustmentModal(true)
          }
        />

        <InventorySummary summary={summary} />

        <InventoryFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          size={size}
          setSize={setSize}
          status={status}
          setStatus={setStatus}
          location={location}
          setLocation={setLocation}
          categories={categories}
          sizes={sizes}
          locations={locations}
        />

        <InventoryTable
          inventory={filteredInventory}
          getStatus={getStatus}
          onViewDetails={handleViewDetails}
          onStockMovement={(item) => {
            setSelectedInventory(item);
            setShowMovementModal(true);
          }}
          onStockAdjustment={(item) => {
            setSelectedInventory(item);
            setShowAdjustmentModal(true);
          }}
        />
      </div>

      <StockMovementModal
        open={showMovementModal}
        inventory={inventory}
        selectedInventory={selectedInventory}
        onClose={() => {
          setShowMovementModal(false);
          setSelectedInventory(null);
        }}
        onSubmit={handleStockMovement}
      />

      <StockAdjustmentModal
        open={showAdjustmentModal}
        inventory={inventory}
        selectedInventory={selectedInventory}
        onClose={() => {
          setShowAdjustmentModal(false);
          setSelectedInventory(null);
        }}
        onSubmit={handleAdjustment}
      />

      <InventoryDetails
        open={showDetails}
        inventory={selectedInventory}
        getStatus={getStatus}
        onClose={() => {
          setShowDetails(false);
          setSelectedInventory(null);
        }}
      />
    </div>
  );
};

export default Inventory;