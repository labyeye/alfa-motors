let AdvancePayment, SellLetter;
try {
  ({ AdvancePayment } = require('../models_sql/AdvancePaymentSQL'));
  ({ SellLetter } = require('../models_sql/SellLetterSQL'));
} catch (e) {
  AdvancePayment = require("../models/AdvancePayment");
  SellLetter = require("../models/SellLetter");
}

exports.createPayment = async (req, res) => {
  try {
    const { sellLetter, amount, paymentMethod, note } = req.body;
    if (!amount || Number(amount) <= 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "Amount is required and must be > 0",
        });
    if (sellLetter) {
      const sl = await SellLetter.findById(sellLetter);
      if (!sl)
        return res
          .status(404)
          .json({ success: false, message: "Sell letter not found" });
    }
    const payment = new AdvancePayment({
      sellLetter,
      amount: Number(amount),
      paymentMethod,
      note,
      receivedBy: req.user.id,
    });
    await payment.save();
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const query = {};
    if (req.query.sellLetter) query.sellLetter = req.query.sellLetter;
    if (req.user.role !== "admin") query.receivedBy = req.user.id;
    const payments = await AdvancePayment.find(query)
      .populate("sellLetter")
      .populate("receivedBy", "-password")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await AdvancePayment.findById(req.params.id).populate(
      "sellLetter"
    );
    if (!payment)
      return res.status(404).json({ success: false, message: "Not found" });
    if (
      req.user.role !== "admin" &&
      payment.receivedBy.toString() !== req.user.id.toString()
    )
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await AdvancePayment.findById(req.params.id);
    if (!payment)
      return res.status(404).json({ success: false, message: "Not found" });
    if (
      req.user.role !== "admin" &&
      payment.receivedBy.toString() !== req.user.id.toString()
    )
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    await AdvancePayment.deleteOne({ _id: payment._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
