const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    transactionDate: { type: Date, required: true, index: true },
    partyType: { type: String, enum: ["Customer", "Supplier"], required: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    transactionType: { type: String, enum: ["Sale", "Purchase", "Payment Received", "Payment Made", "Adjustment"], required: true },
    referenceType: { type: String, enum: ["Sale Bill", "Purchase", "Payment", "Manual"], required: true },
    referenceId: { type: String, trim: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0 },
    narration: { type: String, trim: true },
    status: { type: String, enum: ["Posted", "Pending", "Cancelled"], default: "Posted", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ledgerEntrySchema.pre("validate", function validateAmounts(next) {
  if (this.debit > 0 && this.credit > 0) {
    return next(new Error("A ledger entry cannot have both debit and credit."));
  }
  next();
});

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
