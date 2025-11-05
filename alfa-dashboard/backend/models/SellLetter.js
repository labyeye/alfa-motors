const mongoose = require("mongoose");

const SellLetterSchema = new mongoose.Schema(
  {
    vehicleName: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleColor: { type: String, required: true },
    fuelType: { type: String },
    year: { type: String },
    registrationNumber: { type: String, required: true },
    chassisNumber: { type: String, required: true },
    engineNumber: { type: String, required: true },
    vehiclekm: { type: String, required: true },
    vehicleCondition: {
      type: String,
      required: true,
      enum: ["running", "notRunning"],
    },

    buyerName: { type: String, required: true },
    buyerFatherName: { type: String, required: true },
    buyerAddress: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerPhone2: { type: String, required: true },
    buyerAadhar: { type: String, required: true },
    idNumber: { type: String },
    contactNo: { type: String },

    saleDate: { type: Date, required: true, default: Date.now },
    saleTime: { type: String },
    saleAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "check", "bankTransfer", "other"],
    },
    todayDate: { type: Date },
    todayTime: { type: String },
    previousDate: { type: Date },
    previousTime: { type: String },

    witnessName: { type: String, required: true },
    witnessPhone: { type: String, required: true },
    note: { type: String },

    documentsVerified: { type: Boolean, default: true },
    invoiceNumber: { type: String },
    saleValue: { type: Number },
    commission: { type: Number },
    rtoCharges: { type: Number },
    otherCharges: { type: Number },
    totalAmount: { type: Number },
    advanceAmount: { type: Number },
    balanceAmount: { type: Number },
    declaration: { type: String },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellLetter", SellLetterSchema);
