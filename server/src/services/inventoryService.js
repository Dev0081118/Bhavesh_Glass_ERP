const mongoose =
  require("mongoose");

const {
  Product,
  Inventory,
  StockTransaction,
  Notification,
  User,
} = require("../models");

const roundQuantity = (
  value
) =>
  Math.round(
    (
      Number(value) +
      Number.EPSILON
    ) *
      1000000
  ) / 1000000;

const getConversion = (
  product
) =>
  (
    product?.conversions ||
    []
  )[0] || null;

const getStockUnit = (
  product
) => {
  const entryUnit =
    String(
      product?.unit ||
        "Piece"
    );

  const conversion =
    getConversion(
      product
    );

  const factor =
    Number(
      conversion?.factor
    );

  const convertibleUnit =
    String(
      conversion?.unit ||
        ""
    );

  const canPromote =
    Boolean(
      product?.conversionEnabled
    ) &&
    Boolean(
      convertibleUnit
    ) &&
    Number.isFinite(
      factor
    ) &&
    factor >= 1 &&
    convertibleUnit.toLowerCase() !==
      entryUnit.toLowerCase();

  return canPromote
    ? convertibleUnit
    : entryUnit;
};

const getStockFactor = (
  product
) => {
  const stockUnit =
    String(
      getStockUnit(
        product
      )
    ).toLowerCase();

  const entryUnit =
    String(
      product?.unit ||
        ""
    ).toLowerCase();

  if (
    stockUnit ===
    entryUnit
  ) {
    return 1;
  }

  const conversion =
    (
      product?.conversions ||
      []
    ).find(
      (item) =>
        String(
          item.unit
        ).toLowerCase() ===
        stockUnit
    );

  const factor =
    Number(
      conversion?.factor
    );

  return Number.isFinite(
    factor
  ) &&
    factor > 0
    ? factor
    : 1;
};

const getUnitFactors = (
  product
) => {
  const factors = {};

  const entryUnit =
    String(
      product?.unit ||
        ""
    ).toLowerCase();

  if (entryUnit) {
    factors[
      entryUnit
    ] = 1;
  }

  (
    product?.conversions ||
    []
  ).forEach(
    (conversion) => {
      const unit =
        String(
          conversion?.unit ||
            ""
        ).toLowerCase();

      const factor =
        Number(
          conversion?.factor
        );

      if (
        unit &&
        Number.isFinite(
          factor
        ) &&
        factor > 0
      ) {
        factors[
          unit
        ] =
          factor;
      }
    }
  );

  return factors;
};

const getProduct =
  async (
    productId
  ) => {
    if (
      !mongoose.isValidObjectId(
        productId
      )
    ) {
      throw new Error(
        "Invalid product ID."
      );
    }

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      throw new Error(
        "Product not found."
      );
    }

    return product;
  };

const convertToPrimary =
  (
    product,
    quantity,
    unit
  ) => {
    const value =
      Number(
        quantity
      );

    if (
      !Number.isFinite(
        value
      ) ||
      value < 0
    ) {
      throw new Error(
        "Invalid stock quantity."
      );
    }

    const requestedUnit =
      String(
        unit ||
          product.unit
      ).toLowerCase();

    const primaryUnit =
      String(
        product.unit
      ).toLowerCase();

    if (
      requestedUnit ===
      primaryUnit
    ) {
      return roundQuantity(
        value
      );
    }

    const conversion =
      product.conversions?.find(
        (item) =>
          String(
            item.unit
          ).toLowerCase() ===
          requestedUnit
      );

    if (
      !product.conversionEnabled ||
      !conversion
    ) {
      throw new Error(
        `No conversion from ${unit} to ${product.unit} exists for ${product.name}.`
      );
    }

    return roundQuantity(
      value /
        Number(
          conversion.factor
        )
    );
  };

const convertToStockUnit =
  (
    product,
    quantity,
    unit
  ) => {
    const value =
      Number(
        quantity
      );

    if (
      !Number.isFinite(
        value
      ) ||
      value < 0
    ) {
      throw new Error(
        "Invalid stock quantity."
      );
    }

    const stockUnit =
      getStockUnit(
        product
      );

    const requestedUnit =
      String(
        unit ||
          product.unit
      ).toLowerCase();

    if (
      requestedUnit ===
      stockUnit.toLowerCase()
    ) {
      return roundQuantity(
        value
      );
    }

    const primaryQuantity =
      convertToPrimary(
        product,
        value,
        unit ||
          product.unit
      );

    return roundQuantity(
      primaryQuantity *
        getStockFactor(
          product
        )
    );
  };

const ensureInventory =
  async (
    product,
    location
  ) => {
    let inventory =
      await Inventory.findOne({
        product:
          product._id,
      });

    if (!inventory) {
      inventory =
        await Inventory.create({
          product:
            product._id,

          quantity: 0,

          reservedQuantity:
            0,

          availableQuantity:
            0,

          location:
            location ||
            product.location ||
            "Main Warehouse",
        });
    }

    return inventory;
  };

const updateLowStockNotification =
  async (
    product,
    inventory
  ) => {
    if (
      !product.assignedTo
    ) {
      return;
    }

    const assigned =
      await User.findOne({
        _id:
          product.assignedTo,
        status:
          "Active",
      }).select("_id");

    const existing =
      await Notification.findOne({
        user:
          product.assignedTo,

        product:
          product._id,

        type:
          "LOW_STOCK",

        status:
          "Active",
      });

    /*
     * If responsible user was deactivated,
     * resolve any old active alert.
     */
    if (!assigned) {
      if (existing) {
        existing.status =
          "Resolved";

        await existing.save();
      }

      return;
    }

    const minimum =
      Number(
        product.minimumStockLevel ||
          0
      );

    const available =
      Number(
        inventory.availableQuantity ||
          0
      );

    const stockUnit =
      getStockUnit(
        product
      );

    if (
      minimum > 0 &&
      available <= minimum
    ) {
      const message =
        `${product.name} has reached ` +
        `${available} ${stockUnit}. ` +
        `Minimum stock level is ${minimum} ${stockUnit}.`;

      if (!existing) {
        await Notification.create({
          user:
            product.assignedTo,

          product:
            product._id,

          type:
            "LOW_STOCK",

          title:
            "Low Stock Alert",

          message,
        });
      } else if (
        existing.message !==
        message
      ) {
        existing.message =
          message;

        existing.readAt =
          null;

        await existing.save();
      }

      return;
    }

    if (existing) {
      existing.status =
        "Resolved";

      await existing.save();
    }
  };

const applyStockMovement =
  async ({
    productId,

    type,

    source,

    quantity,

    unit,

    referenceType,

    referenceId,

    reason,

    createdBy,

    location,
  }) => {
    const product =
      await getProduct(
        productId
      );

    const stockQuantity =
      convertToStockUnit(
        product,
        quantity,
        unit ||
          product.unit
      );

    if (
      stockQuantity <= 0
    ) {
      throw new Error(
        "Quantity must be greater than zero."
      );
    }

    const inventory =
      await ensureInventory(
        product,
        location
      );

    const previousStock =
      Number(
        inventory.availableQuantity ||
          0
      );

    const stockUnit =
      getStockUnit(
        product
      );

    if (
      type ===
        "OUT" &&
      stockQuantity >
        previousStock
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available stock is ${previousStock} ${stockUnit}, but ${stockQuantity} ${stockUnit} is required.`
      );
    }

    const difference =
      type ===
      "OUT"
        ? -stockQuantity
        : stockQuantity;

    const newStock =
      roundQuantity(
        previousStock +
          difference
      );

    inventory.availableQuantity =
      newStock;

    inventory.quantity =
      roundQuantity(
        newStock +
          Number(
            inventory.reservedQuantity ||
              0
          )
      );

    inventory.lastMovementAt =
      new Date();

    inventory.lastMovementType =
      `${source}:${type}`;

    if (location) {
      inventory.location =
        location;
    }

    await inventory.save();

    const transaction =
      await StockTransaction.create({
        product:
          product._id,

        inventory:
          inventory._id,

        type,

        source,

        quantity:
          Number(
            quantity
          ),

        unit:
          unit ||
          product.unit,

        primaryQuantity:
          stockQuantity,

        previousStock,

        newStock,

        referenceType:
          referenceType ||
          "",

        referenceId:
          mongoose.isValidObjectId(
            referenceId
          )
            ? referenceId
            : null,

        reason:
          reason ||
          "",

        createdBy:
          mongoose.isValidObjectId(
            createdBy
          )
            ? createdBy
            : null,
      });

    await updateLowStockNotification(
      product,
      inventory
    );

    return {
      inventory,
      product,
      transaction,
    };
  };

/*
 * Validate the entire collection BEFORE changing stock.
 *
 * This prevents:
 * item #1 deducted successfully
 * item #2 deducted successfully
 * item #3 fails because stock is unavailable
 *
 * from leaving a partially applied business transaction.
 */
const validateStockMovements =
  async (
    movements = []
  ) => {
    const state =
      new Map();

    for (
      const movement of
      movements
    ) {
      const product =
        await getProduct(
          movement.productId
        );

      const productId =
        String(
          product._id
        );

      if (
        !state.has(
          productId
        )
      ) {
        const inventory =
          await Inventory.findOne({
            product:
              product._id,
          });

        state.set(
          productId,
          {
            product,

            available:
              Number(
                inventory
                  ?.availableQuantity ||
                  0
              ),
          }
        );
      }

      const current =
        state.get(
          productId
        );

      const stockQuantity =
        convertToStockUnit(
          product,
          movement.quantity,
          movement.unit ||
            product.unit
        );

      if (
        stockQuantity <= 0
      ) {
        throw new Error(
          `Quantity for ${product.name} must be greater than zero.`
        );
      }

      if (
        movement.type ===
        "OUT"
      ) {
        if (
          stockQuantity >
          current.available
        ) {
          throw new Error(
            `Only ${current.available} ${getStockUnit(
              product
            )} of ${product.name} are available. ${stockQuantity} ${getStockUnit(
              product
            )} are required.`
          );
        }

        current.available =
          roundQuantity(
            current.available -
              stockQuantity
          );
      } else {
        current.available =
          roundQuantity(
            current.available +
              stockQuantity
          );
      }
    }

    return true;
  };

/*
 * Standalone MongoDB friendly safe batch.
 *
 * All movements are prevalidated first.
 * If a database failure still occurs during application,
 * already-applied movements are compensated in reverse.
 */
const applyStockMovementsSafely =
  async (
    movements = []
  ) => {
    const meaningful =
      movements.filter(
        (movement) =>
          Number(
            movement.quantity
          ) > 0
      );

    if (
      meaningful.length ===
      0
    ) {
      return [];
    }

    await validateStockMovements(
      meaningful
    );

    const applied = [];

    try {
      for (
        const movement of
        meaningful
      ) {
        const result =
          await applyStockMovement(
            movement
          );

        applied.push({
          movement,
          result,
        });
      }

      return applied.map(
        (item) =>
          item.result
      );
    } catch (error) {
      /*
       * Compensate successful movements if a later
       * database operation unexpectedly fails.
       */
      for (
        let index =
          applied.length - 1;
        index >= 0;
        index -= 1
      ) {
        const {
          movement,
        } =
          applied[index];

        try {
          await applyStockMovement({
            productId:
              movement.productId,

            type:
              movement.type ===
              "IN"
                ? "OUT"
                : "IN",

            source:
              "SYSTEM_ROLLBACK",

            quantity:
              movement.quantity,

            unit:
              movement.unit,

            referenceType:
              movement.referenceType,

            referenceId:
              movement.referenceId,

            reason:
              `Automatic rollback: ${
                movement.reason ||
                "stock movement"
              }`,

            createdBy:
              movement.createdBy,

            location:
              movement.location,
          });
        } catch (
          rollbackError
        ) {
          console.error(
            "CRITICAL STOCK ROLLBACK FAILURE:",
            rollbackError
          );
        }
      }

      throw error;
    }
  };

const adjustStock =
  async ({
    inventoryId,
    quantity,
    reason,
    createdBy,
  }) => {
    if (
      !mongoose.isValidObjectId(
        inventoryId
      )
    ) {
      throw new Error(
        "Invalid inventory ID."
      );
    }

    const inventory =
      await Inventory.findById(
        inventoryId
      );

    if (!inventory) {
      throw new Error(
        "Inventory record not found."
      );
    }

    const product =
      await getProduct(
        inventory.product
      );

    const stockUnit =
      getStockUnit(
        product
      );

    const newStock =
      roundQuantity(
        Number(
          quantity
        )
      );

    if (
      !Number.isFinite(
        newStock
      ) ||
      newStock < 0
    ) {
      throw new Error(
        "Stock cannot be negative."
      );
    }

    const previousStock =
      Number(
        inventory.availableQuantity ||
          0
      );

    inventory.availableQuantity =
      newStock;

    inventory.quantity =
      roundQuantity(
        newStock +
          Number(
            inventory.reservedQuantity ||
              0
          )
      );

    inventory.lastMovementAt =
      new Date();

    inventory.lastMovementType =
      "ADJUSTMENT";

    await inventory.save();

    const transaction =
      await StockTransaction.create({
        product:
          product._id,

        inventory:
          inventory._id,

        type:
          "ADJUSTMENT",

        source:
          "ADJUSTMENT",

        quantity:
          Math.abs(
            newStock -
              previousStock
          ),

        unit:
          stockUnit,

        primaryQuantity:
          newStock -
          previousStock,

        previousStock,

        newStock,

        reason:
          reason ||
          "Manual stock adjustment",

        createdBy:
          mongoose.isValidObjectId(
            createdBy
          )
            ? createdBy
            : null,
      });

    await updateLowStockNotification(
      product,
      inventory
    );

    return {
      inventory,
      transaction,
    };
  };

const syncInventoryStockUnit =
  async (
    previousProduct,
    nextProduct
  ) => {
    const previousUnit =
      getStockUnit(
        previousProduct
      );

    const nextUnit =
      getStockUnit(
        nextProduct
      );

    if (
      previousUnit.toLowerCase() ===
      nextUnit.toLowerCase()
    ) {
      return null;
    }

    const inventory =
      await Inventory.findOne({
        product:
          nextProduct._id,
      });

    if (
      !inventory ||
      Number(
        inventory.quantity ||
          0
      ) <= 0
    ) {
      return null;
    }

    const previousRate =
      getUnitFactors(
        previousProduct
      )[
        previousUnit.toLowerCase()
      ] || 1;

    const nextRate =
      getUnitFactors(
        nextProduct
      )[
        nextUnit.toLowerCase()
      ] || 1;

    const convert = (
      value
    ) =>
      roundQuantity(
        (
          Number(
            value ||
              0
          ) /
          previousRate
        ) *
          nextRate
      );

    inventory.availableQuantity =
      convert(
        inventory.availableQuantity
      );

    inventory.reservedQuantity =
      convert(
        inventory.reservedQuantity
      );

    inventory.quantity =
      convert(
        inventory.quantity
      );

    await inventory.save();

    return {
      previousUnit,
      nextUnit,
    };
  };

module.exports = {
  getProduct,
  getConversion,
  getStockUnit,
  getStockFactor,
  getUnitFactors,
  convertToPrimary,
  convertToStockUnit,

  syncInventoryStockUnit,

  ensureInventory,

  updateLowStockNotification,

  applyStockMovement,

  validateStockMovements,

  applyStockMovementsSafely,

  adjustStock,
};