const express = require("express");
const router = express.Router();
const { Car } = require("../models_sql/CarSQL");
const { protect } = require("../middleware/auth");
const upload = require("../utils/fileUploadLocal");
const cloudinary = require("../config/cloudinary");

const path = require("path");
const fs = require("fs");

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;

// GET /api/cars  -> list all cars
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.available === "true") where.status = "Available";
    if (req.query.status) where.status = req.query.status;
    const opts = { where, order: [["createdAt", "DESC"]] };
    if (req.query.limit) opts.limit = Number(req.query.limit);
    const cars = await Car.findAll(opts);
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars/:id -> get single car
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cars -> create new car
// Create new car (supports multipart file upload)
router.post("/", protect, upload.array("photos", 12), async (req, res) => {
  try {
    let photoPaths = [];
    if (req.files && req.files.length) {
      photoPaths = req.files.map((f) => f.path || f.secure_url || f.filename);
    } else if (req.body && req.body.photos) {
      try {
        photoPaths = typeof req.body.photos === "string" ? JSON.parse(req.body.photos) : req.body.photos;
      } catch (e) {
        photoPaths = Array.isArray(req.body.photos) ? req.body.photos : [];
      }
    }

    const payload = Object.assign({}, req.body, {
      photos: photoPaths,
      addedBy: req.user && req.user.id ? req.user.id : req.body.addedBy,
    });

    const created = await Car.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

// PUT /api/cars/:id -> update car
router.put("/:id", protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    await car.update(req.body);
    res.json({ success: true, data: car });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

// DELETE /api/cars/:id -> delete car
router.delete("/:id", async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    await car.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update car photos (replace or append)
router.put('/:id/photos', protect, upload.array('photos', 12), async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    let photoPaths = [];
    if (req.files && req.files.length) {
      photoPaths = req.files.map(f => f.path || f.secure_url || f.filename);
    } else if (req.body && req.body.photos) {
      try { photoPaths = typeof req.body.photos === 'string' ? JSON.parse(req.body.photos) : req.body.photos; } catch(e) { photoPaths = Array.isArray(req.body.photos) ? req.body.photos : []; }
    }

    const existing = Array.isArray(car.photos) ? car.photos : (car.photos || []);
    if (req.body.replacePhotos === 'true') {
      car.photos = photoPaths;
    } else {
      car.photos = [...existing, ...photoPaths];
    }
    await car.save();
    res.json({ success: true, data: car });
  } catch (err) {
    console.error('Error updating car photos:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add single photo
router.post('/:id/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const photo = req.file ? (req.file.path || req.file.secure_url || req.file.filename) : (req.body.photo || req.body.photoUrl);
    if (!photo) return res.status(400).json({ message: 'No photo provided' });
    car.photos = [...(Array.isArray(car.photos) ? car.photos : (car.photos || [])), photo];
    await car.save();
    res.json({ success: true, data: car });
  } catch (err) {
    console.error('Error adding photo:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete single photo
router.delete('/:id/photo', protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const filename = req.body.filename || req.query.filename;
    if (!filename) return res.status(400).json({ message: 'Photo filename required' });
    const photos = Array.isArray(car.photos) ? car.photos : (car.photos || []);
    const updated = photos.filter(p => p !== filename && !p.includes(filename));
    car.photos = updated;
    await car.save();

    // attempt deletion from Cloudinary if URL, otherwise delete local file
    try {
      if (filename.includes('cloudinary.com') || (filename.startsWith('http') && filename.includes('/upload/'))) {
        // Cloudinary style URL
        const parts = filename.split('/upload/');
        let publicId = parts[1] || '';
        publicId = publicId.replace(/^v\d+\//, '');
        publicId = publicId.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '');
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
      } else {
        // Local file: remove from configured dir
        const CAR_IMAGES_DIR = process.env.CAR_IMAGES_DIR || path.join(__dirname, '../utils/carimages/');
        const filenameOnly = filename.split('/').pop();
        const filePath = path.join(CAR_IMAGES_DIR, filenameOnly.replace('carimages/', ''));
        fs.unlink(filePath, () => {});
      }
    } catch (delErr) {
      console.warn('Failed to delete remote/local file', delErr);
    }

    res.json({ success: true, data: car });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all photos
router.delete('/:id/photos', protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const photos = Array.isArray(car.photos) ? car.photos : (car.photos || []);
    // attempt to delete cloudinary files
    for (const p of photos) {
      try {
        if (p && p.startsWith('http') && p.includes('/upload/')) {
          const parts = p.split('/upload/');
          let publicId = parts[1];
          publicId = publicId.replace(/^v\d+\//, '');
          publicId = publicId.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '');
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
        }
      } catch (e) {
        console.warn('Failed to delete cloud file', e);
      }
    }
    car.photos = [];
    await car.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting all photos:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
