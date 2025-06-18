const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const { protect } = require("../middleware/auth");

// API endpoint for adding a car (for React frontend)
router.post("/", protect, async (req, res) => {
  try {
    // Filter out empty image URLs
    const nonEmptyImages = req.body.images
      ? req.body.images.filter((url) => url.trim() !== "")
      : [];

    const carData = {
      brand: req.body.brand,
      model: req.body.model,
      modelYear: Number(req.body.modelYear),
      kmDriven: Number(req.body.kmDriven),
      ownership: req.body.ownership,
      fuelType: req.body.fuelType,
      daysOld: Number(req.body.daysOld),
      buyprice: Number(req.body.buyprice),
      price: Number(req.body.price),
      downPayment: Number(req.body.downPayment),
      images: nonEmptyImages,
      status: req.body.status,
      addedBy: req.user._id,
    };

    const car = new Car(carData);
    await car.save();

    res.status(201).json({
      success: true,
      data: car,
    });
  } catch (err) {
    console.error("Error adding car:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// Get all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find().populate("addedBy", "username");
    res.status(200).json({
      success: true,
      data: cars,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }
    res.status(200).json(car);
  } catch (err) {
    console.error("Error fetching car by ID:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
// Update a car
router.put("/:id", protect, async (req, res) => {
  try {
    // Filter out empty image URLs
    const nonEmptyImages = req.body.images
      ? req.body.images.filter((url) => url.trim() !== "")
      : [];

    const updatedCar = {
      ...req.body,
      images: nonEmptyImages,
      modelYear: Number(req.body.modelYear),
      kmDriven: Number(req.body.kmDriven),
      daysOld: Number(req.body.daysOld),
      buyprice: Number(req.body.buyprice),
      price: Number(req.body.price),
      downPayment: Number(req.body.downPayment),
    };

    const car = await Car.findByIdAndUpdate(req.params.id, updatedCar, {
      new: true,
    });

    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (err) {
    console.error("Error updating car:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    if (car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this car",
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: { id: req.params.id },
    });
  } catch (err) {
    console.error("Error deleting car:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid car ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;
