const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null,
        index: true,
      },

      type: {
        type: String,
        enum: ["LOW_STOCK"],
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: ["Active", "Resolved"],
        default: "Active",
        index: true,
      },

      readAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);