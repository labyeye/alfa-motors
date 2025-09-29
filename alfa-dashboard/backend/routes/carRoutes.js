
const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const Gallery = require("../models/Gallery");
const { protect } = require("../middleware/auth");
const upload = require("../utils/fileUpload");
const path = require('path');

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

// Get single car
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("addedBy", "username");
    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }
    res.status(200).json({
      success: true,
      data: car,
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
  console.error('Error deleting photo:', err);
  res.status(500).json({ success: false, error: 'Server error' });
  }
});
// Delete all photos for a car
router.delete('/:id/photos', protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }
    if (car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const fs = require('fs');
    const path = require('path');
    const images = Array.isArray(car.photos) ? car.photos.slice() : [];

    // Remove files from disk (attempt, ignore missing)
    images.forEach((img) => {
      try {
        const filename = img.split('/').pop();
        const filePath = path.join(__dirname, '../utils/carimages/', filename.replace('carimages/', ''));
        fs.unlink(filePath, (err) => {
          // ignore error
        });
      } catch (e) {
        // ignore
      }
    });

  // Clear photos array in DB. Use direct update to bypass the schema validator
  await Car.findByIdAndUpdate(req.params.id, { $set: { photos: [] } }, { new: true });

  res.json({ success: true, message: 'All photos deleted' });
  } catch (err) {
    console.error('Error deleting all photos:', err);
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
// Update car details (text fields only - no images)
router.put(
  "/:id",
  protect,
  async (req, res) => {
    try {
      // Build update object only from provided fields to allow partial updates
      const updatedCar = {};
      if (req.body.brand !== undefined && req.body.brand !== "") updatedCar.make = req.body.brand;
      if (req.body.model !== undefined && req.body.model !== "") updatedCar.model = req.body.model;
      if (req.body.variant !== undefined && req.body.variant !== "") updatedCar.variant = req.body.variant;
      if (req.body.fuelType !== undefined && req.body.fuelType !== "") updatedCar.fuelType = req.body.fuelType;
      if (req.body.modelYear !== undefined && req.body.modelYear !== "") updatedCar.modelYear = Number(req.body.modelYear);
      if (req.body.registrationYear !== undefined && req.body.registrationYear !== "") updatedCar.registrationYear = Number(req.body.registrationYear);
      if (req.body.color !== undefined && req.body.color !== "") updatedCar.color = req.body.color;
      if (req.body.chassisNo !== undefined && req.body.chassisNo !== "") updatedCar.chassisNo = req.body.chassisNo;
      if (req.body.engineNo !== undefined && req.body.engineNo !== "") updatedCar.engineNo = req.body.engineNo;
      if (req.body.kmDriven !== undefined && req.body.kmDriven !== "") updatedCar.kmDriven = Number(req.body.kmDriven);
      if (req.body.ownership !== undefined && req.body.ownership !== "") updatedCar.ownership = req.body.ownership;
      if (req.body.daysOld !== undefined && req.body.daysOld !== "") updatedCar.daysOld = Number(req.body.daysOld);
      if (req.body.buyingPrice !== undefined && req.body.buyingPrice !== "") updatedCar.buyingPrice = Number(req.body.buyingPrice);
      if (req.body.quotingPrice !== undefined && req.body.quotingPrice !== "") updatedCar.quotingPrice = Number(req.body.quotingPrice);
      if (req.body.sellingPrice !== undefined && req.body.sellingPrice !== "") updatedCar.sellingPrice = Number(req.body.sellingPrice);
      if (req.body.status !== undefined && req.body.status !== "") updatedCar.status = req.body.status;
      
      const car = await Car.findByIdAndUpdate(req.params.id, updatedCar, { new: true, runValidators: true });
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

// Update car images (separate endpoint to handle large payloads)
router.put(
  "/:id/photos",
  protect,
  upload.array("photos", 12),
  async (req, res) => {
    try {
      const photoPaths = req.files ? req.files.map((file) => file.filename) : [];
      
      if (photoPaths.length === 0) {
        return res.status(400).json({ success: false, error: "No photos provided" });
      }
      
      const car = await Car.findById(req.params.id);
      if (!car) {
        return res.status(404).json({ success: false, error: "Car not found" });
      }
      
      // Replace existing photos or append new ones based on request
      if (req.body.replacePhotos === 'true') {
        car.photos = photoPaths;
      } else {
        car.photos = [...car.photos, ...photoPaths];
      }
      
      await car.save();
      
      res.status(200).json({
        success: true,
        data: car,
      });
    } catch (err) {
      console.error("Error updating car photos:", err);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// Add single photo to existing car
router.post(
  "/:id/photo",
  protect,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No photo provided" });
      }
      
      const car = await Car.findById(req.params.id);
      if (!car) {
        return res.status(404).json({ success: false, error: "Car not found" });
      }
      
      car.photos.push(req.file.filename);
      await car.save();
      
      res.status(200).json({
        success: true,
        data: car,
        newPhoto: req.file.filename
      });
    } catch (err) {
      console.error("Error adding photo:", err);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// Get sold cars (public)
router.get('/sold', async (req, res) => {
  try {
    // Use lean() to return plain JS objects and avoid Mongoose document getters
    const docs = await Car.find({ status: 'Sold Out' }).select('make model variant modelYear photos sold').lean();

    const soldCars = (docs || []).map(doc => ({
      _id: doc._id,
      make: doc.make || '',
      model: doc.model || '',
      variant: doc.variant || '',
      modelYear: doc.modelYear || '',
      photos: Array.isArray(doc.photos) ? doc.photos : [],
      sold: doc.sold || {},
    }));

    return res.json({ success: true, data: soldCars });
  } catch (err) {
    console.error('Error fetching sold cars:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Mark a car as sold with optional details
router.put('/:id/mark-sold', protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    if (car.addedBy.toString() !== req.user._id.toString()) return res.status(401).json({ success: false, error: 'Not authorized' });

    car.status = 'Sold Out';
    car.sold = car.sold || {};
    if (req.body.customerName) car.sold.customerName = req.body.customerName;
    if (req.body.testimonial) car.sold.testimonial = req.body.testimonial;
    car.sold.soldAt = req.body.soldAt ? new Date(req.body.soldAt) : new Date();

    await car.save();
    res.json({ success: true, data: car });
  } catch (err) {
    console.error('Error marking sold:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Add customer photo for sold car
router.post('/:id/sold-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No photo provided' });
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    if (car.addedBy.toString() !== req.user._id.toString()) return res.status(401).json({ success: false, error: 'Not authorized' });

    car.sold = car.sold || {};
    car.sold.customerPhotos = car.sold.customerPhotos || [];
    car.sold.customerPhotos.push(req.file.filename);
    await car.save();

    // Also create a Gallery document so uploads via this legacy endpoint
    // appear in the /api/gallery listing used by the admin UI and public pages
    try {
      const galleryItem = new Gallery({
        car: car._id,
        filename: req.file.filename,
        caption: req.body.caption || '',
        testimonial: req.body.testimonial || '',
        uploadedBy: req.user._id,
      });
      await galleryItem.save();
    } catch (gErr) {
      console.warn('Failed to create gallery document for sold-photo upload:', gErr);
      // non-fatal: continue returning success for the car update
    }

    res.json({ success: true, data: car, newPhoto: req.file.filename });
  } catch (err) {
    console.error('Error adding sold photo:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete sold customer photo
router.delete('/:id/sold-photo', protect, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, error: 'filename required' });
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
    if (car.addedBy.toString() !== req.user._id.toString()) return res.status(401).json({ success: false, error: 'Not authorized' });

    car.sold = car.sold || {};
    car.sold.customerPhotos = (car.sold.customerPhotos || []).filter(p => p !== filename && p !== `carimages/${filename}`);
    await car.save();

    // remove file
    const fs = require('fs');
    const filePath = path.join(__dirname, '../utils/carimages/', filename.replace('carimages/', ''));
    fs.unlink(filePath, () => {});

    res.json({ success: true, data: car });
  } catch (err) {
    console.error('Error deleting sold photo:', err);
    res.status(500).json({ success: false, error: 'Server error' });
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
