import {
  useEffect,
  useMemo,
  useState,
} from "react";

import InventoryHeader from "./InventoryHeader";
import InventorySummary from "./InventorySummary";
import InventoryFilters from "./InventoryFilters";
import InventoryTable from "./InventoryTable";
import StockMovementModal from "./StockMovementModal";
import StockAdjustmentModal from "./StockAdjustmentModal";
import InventoryDetails from "./InventoryDetails";

import {
  listResource,
  moveInventoryStock,
  adjustInventoryStock,
  getInventoryMovements,
} from "../../lib/api";

import {
  getStockUnit,
  getStockRate,
  toEntryQuantity,
} from "../../lib/units";

const frameSize = (
  product
) => {
  if (
    !product?.isFrame ||
    !product.frameSize?.width ||
    !product.frameSize?.height
  ) {
    return "";
  }

  return `${product.frameSize.width}x${product.frameSize.height} ${product.frameSize.unit}`;
};

const normalizeInventory = (
  item
) => {
  const product =
    item.product &&
    typeof item.product ===
      "object"
      ? item.product
      : null;

  /*
   * Server sends the stock unit metadata, but the fallback
   * keeps old cached rows working too.
   */
  const unitSource = {
    ...(product || {}),

    stockUnit:
      item.stockUnit ||
      product?.stockUnit ||
      "",

    entryUnit:
      item.entryUnit ||
      product?.unit ||
      "",

    stockFactor:
      Number(item.stockFactor) ||
      Number(product?.stockFactor) ||
      0,
  };

  const stockUnit =
    getStockUnit(unitSource);

  const entryUnit =
    unitSource.entryUnit ||
    stockUnit;

  const stockFactor =
    getStockRate(unitSource);

  const available =
    Number(
      item.availableQuantity || 0
    );

  return {
    ...item,

    id:
      item._id ||
      item.id,

    productId:
      item.product?._id ||
      item.product,

    name:
      item.product?.name ||
      "Unknown product",

    sku:
      item.product?.sku ||
      "",

    category:
      item.product?.category ||
      "",

    type:
      item.product?.type ||
      "",

    size:
      frameSize(
        item.product
      ),

    // Stock is counted in the stock unit (Piece).
    unit: stockUnit,

    stockUnit,

    entryUnit,

    stockFactor,

    conversions:
      item.product
        ?.conversions ||
      [],

    conversionEnabled:
      Boolean(
        item.product
          ?.conversionEnabled
      ),

    minimumStockLevel:
      Number(
        item.minimumStockLevel ??
          item.product
            ?.minimumStockLevel ??
          0
      ),

    assignedTo:
      item.product
        ?.assignedTo ||
      null,

    available,

    // Same stock expressed in the Primary Unit (Sheet).
    availableEntry: toEntryQuantity(
      available,
      {
        ...unitSource,
        entryUnit,
        stockFactor,
      }
    ),

    reserved:
      Number(
        item.reservedQuantity ||
          0
      ),

    total:
      Number(
        item.quantity ||
          0
      ),

    location:
      item.location ||
      item.product?.location ||
      "",
  };
};

export default function Inventory({
  token,
}) {
  const [
    inventory,
    setInventory,
  ] = useState([]);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    size,
    setSize,
  ] = useState("All");

  const [
    status,
    setStatus,
  ] = useState("All");

  const [
    location,
    setLocation,
  ] = useState("All");

  const [
    selectedInventory,
    setSelectedInventory,
  ] = useState(null);

  const [
    showMovementModal,
    setShowMovementModal,
  ] = useState(false);

  const [
    showAdjustmentModal,
    setShowAdjustmentModal,
  ] = useState(false);

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [
    movements,
    setMovements,
  ] = useState([]);

  const loadInventory =
    async () => {
      try {
        const result =
          await listResource(
            token,
            "inventory"
          );

        setInventory(
          result.data.map(
            normalizeInventory
          )
        );
      } catch (loadError) {
        setError(
          loadError.message
        );
      }
    };

  useEffect(() => {
    if (!token) return;

    loadInventory();
  }, [token]);

  const getStatus = (
    item
  ) => {
    if (
      item.available <= 0
    ) {
      return "Out of Stock";
    }

    if (
      item.minimumStockLevel >
        0 &&
      item.available <=
        item.minimumStockLevel
    ) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const filteredInventory =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return inventory.filter(
        (item) => {
          const matchesSearch =
            !query ||
            [
              item.name,
              item.sku,
              item.category,
              item.size,
            ]
              .join(" ")
              .toLowerCase()
              .includes(query);

          return (
            matchesSearch &&
            (category ===
              "All" ||
              item.category ===
                category) &&
            (size ===
              "All" ||
              item.size ===
                size) &&
            (location ===
              "All" ||
              item.location ===
                location) &&
            (status ===
              "All" ||
              getStatus(
                item
              ) === status)
          );
        }
      );
    }, [
      inventory,
      search,
      category,
      size,
      status,
      location,
    ]);

  const summary =
    useMemo(() => {
      const totalProducts =
        inventory.length;

      const inStock =
        inventory.filter(
          (item) =>
            getStatus(
              item
            ) === "In Stock"
        ).length;

      const lowStock =
        inventory.filter(
          (item) =>
            getStatus(
              item
            ) === "Low Stock"
        ).length;

      const outOfStock =
        inventory.filter(
          (item) =>
            getStatus(
              item
            ) ===
            "Out of Stock"
        ).length;

      return {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
      };
    }, [inventory]);

  const categories = [
    "All",
    ...new Set(
      inventory
        .map(
          (item) =>
            item.category
        )
        .filter(Boolean)
    ),
  ];

  const sizes = [
    "All",
    ...new Set(
      inventory
        .map(
          (item) =>
            item.size
        )
        .filter(Boolean)
    ),
  ];

  const locations = [
    "All",
    ...new Set(
      inventory
        .map(
          (item) =>
            item.location
        )
        .filter(Boolean)
    ),
  ];

  const replaceInventory = (
    updated
  ) => {
    const normalized =
      normalizeInventory(
        updated
      );

    setInventory(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            normalized.id
              ? normalized
              : item
        )
    );

    setSelectedInventory(
      normalized
    );
  };

  const handleMovement =
    async (data) => {
      try {
        const result =
          await moveInventoryStock(
            token,
            data.inventoryId,
            {
              type:
                data.type,

              quantity:
                data.quantity,

              unit:
                data.unit,

              reason:
                data.reason,
            }
          );

        replaceInventory(
          result.data
        );

        setShowMovementModal(
          false
        );
      } catch (movementError) {
        setError(
          movementError.message
        );
      }
    };

  const handleAdjustment =
    async (data) => {
      try {
        const result =
          await adjustInventoryStock(
            token,
            data.inventoryId,
            {
              quantity:
                data.quantity,

              reason:
                data.reason,
            }
          );

        replaceInventory(
          result.data
        );

        setShowAdjustmentModal(
          false
        );
      } catch (adjustmentError) {
        setError(
          adjustmentError.message
        );
      }
    };

  const handleDetails =
    async (item) => {
      setSelectedInventory(
        item
      );

      setShowDetails(true);

      try {
        const result =
          await getInventoryMovements(
            token,
            item.id
          );

        setMovements(
          result.data || []
        );
      } catch {
        setMovements([]);
      }
    };

  return (
    <div className="min-h-full p-4 sm:p-6">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-[1600px] space-y-6">
        <InventoryHeader
          onStockMovement={() => {
            setSelectedInventory(
              null
            );

            setShowMovementModal(
              true
            );
          }}
          onStockAdjustment={() => {
            setSelectedInventory(
              null
            );

            setShowAdjustmentModal(
              true
            );
          }}
        />

        <InventorySummary
          summary={
            summary
          }
        />

        <InventoryFilters
          search={search}
          setSearch={
            setSearch
          }
          category={
            category
          }
          setCategory={
            setCategory
          }
          size={size}
          setSize={
            setSize
          }
          status={
            status
          }
          setStatus={
            setStatus
          }
          location={
            location
          }
          setLocation={
            setLocation
          }
          categories={
            categories
          }
          sizes={sizes}
          locations={
            locations
          }
        />

        <InventoryTable
          inventory={
            filteredInventory
          }
          getStatus={
            getStatus
          }
          onViewDetails={
            handleDetails
          }
          onStockMovement={(
            item
          ) => {
            setSelectedInventory(
              item
            );

            setShowMovementModal(
              true
            );
          }}
          onStockAdjustment={(
            item
          ) => {
            setSelectedInventory(
              item
            );

            setShowAdjustmentModal(
              true
            );
          }}
        />
      </div>

      <StockMovementModal
        open={
          showMovementModal
        }
        inventory={
          inventory
        }
        selectedInventory={
          selectedInventory
        }
        onClose={() => {
          setShowMovementModal(
            false
          );

          setSelectedInventory(
            null
          );
        }}
        onSubmit={
          handleMovement
        }
      />

      <StockAdjustmentModal
        open={
          showAdjustmentModal
        }
        inventory={
          inventory
        }
        selectedInventory={
          selectedInventory
        }
        onClose={() => {
          setShowAdjustmentModal(
            false
          );

          setSelectedInventory(
            null
          );
        }}
        onSubmit={
          handleAdjustment
        }
      />

      <InventoryDetails
        open={
          showDetails
        }
        inventory={
          selectedInventory
        }
        movements={
          movements
        }
        getStatus={
          getStatus
        }
        onClose={() => {
          setShowDetails(
            false
          );

          setSelectedInventory(
            null
          );

          setMovements([]);
        }}
      />
    </div>
  );
}