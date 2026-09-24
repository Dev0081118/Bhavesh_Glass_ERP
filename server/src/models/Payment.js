const mongoose =
  require("mongoose");

const paymentSchema =
  new mongoose.Schema(
    {
      saleBill: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "SaleBill",

        required:
          true,

        index:
          true,
      },

      customer: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "Party",

        required:
          true,

        index:
          true,
      },

      paymentDate: {
        type:
          Date,

        required:
          true,
      },

      amount: {
        type:
          Number,

        required:
          true,

        min:
          0,
      },

      paymentMode: {
        type:
          String,

        enum: [
          "Cash",
          "UPI",
          "Bank Transfer",
          "Cheque",
        ],

        required:
          true,
      },

      referenceNumber: {
        type:
          String,

        trim:
          true,
      },

      status: {
        type:
          String,

        enum: [
          "Completed",
          "Pending",
          "Cancelled",
        ],

        default:
          "Completed",

        index:
          true,
      },

      notes: {
        type:
          String,

        trim:
          true,
      },

      receivedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "User",

        default:
          null,

        index:
          true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref:
          "User",

        default:
          null,

        index:
          true,
      },
    },

    {
      timestamps:
        true,
    }
  );

module.exports =
  mongoose.model(
    "Payment",
    paymentSchema
  );