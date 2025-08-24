
const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const { protect } = require("../middleware/auth");
const upload = require("../utils/fileUpload");

// API endpoint for adding a car (for React frontend)
router.post(
  "/",
  protect,
  upload.array("photos", 12),
  async (req, res) => {
    try {
      // Get uploaded photo file paths (store relative path for frontend)
  const photoPaths = req.files ? req.files.map((file) => file.filename) : [];

      const carData = {
        make: req.body.brand,
        model: req.body.model,
        variant: req.body.variant,
        fuelType: req.body.fuelType,
        modelYear: Number(req.body.modelYear),
        registrationYear: Number(req.body.registrationYear),
        color: req.body.color,
        chassisNo: req.body.chassisNo,
        engineNo: req.body.engineNo,
        kmDriven: Number(req.body.kmDriven),
        ownership: req.body.ownership,
        daysOld: Number(req.body.daysOld),
        buyingPrice: Number(req.body.buyingPrice),
        quotingPrice: Number(req.body.quotingPrice),
        sellingPrice: Number(req.body.sellingPrice),
        photos: photoPaths,
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
  }
);

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
// Delete a single car photo
router.delete('/:id/photo', protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }
    if (car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    // Accept filename from request body or query string
    let filename = req.body && req.body.filename ? req.body.filename : (req.query && req.query.filename ? req.query.filename : null);
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Filename required' });
    }
    // Remove from DB
    car.photos = car.photos.filter((img) => img !== filename && img !== `carimages/${filename}`);
    await car.save();
    // Remove file from disk
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../utils/carimages/', filename.replace('carimages/', ''));
    fs.unlink(filePath, (err) => {
      // Ignore error if file not found
    });
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
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
router.put(
  "/:id",
  protect,
  upload.array("photos", 12),
  async (req, res) => {
    try {
  const photoPaths = req.files ? req.files.map((file) => file.filename) : undefined;
      const updatedCar = {
        make: req.body.brand,
        model: req.body.model,
        variant: req.body.variant,
        fuelType: req.body.fuelType,
        modelYear: Number(req.body.modelYear),
        registrationYear: Number(req.body.registrationYear),
        color: req.body.color,
        chassisNo: req.body.chassisNo,
        engineNo: req.body.engineNo,
        kmDriven: Number(req.body.kmDriven),
        ownership: req.body.ownership,
        daysOld: Number(req.body.daysOld),
        buyingPrice: Number(req.body.buyingPrice),
        quotingPrice: Number(req.body.quotingPrice),
        sellingPrice: Number(req.body.sellingPrice),
        status: req.body.status,
        addedBy: req.user._id,
      };
      if (photoPaths) updatedCar.photos = photoPaths;
      const car = await Car.findByIdAndUpdate(req.params.id, updatedCar, { new: true });
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
  }
);

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
