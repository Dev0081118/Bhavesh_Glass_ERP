const mongoose = require("mongoose");

const stockTransactionSchema =
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
      },

      inventory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "IN",
          "OUT",
          "ADJUSTMENT",
        ],
        required: true,
        index: true,
      },

      source: {
        type: String,
        enum: [
          "OPENING_STOCK",

          "PURCHASE",
          "PURCHASE_REVERSAL",

          "PRODUCTION_OUTPUT",
          "PRODUCTION_OUTPUT_REVERSAL",

          "PRODUCTION_CONSUMPTION",
          "PRODUCTION_CONSUMPTION_REVERSAL",

          "SALE",
          "SALE_REVERSAL",

          "MANUAL",
          "ADJUSTMENT",
          "RETURN",
          "DAMAGE",

          "SYSTEM_ROLLBACK",
        ],
        required: true,
        index: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 0,
      },

      unit: {
        type: String,
        required: true,
      },

      /*
       * Quantity expressed in Inventory's stock unit.
       */
      primaryQuantity: {
        type: Number,
        required: true,
      },

      previousStock: {
        type: Number,
        required: true,
      },

      newStock: {
        type: Number,
        required: true,
      },

      referenceType: {
        type: String,
        default: "",
      },

      referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true,
      },

      reason: {
        type: String,
        trim: true,
        default: "",
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

stockTransactionSchema.index({
  product: 1,
  createdAt: -1,
});

stockTransactionSchema.index({
  referenceType: 1,
  referenceId: 1,
});

module.exports =
  mongoose.model(
    "StockTransaction",
    stockTransactionSchema
  );