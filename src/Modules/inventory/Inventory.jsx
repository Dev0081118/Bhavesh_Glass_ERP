import { useEffect, useMemo, useState } from "react";
import InventoryHeader from "./InventoryHeader";
import InventorySummary from "./InventorySummary";
import InventoryFilters from "./InventoryFilters";
import InventoryTable from "./InventoryTable";
import StockMovementModal from "./StockMovementModal";
import StockAdjustmentModal from "./StockAdjustmentModal";
import InventoryDetails from "./InventoryDetails";
import { listResource, updateResource } from "../../lib/api";

const normalizeInventory = (item) => ({
  ...item,
  id: item._id || item.id,
  productId: item.product?._id || item.productId,
  name: item.product?.name || item.name || "Unknown product",
  sku: item.product?.sku || item.sku || "",
  category: item.product?.category || item.category || "",
  size: item.product?.size || item.size || "",
  unit: item.product?.unit || item.unit || "Piece",
  available: item.availableQuantity ?? item.available ?? 0,
  reserved: item.reservedQuantity ?? item.reserved ?? 0,
  reorderLevel: item.reorderLevel ?? 0,
});

const Inventory = ({ token }) => {
  const [inventory, setInventory] = useState(
    token ? [] : INITIAL_INVENTORY
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    listResource(token, "inventory")
      .then((result) => setInventory(result.data.map(normalizeInventory)))
      .catch((loadError) => setError(loadError.message));
  }, [token]);

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

  const handleStockMovement = async ({
    inventoryId,
    type,
    quantity,
    reason,
  }) => {
    if (!token) return;

    const item = inventory.find((entry) => entry.id === inventoryId);
    if (!item) return;

    const newAvailable = type === "in"
      ? item.available + Number(quantity)
      : Math.max(0, item.available - Number(quantity));

    try {
      const result = await updateResource(token, "inventory", inventoryId, {
        quantity: newAvailable + item.reserved,
        availableQuantity: newAvailable,
        reservedQuantity: item.reserved,
        lastMovementAt: new Date().toISOString(),
      });
      setInventory((current) => current.map((entry) =>
        entry.id === inventoryId ? normalizeInventory(result.data) : entry
      ));
    } catch (movementError) {
      setError(movementError.message);
    }

    setShowMovementModal(false);
  };

  const handleAdjustment = async ({
    inventoryId,
    quantity,
    reason,
  }) => {
    if (!token) return;

    const item = inventory.find((entry) => entry.id === inventoryId);
    if (!item) return;

    try {
      const availableQuantity = Math.max(0, Number(quantity));
      const result = await updateResource(token, "inventory", inventoryId, {
        quantity: availableQuantity + item.reserved,
        availableQuantity,
        reservedQuantity: item.reserved,
        lastMovementAt: new Date().toISOString(),
      });
      setInventory((current) => current.map((entry) =>
        entry.id === inventoryId ? normalizeInventory(result.data) : entry
      ));
    } catch (adjustmentError) {
      setError(adjustmentError.message);
    }

    setShowAdjustmentModal(false);
  };

  const handleViewDetails = (item) => {
    setSelectedInventory(item);
    setShowDetails(true);
  };

  return (
    <div className="min-h-full p-4 sm:p-6 ">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
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