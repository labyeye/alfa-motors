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
      // if it's the new categorized object { cover, interior, exterior }
      if (parsed && typeof parsed === "object") {
        const all = [];
        if (parsed.cover) all.push(parsed.cover);
        if (Array.isArray(parsed.interior)) all.push(...parsed.interior);
        if (Array.isArray(parsed.exterior)) all.push(...parsed.exterior);
        if (all.length > 0) return all;
        
        // legacy object format handling
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
  // If object
  if (typeof value === "object") {
    const all = [];
    if (value.cover) all.push(value.cover);
    if (Array.isArray(value.interior)) all.push(...value.interior);
    if (Array.isArray(value.exterior)) all.push(...value.exterior);
    if (all.length > 0) return all;

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
// Create new car (supports categorized multipart file upload)
router.post("/", protect, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'interior', maxCount: 6 },
  { name: 'exterior', maxCount: 6 }
]), async (req, res) => {
  try {
    await connectDB();
    
    let photoData = {
      cover: null,
      interior: [],
      exterior: []
    };

    if (req.files) {
      // Process cover
      if (req.files.cover && req.files.cover[0]) {
        const f = req.files.cover[0];
        const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
        if (r && r.url) photoData.cover = r.url;
      }
      
      // Process interior
      if (req.files.interior) {
        for (const f of req.files.interior) {
          const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
          if (r && r.url) photoData.interior.push(r.url);
        }
      }

      // Process exterior
      if (req.files.exterior) {
        for (const f of req.files.exterior) {
          const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
          if (r && r.url) photoData.exterior.push(r.url);
        }
      }
    }

    // Fallback or override if photo links are passed directly in body (e.g. JSON from frontend)
    if (req.body.photos && typeof req.body.photos === 'string') {
      try {
        const bodyPhotos = JSON.parse(req.body.photos);
        if (bodyPhotos && typeof bodyPhotos === 'object' && !Array.isArray(bodyPhotos)) {
          photoData = Object.assign(photoData, bodyPhotos);
        } else if (Array.isArray(bodyPhotos)) {
          // If legacy array is sent, treat first as cover
          photoData.cover = bodyPhotos[0] || null;
          photoData.exterior = bodyPhotos.slice(1);
        }
      } catch (e) {}
    }

    let payload = Object.assign({}, req.body, {
      photos: photoData,
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

// Update car photos (categorized)
router.put(
  "/:id/photos",
  protect,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "interior", maxCount: 6 },
    { name: "exterior", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
      await connectDB();
      const car = await Car.findByPk(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });

      // Initialize current photos
      let photoData = {
        cover: null,
        interior: [],
        exterior: [],
      };

      if (car.photos && typeof car.photos === "object" && !Array.isArray(car.photos)) {
        photoData = Object.assign(photoData, car.photos);
      } else if (Array.isArray(car.photos)) {
        photoData.cover = car.photos[0] || null;
        photoData.exterior = car.photos.slice(1);
      }

      if (req.files) {
        // Process cover
        if (req.files.cover && req.files.cover[0]) {
          const f = req.files.cover[0];
          const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
          if (r && r.url) photoData.cover = r.url;
        }

        // Process interior
        if (req.files.interior) {
          for (const f of req.files.interior) {
            const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
            if (r && r.url) photoData.interior.push(r.url);
          }
        }

        // Process exterior
        if (req.files.exterior) {
          for (const f of req.files.exterior) {
            const r = await uploadBufferToXOZZ(f.buffer, f.originalname, f.mimetype);
            if (r && r.url) photoData.exterior.push(r.url);
          }
        }
      }

      await car.update({ photos: photoData });
      res.json({ success: true, data: formatCarInstance(car) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Delete single photo
router.delete("/:id/photo", protect, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ message: "Filename required" });

    await connectDB();
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    let currentPhotos = car.photos;
    let updated = false;

    if (currentPhotos && typeof currentPhotos === "object" && !Array.isArray(currentPhotos)) {
      // Check cover
      if (currentPhotos.cover && currentPhotos.cover.includes(filename)) {
        currentPhotos.cover = null;
        updated = true;
      }
      // Check interior
      if (Array.isArray(currentPhotos.interior)) {
        const initialLen = currentPhotos.interior.length;
        currentPhotos.interior = currentPhotos.interior.filter((p) => !p.includes(filename));
        if (currentPhotos.interior.length !== initialLen) updated = true;
      }
      // Check exterior
      if (Array.isArray(currentPhotos.exterior)) {
        const initialLen = currentPhotos.exterior.length;
        currentPhotos.exterior = currentPhotos.exterior.filter((p) => !p.includes(filename));
        if (currentPhotos.exterior.length !== initialLen) updated = true;
      }
    } else if (Array.isArray(currentPhotos)) {
      const initialLen = currentPhotos.length;
      currentPhotos = currentPhotos.filter((p) => !p.includes(filename));
      if (currentPhotos.length !== initialLen) updated = true;
    }

    if (updated) {
      await car.update({ photos: currentPhotos });
      res.json({ success: true, message: "Photo removed" });
    } else {
      res.status(404).json({ message: "Photo not found in car records" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

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
