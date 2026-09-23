const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    unit: {
      type: String,
      trim: true,
      default: "",
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      trim: true,
      index: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true,
    },

    supplierInvoiceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    expectedDeliveryDate: {
      type: Date,
      default: null,
    },

    actualReceiptDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Ordered",
        "Partially Received",
        "Received",
        "Cancelled",
      ],
      default: "Draft",
      index: true,
    },

    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0,

        message:
          "Purchase must contain at least one item.",
      },
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    gst: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partially Paid",
        "Paid",
      ],
      default: "Pending",
      index: true,
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

purchaseSchema.index({
  supplier: 1,
  purchaseDate: -1,
});

module.exports = mongoose.model(
  "Purchase",
  purchaseSchema
);