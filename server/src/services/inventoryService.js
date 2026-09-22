const mongoose = require("mongoose");

const {
  Product,
  Inventory,
  StockTransaction,
  Notification,
} = require("../models");

const roundQuantity = (value) =>
  Math.round(
    (Number(value) + Number.EPSILON) *
      1000000
  ) / 1000000;

const getConversion = (product) =>
  (product?.conversions || [])[0] ||
  null;

/*
 * Primary Unit  = the unit a product is bought / created in.
 * Stock Unit    = the unit Inventory counts in.
 *
 * When conversion is enabled the convertible unit (1 Sheet =
 * 50 Piece -> Piece) becomes the stock unit, so stock, minimum
 * stock level and every movement talk about the same unit.
 *
 * The converted unit is only promoted when it is the smaller
 * one (factor >= 1), otherwise stock would shrink instead.
 */
const getStockUnit = (product) => {
  const entryUnit = String(
    product?.unit || "Piece"
  );

  const conversion =
    getConversion(product);

  const factor = Number(
    conversion?.factor
  );

  const convertibleUnit = String(
    conversion?.unit || ""
  );

  const canPromote =
    Boolean(
      product?.conversionEnabled
    ) &&
    Boolean(convertibleUnit) &&
    Number.isFinite(factor) &&
    factor >= 1 &&
    convertibleUnit.toLowerCase() !==
      entryUnit.toLowerCase();

  return canPromote
    ? convertibleUnit
    : entryUnit;
};

/*
 * How many stock units 1 Primary Unit is worth.
 * 1 Sheet = 50 Piece -> 50
 */
const getStockFactor = (product) => {
  const stockUnit = String(
    getStockUnit(product)
  ).toLowerCase();

  const entryUnit = String(
    product?.unit || ""
  ).toLowerCase();

  if (stockUnit === entryUnit) {
    return 1;
  }

  const conversion =
    (product?.conversions || []).find(
      (item) =>
        String(item.unit).toLowerCase() ===
        stockUnit
    );

  const factor = Number(
    conversion?.factor
  );

  return Number.isFinite(factor) &&
    factor > 0
    ? factor
    : 1;
};

/*
 * Rate of a single unit against the Primary Unit.
 * Primary Unit -> 1
 * Convertible Unit -> its factor
 */
const getUnitFactors = (product) => {
  const factors = {};

  const entryUnit = String(
    product?.unit || ""
  ).toLowerCase();

  if (entryUnit) {
    factors[entryUnit] = 1;
  }

  (product?.conversions || []).forEach(
    (conversion) => {
      const unit = String(
        conversion?.unit || ""
      ).toLowerCase();

      const factor = Number(
        conversion?.factor
      );

      if (
        unit &&
        Number.isFinite(factor) &&
        factor > 0
      ) {
        factors[unit] = factor;
      }
    }
  );

  return factors;
};

const getProduct = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new Error(
      "Invalid product ID."
    );
  }

  const product =
    await Product.findById(productId);

  if (!product) {
    throw new Error(
      "Product not found."
    );
  }

  return product;
};

/*
 * Example:
 *
 * Primary Unit = Sheet
 *
 * 1 Sheet = 50 Pieces
 *
 * quantity = 100
 * unit = Piece
 *
 * primary quantity = 2 Sheets
 */
const convertToPrimary = (
  product,
  quantity,
  unit
) => {
  const value = Number(quantity);

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      "Invalid stock quantity."
    );
  }

  const requestedUnit =
    String(
      unit || product.unit
    ).toLowerCase();

  const primaryUnit =
    String(
      product.unit
    ).toLowerCase();

  if (
    requestedUnit === primaryUnit
  ) {
    return roundQuantity(value);
  }

  const conversion =
    product.conversions?.find(
      (item) =>
        String(item.unit)
          .toLowerCase() ===
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
      Number(conversion.factor)
  );
};

/*
 * Converts any quantity the user typed into the unit
 * Inventory counts in (the stock unit).
 *
 * Example:
 *
 * Primary Unit = Sheet, 1 Sheet = 50 Piece
 * Stock Unit   = Piece
 *
 * quantity = 10, unit = Sheet
 * stock quantity = 500 Piece
 *
 * quantity = 500, unit = Piece
 * stock quantity = 500 Piece
 */
const convertToStockUnit = (
  product,
  quantity,
  unit
) => {
  const value = Number(quantity);

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      "Invalid stock quantity."
    );
  }

  const stockUnit =
    getStockUnit(product);

  const requestedUnit =
    String(
      unit || product.unit
    ).toLowerCase();

  if (
    requestedUnit ===
    stockUnit.toLowerCase()
  ) {
    return roundQuantity(value);
  }

  const primaryQuantity =
    convertToPrimary(
      product,
      value,
      unit || product.unit
    );

  return roundQuantity(
    primaryQuantity *
      getStockFactor(product)
  );
};

const ensureInventory = async (
  product,
  location
) => {
  let inventory =
    await Inventory.findOne({
      product: product._id,
    });

  if (!inventory) {
    inventory =
      await Inventory.create({
        product: product._id,

        quantity: 0,

        reservedQuantity: 0,

        availableQuantity: 0,

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
    if (!product.assignedTo) {
      return;
    }

    const minimum =
      Number(
        product.minimumStockLevel || 0
      );

    const available =
      Number(
        inventory.availableQuantity || 0
      );

    /*
     * Stock and minimum stock level are both counted in
     * the product stock unit, so they compare directly.
     */
    const stockUnit =
      getStockUnit(product);

    const existing =
      await Notification.findOne({
        user: product.assignedTo,
        product: product._id,
        type: "LOW_STOCK",
        status: "Active",
      });

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
          user: product.assignedTo,

          product: product._id,

          type: "LOW_STOCK",

          title: "Low Stock Alert",

          message,
        });
      } else if (
        existing.message !== message
      ) {
        existing.message = message;

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
      await getProduct(productId);

    const stockQuantity =
      convertToStockUnit(
        product,
        quantity,
        unit || product.unit
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
      getStockUnit(product);

    if (
      type === "OUT" &&
      stockQuantity >
        previousStock
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}. ` +
          `Available stock is ${previousStock} ${stockUnit}.`
      );
    }

    const difference =
      type === "OUT"
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
      await StockTransaction.create(
        {
          product:
            product._id,

          inventory:
            inventory._id,

          type,

          source,

          quantity:
            Number(quantity),

          unit:
            unit ||
            product.unit,

          // Quantity converted into the product stock unit.
          primaryQuantity:
            stockQuantity,

          previousStock,

          newStock,

          referenceType:
            referenceType || "",

          referenceId:
            mongoose.isValidObjectId(
              referenceId
            )
              ? referenceId
              : null,

          reason:
            reason || "",

          createdBy:
            mongoose.isValidObjectId(
              createdBy
            )
              ? createdBy
              : null,
        }
      );

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

    /*
     * Physical counting is done in the unit the inventory
     * screen shows, which is the product stock unit.
     */
    const stockUnit =
      getStockUnit(product);

    const newStock =
      roundQuantity(
        Number(quantity)
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
      await StockTransaction.create(
        {
          product:
            product._id,

          inventory:
            inventory._id,

          type: "ADJUSTMENT",

          source: "ADJUSTMENT",

          quantity:
            Math.abs(
              newStock -
                previousStock
            ),

          unit: stockUnit,

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
        }
      );

    await updateLowStockNotification(
      product,
      inventory
    );

    return {
      inventory,
      transaction,
    };
  };

/*
 * Keeps stored stock meaningful when a product edit changes
 * the stock unit (for example unit conversion is switched
 * off, so stock goes from Piece back to Sheet).
 *
 * Stored numbers are reinterpreted through the Primary Unit:
 * oldValue / oldRate * newRate
 *
 * Stock history is left untouched, because every transaction
 * keeps the quantity + unit exactly as it was entered.
 */
const syncInventoryStockUnit =
  async (
    previousProduct,
    nextProduct
  ) => {
    const previousUnit =
      getStockUnit(previousProduct);

    const nextUnit =
      getStockUnit(nextProduct);

    if (
      previousUnit.toLowerCase() ===
      nextUnit.toLowerCase()
    ) {
      return null;
    }

    const inventory =
      await Inventory.findOne({
        product: nextProduct._id,
      });

    if (
      !inventory ||
      Number(inventory.quantity || 0) <= 0
    ) {
      return null;
    }

    const previousRate =
      getUnitFactors(previousProduct)[
        previousUnit.toLowerCase()
      ] || 1;

    const nextRate =
      getUnitFactors(nextProduct)[
        nextUnit.toLowerCase()
      ] || 1;

    const convert = (value) =>
      roundQuantity(
        (Number(value || 0) /
          previousRate) *
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

    inventory.quantity = convert(
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
  adjustStock,
};