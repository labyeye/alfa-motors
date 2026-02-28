const express = require("express");
const router = express.Router();
const { Car } = require("../models_sql/CarSQL");
const { connectDB } = require("../db");
const { protect } = require("../middleware/auth");
const { upload } = require("../utils/multerMemory");
const { uploadBufferToXOZZ } = require('../utils/xozzUpload');

const path = require("path");
const fs = require("fs");
const { formatCarInstance } = require("../utils/formatIndian");

const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL;

function normalizePhotos(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  // If stored as JSON string, try to parse
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      // if parsed is object with numeric keys or a 'photos' prop
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.photos)) return parsed.photos;
        return Object.values(parsed).filter((v) => typeof v === "string");
      }
      // fallback: split comma-separated string
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } catch (e) {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  // If object with photos property
  if (typeof value === "object") {
    if (Array.isArray(value.photos)) return value.photos;
    return Object.values(value).filter((v) => typeof v === "string");
  }
  return [];
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // remove currency symbols, commas and spaces
    const cleaned = value.replace(/[₹,\s]/g, '').replace(/[^0-9.\-]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function sanitizeNumericFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Object.assign({}, obj);
  const fields = [
    'buyingPrice',
    'quotingPrice',
    'sellingPrice',
    'kmDriven',
    'modelYear',
    'registrationYear',
    'downPayment',
    'daysOld',
  ];
  for (const f of fields) {
    if (f in out) {
      const parsed = parseNumber(out[f]);
      if (parsed !== undefined) out[f] = parsed;
      else delete out[f];
    }
  }
  return out;
}

// GET /api/cars  -> list all cars
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.available === "true") where.status = "Available";
    if (req.query.status) where.status = req.query.status;
    const opts = { where, order: [["createdAt", "DESC"]] };
    if (req.query.limit) opts.limit = Number(req.query.limit);
    const cars = await Car.findAll(opts);
    res.json({ success: true, data: (cars || []).map(formatCarInstance) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars/:id -> get single car
router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(formatCarInstance(car));
  } catch (err) {
    console.error("[carSqlRoutes] GET /api/cars/:id error:", err.message || err);
    res.status(500).json({ message: "Server error", error: err.message || String(err) });
  }
});

// POST /api/cars -> create new car
// Create new car (supports multipart file upload)
router.post("/", protect, upload.array("photos", 12), async (req, res) => {
  try {
    await connectDB();
    let photoPaths = [];
    if (req.files && req.files.length) {
      const uploaded = [];
      for (const f of req.files) {
        try {
          const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
          if (r && r.url) uploaded.push(r.url);
        } catch (e) {
          console.error('carSqlRoutes: XOZZ upload failed for file', f.originalname, e.message || e);
        }
      }
      photoPaths = uploaded;
    } else if (req.body && req.body.photos) {
      try {
        photoPaths =
          typeof req.body.photos === "string"
            ? JSON.parse(req.body.photos)
            : req.body.photos;
      } catch (e) {
        photoPaths = Array.isArray(req.body.photos) ? req.body.photos : [];
      }
    }

    let payload = Object.assign({}, req.body, {
      photos: photoPaths,
      addedBy: req.user && req.user.id ? req.user.id : req.body.addedBy,
    });

    // sanitize numeric fields (strip commas/currency symbols)
    payload = sanitizeNumericFields(payload);

    const created = await Car.create(payload);
    res.status(201).json({ success: true, data: formatCarInstance(created) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

// PUT /api/cars/:id -> update car
router.put("/:id", protect, async (req, res) => {
  try {
    await connectDB();
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
  // sanitize numeric fields in incoming update payload
  const sanitized = sanitizeNumericFields(req.body);
  await car.update(sanitized);
    res.json({ success: true, data: formatCarInstance(car) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

// DELETE /api/cars/:id -> delete car
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
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
router.put(
  "/:id/photos",
  protect,
  upload.array("photos", 12),
  async (req, res) => {
    try {
      const car = await Car.findByPk(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });

      let photoPaths = [];
      if (req.files && req.files.length) {
        const uploaded = [];
        for (const f of req.files) {
          try {
            const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
            if (r && r.url) uploaded.push(r.url);
          } catch (e) {
            console.error('carSqlRoutes: XOZZ upload failed for file', f.originalname, e.message || e);
          }
        }
        photoPaths = uploaded;
      } else if (req.body && req.body.photos) {
        try {
          photoPaths =
            typeof req.body.photos === "string"
              ? JSON.parse(req.body.photos)
              : req.body.photos;
        } catch (e) {
          photoPaths = Array.isArray(req.body.photos) ? req.body.photos : [];
        }
      }

      const existing = normalizePhotos(car.photos);
      if (req.body.replacePhotos === "true") {
        car.photos = photoPaths;
      } else {
        car.photos = [...existing, ...photoPaths];
      }
      await car.save();
      res.json({ success: true, data: formatCarInstance(car) });
    } catch (err) {
      console.error("Error updating car photos:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Add single photo
router.post("/:id/photo", protect, upload.single("photo"), async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    let photo = null;
    if (req.file && req.file.buffer) {
      try {
        const r = await uploadBufferToXOZZ(req.file.buffer, req.file.originalname, req.file.mimetype);
        if (r && r.url) photo = r.url;
      } catch (e) {
        console.error('carSqlRoutes: XOZZ upload failed for single photo', e.message || e);
      }
    }
    if (!photo) photo = req.body.photo || req.body.photoUrl;
    if (!photo) return res.status(400).json({ message: 'No photo provided' });
    car.photos = [...normalizePhotos(car.photos), photo];
    await car.save();
    res.json({ success: true, data: formatCarInstance(car) });
  } catch (err) {
    console.error("Error adding photo:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete single photo
router.delete("/:id/photo", protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    const filename = req.body.filename || req.query.filename;
    if (!filename)
      return res.status(400).json({ message: "Photo filename required" });
    const photos = normalizePhotos(car.photos);
    const updated = photos.filter(
      (p) => p !== filename && !(typeof p === "string" && p.includes(filename))
    );
    car.photos = updated;
    await car.save();
    // Note: XOZZ currently doesn't provide a delete API here. We remove the reference
    // from the DB row only. If you have a delete endpoint for XOZZ, implement it here.
    try {
      if (filename && filename.startsWith('http') && filename.includes('/uploads/')) {
        // remote XOZZ file - skipping deletion (no API implemented)
        console.log('Skipping remote XOZZ file deletion for', filename);
      } else {
        // Local file: remove from configured dir
        const CAR_IMAGES_DIR =
          process.env.CAR_IMAGES_DIR ||
          path.join(__dirname, "../utils/carimages/");
        const filenameOnly = filename.split("/").pop();
        const filePath = path.join(
          CAR_IMAGES_DIR,
          filenameOnly.replace("carimages/", "")
        );
        fs.unlink(filePath, () => {});
      }
    } catch (delErr) {
      console.warn("Failed to delete remote/local file", delErr);
    }

    res.json({ success: true, data: car });
  } catch (err) {
    console.error("Error deleting photo:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete all photos
router.delete("/:id/photos", protect, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    const photos = normalizePhotos(car.photos);
    // If XOZZ supports deletion, implement deletion logic here. Currently we only
    // clear the references in the DB and skip deleting remote files.
    for (const p of photos) {
      try {
        if (p && p.startsWith('http') && p.includes('/uploads/')) {
          console.log('Skipping XOZZ deletion for', p);
        }
      } catch (e) {
        console.warn('Failed during photo cleanup check', e);
      }
    }
    car.photos = [];
    await car.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting all photos:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
