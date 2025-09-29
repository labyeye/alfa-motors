const Gallery = require('../models/Gallery');
const Car = require('../models/Car');

// Upload a gallery photo (optionally associate with a car)
exports.uploadGalleryPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No photo provided' });
    const carId = req.body.carId || null;
    const caption = req.body.caption || '';
    const testimonial = req.body.testimonial || '';

    const galleryItem = new Gallery({
      car: carId,
      filename: req.file.filename,
      caption,
      testimonial,
      uploadedBy: req.user._id,
    });

    await galleryItem.save();

    // If associated with a car, also add to car.sold.customerPhotos for backwards compatibility
    if (carId) {
      const car = await Car.findById(carId);
      if (car) {
        car.sold = car.sold || {};
        car.sold.customerPhotos = car.sold.customerPhotos || [];
        car.sold.customerPhotos.push(req.file.filename);
        await car.save();
      }
    }

    return res.json({ success: true, data: galleryItem });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// List public gallery items (optionally filter by car)
exports.listGallery = async (req, res) => {
  try {
    const filter = {};
    if (req.query.carId) filter.car = req.query.carId;
    const items = await Gallery.find(filter).populate('uploadedBy', 'username').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('Gallery list error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update gallery item (caption/testimonial)
exports.updateGallery = async (req, res) => {
  try {
    const id = req.params.id;
    const { caption, testimonial } = req.body;
    const item = await Gallery.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Gallery item not found' });

    if (typeof caption !== 'undefined') item.caption = caption;
    if (typeof testimonial !== 'undefined') item.testimonial = testimonial;

    await item.save();
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error('Gallery update error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete gallery item and associated file (if present)
exports.deleteGallery = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Gallery.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Gallery item not found' });

    const filename = item.filename;
    const carId = item.car;

    // Remove the gallery document
    await Gallery.deleteOne({ _id: id });

    // If associated with a car, remove from car.sold.customerPhotos
    if (carId) {
      const car = await Car.findById(carId);
      if (car) {
        car.sold = car.sold || {};
        car.sold.customerPhotos = (car.sold.customerPhotos || []).filter(f => f !== filename);
        await car.save();
      }
    }

    // Delete file from disk
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../utils/carimages', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.warn('Failed to delete gallery file from disk:', fsErr);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Gallery delete error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete ALL gallery items and associated files (admin only)
exports.deleteAllGallery = async (req, res) => {
  try {
    const items = await Gallery.find().lean();
    const filenames = items.map((i) => i.filename).filter(Boolean);

    // Remove filenames from any car.sold.customerPhotos arrays
    if (filenames.length > 0) {
      await Car.updateMany(
        { 'sold.customerPhotos': { $in: filenames } },
        { $pull: { 'sold.customerPhotos': { $in: filenames } } }
      );
    }

    // Delete gallery documents
    await Gallery.deleteMany({});

    // Delete files from disk
    try {
      const fs = require('fs');
      const path = require('path');
      const imagesDir = path.join(__dirname, '../utils/carimages');
      for (const fname of filenames) {
        const filePath = path.join(imagesDir, fname);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('Failed to unlink file', filePath, e);
          }
        }
      }
    } catch (fsErr) {
      console.warn('Failed to delete gallery files from disk:', fsErr);
    }

    return res.json({ success: true, deletedCount: filenames.length });
  } catch (err) {
    console.error('Delete all gallery error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
