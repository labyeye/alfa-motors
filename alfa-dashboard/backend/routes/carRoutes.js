const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const Gallery = require("../models/Gallery");
const { protect } = require("../middleware/auth");
const { upload } = require("../utils/multerMemory");
const { uploadBufferToXOZZ } = require('../utils/xozzUpload');
const path = require("path");
const fs = require("fs");
const { formatCarInstance } = require("../utils/formatIndian");


const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL;


router.post("/", protect, upload.array("photos", 12), async (req, res) => {
  try {
    
    
    
    let photoPaths = [];
    if (req.files && req.files.length) {
      const uploaded = [];
      for (const file of req.files) {
        try {
          const r = await uploadBufferToXOZZ(file.buffer, file.originalname || `car-${Date.now()}`, file.mimetype);
          if (r && r.url) uploaded.push(r.url);
        } catch (e) {
          console.error('carRoutes: XOZZ upload failed for file', file.originalname, e.message || e);
        }
      }
      photoPaths = uploaded;
    } else if (req.body && req.body.photos) {
      try {
        
        if (typeof req.body.photos === 'string') {
          photoPaths = JSON.parse(req.body.photos);
        } else if (Array.isArray(req.body.photos)) {
          photoPaths = req.body.photos;
        }
      } catch (parseErr) {
        photoPaths = [];
      }
    }

    const carData = {
      make: req.body.make,
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
      data: formatCarInstance(car),
    });
  } catch (err) {
    console.error("Error adding car:", err);
    
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


router.get("/", async (req, res) => {
  try {
    
    const filter = {};
    if (req.query.available === "true") {
      filter.status = "Available";
    } else if (req.query.status) {
      filter.status = req.query.status;
    }
    const cars = await Car.find(filter).populate("addedBy", "username");
    res.status(200).json({
      success: true,
      data: (cars || []).map(formatCarInstance),
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
    const car = await Car.findById(req.params.id).populate(
      "addedBy",
      "username"
    );
    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }
    res.status(200).json({
      success: true,
      data: formatCarInstance(car),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

router.delete("/:id/photo", protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }
    if (car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }
    
    let photoIdentifier =
      req.body && req.body.filename
        ? req.body.filename
        : req.query && req.query.filename
        ? req.query.filename
        : null;
    if (!photoIdentifier) {
      return res
        .status(400)
        .json({ success: false, error: "Photo identifier required" });
    }

    
    car.photos = car.photos.filter((img) => {
      return (
        img !== photoIdentifier &&
        img !== `carimages/${photoIdentifier}` &&
        !img.includes(photoIdentifier)
      );
    });
    await car.save();

    
    
    try {
      if (photoIdentifier && (photoIdentifier.startsWith('http://') || photoIdentifier.startsWith('https://'))) {
        if (photoIdentifier.includes('/uploads/')) {
          console.log('Skipping XOZZ remote deletion for', photoIdentifier);
        } else {
          console.log('Remote URL found, not deleting:', photoIdentifier);
        }
      } else {
        
        const CAR_IMAGES_DIR = process.env.CAR_IMAGES_DIR;
        const filename = photoIdentifier.split('/').pop();
        const filePath = path.join(CAR_IMAGES_DIR, filename.replace('carimages/', ''));
        fs.unlink(filePath, () => {});
      }
    } catch (cloudErr) {
      console.error('Error deleting remote/local file:', cloudErr);
    }

    res.json({ success: true, message: "Photo deleted" });
  } catch (err) {
    console.error("Error deleting photo:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.delete("/:id/photos", protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }
    if (car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    const images = Array.isArray(car.photos) ? car.photos.slice() : [];

    
    if (isProduction) {
      
      for (const img of images) {
        try {
          if (img && img.startsWith('http') && img.includes('/uploads/')) {
            console.log('Skipping XOZZ deletion for', img);
          }
        } catch (e) {
          console.warn('Error checking remote image for deletion', e);
        }
      }
    } else {
      
      const fs = require("fs");
      images.forEach((img) => {
        try {
          const filename = img.split("/").pop();
          const filePath = path.join(
            __dirname,
            "../utils/carimages/",
            filename.replace("carimages/", "")
          );
          fs.unlink(filePath, (err) => {
            
          });
        } catch (e) {
          
        }
      });
    }

    
    await Car.findByIdAndUpdate(
      req.params.id,
      { $set: { photos: [] } },
      { new: true }
    );

    res.json({ success: true, message: "All photos deleted" });
  } catch (err) {
    console.error("Error deleting all photos:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }
    res.status(200).json(formatCarInstance(car));
  } catch (err) {
    console.error("Error fetching car by ID:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    
    const updatedCar = {};
    if (req.body.make !== undefined && req.body.make !== "")
      updatedCar.make = req.body.make;
    if (req.body.model !== undefined && req.body.model !== "")
      updatedCar.model = req.body.model;
    if (req.body.variant !== undefined && req.body.variant !== "")
      updatedCar.variant = req.body.variant;
    if (req.body.fuelType !== undefined && req.body.fuelType !== "")
      updatedCar.fuelType = req.body.fuelType;
    if (req.body.modelYear !== undefined && req.body.modelYear !== "")
      updatedCar.modelYear = Number(req.body.modelYear);
    if (
      req.body.registrationYear !== undefined &&
      req.body.registrationYear !== ""
    )
      updatedCar.registrationYear = Number(req.body.registrationYear);
    if (req.body.color !== undefined && req.body.color !== "")
      updatedCar.color = req.body.color;
    if (req.body.chassisNo !== undefined && req.body.chassisNo !== "")
      updatedCar.chassisNo = req.body.chassisNo;
    if (req.body.engineNo !== undefined && req.body.engineNo !== "")
      updatedCar.engineNo = req.body.engineNo;
    if (req.body.kmDriven !== undefined && req.body.kmDriven !== "")
      updatedCar.kmDriven = Number(req.body.kmDriven);
    if (req.body.ownership !== undefined && req.body.ownership !== "")
      updatedCar.ownership = req.body.ownership;
    if (req.body.daysOld !== undefined && req.body.daysOld !== "")
      updatedCar.daysOld = Number(req.body.daysOld);
    if (req.body.buyingPrice !== undefined && req.body.buyingPrice !== "")
      updatedCar.buyingPrice = Number(req.body.buyingPrice);
    if (req.body.quotingPrice !== undefined && req.body.quotingPrice !== "")
      updatedCar.quotingPrice = Number(req.body.quotingPrice);
    if (req.body.sellingPrice !== undefined && req.body.sellingPrice !== "")
      updatedCar.sellingPrice = Number(req.body.sellingPrice);
    if (req.body.status !== undefined && req.body.status !== "")
      updatedCar.status = req.body.status;

    const car = await Car.findByIdAndUpdate(req.params.id, updatedCar, {
      new: true,
      runValidators: true,
    });
    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }
    res.status(200).json({
      success: true,
      data: formatCarInstance(car),
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


router.put(
  "/:id/photos",
  protect,
  uploadCloud.array("photos", 12),
  async (req, res) => {
    try {
        let photoPaths = [];
        if (req.files && req.files.length) {
          photoPaths = req.files.map((file) => file.secure_url || file.path || file.filename);
        } else if (req.body && req.body.photos) {
          try {
            if (typeof req.body.photos === 'string') photoPaths = JSON.parse(req.body.photos);
            else if (Array.isArray(req.body.photos)) photoPaths = req.body.photos;
          } catch (e) {
            photoPaths = [];
          }
        }

      if (photoPaths.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "No photos provided" });
      }

      const car = await Car.findById(req.params.id);
      if (!car) {
        return res.status(404).json({ success: false, error: "Car not found" });
      }

      
      if (req.body.replacePhotos === "true") {
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


router.post("/:id/photo", protect, uploadCloud.single("photo"), async (req, res) => {
  try {
    
    if (!req.file && !(req.body && (req.body.photo || req.body.photoUrl))) {
      return res
        .status(400)
        .json({ success: false, error: "No photo provided" });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found" });
    }

    let photoPath = null;
    if (req.file) {
      photoPath = req.file.secure_url || req.file.path || req.file.filename;
    } else if (req.body) {
      photoPath = req.body.photo || req.body.photoUrl || null;
    }
    car.photos.push(photoPath);
    await car.save();

    res.status(200).json({
      success: true,
      data: car,
      newPhoto: photoPath,
    });
  } catch (err) {
    console.error("Error adding photo:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});


router.get("/sold", async (req, res) => {
  try {
    
    const docs = await Car.find({ status: "Sold Out" })
      .select("make model variant modelYear photos sold")
      .lean();

    const soldCars = (docs || []).map((doc) => ({
      _id: doc._id,
      make: doc.make || "",
      model: doc.model || "",
      variant: doc.variant || "",
      modelYear: doc.modelYear || "",
      photos: Array.isArray(doc.photos) ? doc.photos : [],
      sold: doc.sold || {},
    }));

    return res.json({ success: true, data: soldCars });
  } catch (err) {
    console.error("Error fetching sold cars:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


router.put("/:id/mark-sold", protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car)
      return res.status(404).json({ success: false, error: "Car not found" });
    if (car.addedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ success: false, error: "Not authorized" });

    car.status = "Sold Out";
    car.sold = car.sold || {};
    if (req.body.customerName) car.sold.customerName = req.body.customerName;
    if (req.body.testimonial) car.sold.testimonial = req.body.testimonial;
    car.sold.soldAt = req.body.soldAt ? new Date(req.body.soldAt) : new Date();

    await car.save();
    res.json({ success: true, data: car });
  } catch (err) {
    console.error("Error marking sold:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


router.post(
  "/:id/sold-photo",
  protect,
  uploadCloud.single("photo"),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "No photo provided" });
      const car = await Car.findById(req.params.id);
      if (!car)
        return res.status(404).json({ success: false, error: "Car not found" });
      if (car.addedBy.toString() !== req.user._id.toString())
        return res
          .status(401)
          .json({ success: false, error: "Not authorized" });

  const photoPath = req.file.secure_url || req.file.path || req.file.filename;
      car.sold = car.sold || {};
      car.sold.customerPhotos = car.sold.customerPhotos || [];
      car.sold.customerPhotos.push(photoPath);
      await car.save();

      
      
      try {
        const galleryItem = new Gallery({
          car: car._id,
          filename: photoPath,
          caption: req.body.caption || "",
          testimonial: req.body.testimonial || "",
          uploadedBy: req.user._id,
        });
        await galleryItem.save();
      } catch (gErr) {
        console.warn(
          "Failed to create gallery document for sold-photo upload:",
          gErr
        );
        
      }

      res.json({ success: true, data: car, newPhoto: photoPath });
    } catch (err) {
      console.error("Error adding sold photo:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
);


router.delete("/:id/sold-photo", protect, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename)
      return res
        .status(400)
        .json({ success: false, error: "filename required" });
    const car = await Car.findById(req.params.id);
    if (!car)
      return res.status(404).json({ success: false, error: "Car not found" });
    if (car.addedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ success: false, error: "Not authorized" });

    car.sold = car.sold || {};
    car.sold.customerPhotos = (car.sold.customerPhotos || []).filter(
      (p) => p !== filename && p !== `carimages/${filename}`
    );
    await car.save();

    
    const fs = require("fs");
    const filePath = path.join(
      __dirname,
      "../utils/carimages/",
      filename.replace("carimages/", "")
    );
    fs.unlink(filePath, () => {});

    res.json({ success: true, data: car });
  } catch (err) {
    console.error("Error deleting sold photo:", err);
    res.status(500).json({ success: false, error: "Server error" });
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
