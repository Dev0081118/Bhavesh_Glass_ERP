const mongoose = require("mongoose");

const whatsAppShareSchema =
  new mongoose.Schema(
    {
      customers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
        },
      ],

      products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Sent",
          "Failed",
        ],
        default: "Pending",
        index: true,
      },

      customerCount: {
        type: Number,
        default: 0,
      },

      productCount: {
        type: Number,
        default: 0,
      },

      errorMessage: {
        type: String,
        default: "",
      },

      n8nResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "WhatsAppShare",
  whatsAppShareSchema
);