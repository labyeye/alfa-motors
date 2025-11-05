const mongoose = require("mongoose");

const AdvancePaymentSchema = new mongoose.Schema(
  {
    sellLetter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellLetter",
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "check", "bankTransfer", "upi", "other"],
      default: "cash",
    },
    note: { type: String },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvancePayment", AdvancePaymentSchema);
