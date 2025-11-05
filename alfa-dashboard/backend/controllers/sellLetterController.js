const SellLetter = require("../models/SellLetter");

exports.createSellLetter = async (req, res) => {
  try {
    const sellLetter = new SellLetter({ ...req.body, user: req.user.id });
    const savedSellLetter = await sellLetter.save();
    res.status(201).json(savedSellLetter);
  } catch (error) {
    console.error("Detailed error:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getSellLetters = async (req, res) => {
  try {
    const sellLetters = await SellLetter.find()
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json(sellLetters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getSellLettersByRegistration = async (req, res) => {
  try {
    const { registrationNumber } = req.query;
    if (!registrationNumber)
      return res
        .status(400)
        .json({ message: "Registration number is required" });
    const sellLetters = await SellLetter.find({
      registrationNumber: new RegExp(registrationNumber, "i"),
      $or: [
        { user: req.user.id },
        { visibility: "staff" },
        ...(req.user.role === "staff" ? [{}] : []),
      ],
    }).sort({ createdAt: -1 });
    res.json(sellLetters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMySellLetters = async (req, res) => {
  try {
    const sellLetters = await SellLetter.find({
      $or: [
        { user: req.user.id },
        { visibility: "staff" },
        ...(req.user.role === "staff" ? [{}] : []),
      ],
    })
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json(sellLetters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getSellLetterById = async (req, res) => {
  try {
    const sellLetter = await SellLetter.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { visibility: "staff" },
        ...(req.user.role === "staff" ? [{}] : []),
      ],
    });
    if (!sellLetter)
      return res.status(404).json({ message: "Sell letter not found" });
    res.json(sellLetter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateSellLetter = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Not authorized to update sell letters" });
    let sellLetter = await SellLetter.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!sellLetter)
      return res.status(404).json({ message: "Sell letter not found" });
    sellLetter = await SellLetter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(sellLetter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteSellLetter = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Not authorized to update sell letters" });
    const sellLetter = await SellLetter.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!sellLetter)
      return res.status(404).json({ message: "Sell letter not found" });
    await sellLetter.deleteOne();
    res.json({ message: "Sell letter removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
