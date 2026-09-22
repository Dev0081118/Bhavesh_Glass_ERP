const mongoose = require("mongoose");

const {
  Inventory,
  StockTransaction,
} = require("../models");

const {
  applyStockMovement,
  adjustStock,
  getStockUnit,
  getStockFactor,
} = require(
  "../services/inventoryService"
);

const populateProduct = {
  path: "product",

  populate: {
    path: "assignedTo",

    select:
      "name email role department status",
  },
};

/*
 * Inventory quantities are always counted in the product
 * stock unit (the converted unit when conversion is enabled).
 * The client renders from these fields instead of re-deriving
 * the conversion on its own.
 */
const describeStockUnits = (inventory) => {
  const row =
    typeof inventory?.toObject ===
    "function"
      ? inventory.toObject()
      : {
          ...inventory,
        };

  const product =
    row.product &&
    typeof row.product === "object"
      ? row.product
      : null;

  const stockUnit = product
    ? getStockUnit(product)
    : "";

  return {
    ...row,

    stockUnit,

    entryUnit:
      product?.unit ||
      stockUnit,

    stockFactor: product
      ? getStockFactor(product)
      : 1,

    conversionFactor:
      Number(
        product?.conversions?.[0]
          ?.factor
      ) || 0,

    minimumStockLevel:
      Number(
        product?.minimumStockLevel ||
          0
      ),
  };
};

const listInventory =
  async (req, res) => {
    try {
      const inventory =
        await Inventory.find({})
          .populate(
            populateProduct
          )
          .sort({
            updatedAt: -1,
          });

      return res.json({
        data: inventory.map(
          describeStockUnits
        ),
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load inventory.",
        });
    }
  };

const getInventory =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid inventory ID.",
          });
      }

      const inventory =
        await Inventory.findById(
          req.params.id
        ).populate(
          populateProduct
        );

      if (!inventory) {
        return res
          .status(404)
          .json({
            message:
              "Inventory not found.",
          });
      }

      return res.json({
        data: describeStockUnits(
          inventory
        ),
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load inventory.",
        });
    }
  };

const moveStock =
  async (req, res) => {
    try {
      const inventory =
        await Inventory.findById(
          req.params.id
        );

      if (!inventory) {
        return res
          .status(404)
          .json({
            message:
              "Inventory not found.",
          });
      }

      const {
        type,
        quantity,
        unit,
        reason,
      } = req.body;

      const direction =
        type === "out"
          ? "OUT"
          : "IN";

      const result =
        await applyStockMovement(
          {
            productId:
              inventory.product,

            type:
              direction,

            source:
              "MANUAL",

            quantity,

            unit,

            reason:
              reason ||
              "Manual stock movement",

            createdBy:
              req.user?._id,
          }
        );

      const updated =
        await Inventory.findById(
          result.inventory._id
        ).populate(
          populateProduct
        );

      return res.json({
        data: describeStockUnits(
          updated
        ),
        transaction:
          result.transaction,
      });
    } catch (error) {
      return res
        .status(400)
        .json({
          message:
            error.message,
        });
    }
  };

const adjustInventory =
  async (req, res) => {
    try {
      const result =
        await adjustStock({
          inventoryId:
            req.params.id,

          quantity:
            req.body.quantity,

          reason:
            req.body.reason,

          createdBy:
            req.user?._id,
        });

      const updated =
        await Inventory.findById(
          result.inventory._id
        ).populate(
          populateProduct
        );

      return res.json({
        data: describeStockUnits(
          updated
        ),
      });
    } catch (error) {
      return res
        .status(400)
        .json({
          message:
            error.message,
        });
    }
  };

const getMovements =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid inventory ID.",
          });
      }

      const movements =
        await StockTransaction.find(
          {
            inventory:
              req.params.id,
          }
        )
          .populate(
            "createdBy",
            "name role"
          )
          .sort({
            createdAt: -1,
          })
          .limit(100);

      return res.json({
        data: movements,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load stock history.",
        });
    }
  };

module.exports = {
  listInventory,
  getInventory,
  moveStock,
  adjustInventory,
  getMovements,
};