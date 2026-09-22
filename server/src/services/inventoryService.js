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
      if (!existing) {
        await Notification.create({
          user: product.assignedTo,

          product: product._id,

          type: "LOW_STOCK",

          title: "Low Stock Alert",

          message:
            `${product.name} has reached ` +
            `${available} ${product.unit}. ` +
            `Minimum stock level is ${minimum} ${product.unit}.`,
        });
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

    const primaryQuantity =
      convertToPrimary(
        product,
        quantity,
        unit || product.unit
      );

    if (
      primaryQuantity <= 0
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

    if (
      type === "OUT" &&
      primaryQuantity >
        previousStock
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}. ` +
          `Available stock is ${previousStock} ${product.unit}.`
      );
    }

    const difference =
      type === "OUT"
        ? -primaryQuantity
        : primaryQuantity;

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

          primaryQuantity,

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

          unit: product.unit,

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

module.exports = {
  getProduct,
  convertToPrimary,
  ensureInventory,
  applyStockMovement,
  adjustStock,
};