const Gallery = require('../models/Gallery');
const Car = require('../models/Car');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Upload a gallery photo (optionally associate with a car)
exports.uploadGalleryPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No photo provided' });
    const carId = req.body.carId || null;
    const caption = req.body.caption || '';
    const testimonial = req.body.testimonial || '';

    // Determine stored filename/URL. When using multer-storage-cloudinary, req.file.path
    // will usually be the full uploaded URL. For local storage, req.file.filename is used.
    let storedFilename = '';
    if (req.file) {
      // prefer a full URL if provided by the storage engine
      storedFilename = req.file.path || req.file.secure_url || req.file.url || req.file.filename || '';
    }

    const galleryItem = new Gallery({
      car: carId,
      filename: storedFilename,
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

    // Delete file from disk or Cloudinary depending on how it was stored
    try {
      if (filename && (filename.startsWith('http://') || filename.startsWith('https://'))) {
        // Attempt to derive public_id for Cloudinary and delete
        try {
          const parts = filename.split('/upload/');
          if (parts.length > 1) {
            let publicId = parts[1];
            // strip version prefix like v12345/
            publicId = publicId.replace(/^v\d+\//, '');
            // remove file extension and any query params
            publicId = publicId.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '');
            // Destroy on cloudinary
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
          }
        } catch (cErr) {
          console.warn('Failed to delete Cloudinary image:', cErr);
        }
      } else {
        // Local disk file
        const filePath = path.join(__dirname, '../utils/carimages', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fsErr) {
      console.warn('Failed to delete gallery file from disk or cloud:', fsErr);
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

    // Delete files from Cloudinary or disk depending on how they are stored
    try {
      for (const fname of filenames) {
        if (!fname) continue;
        if (fname.startsWith('http://') || fname.startsWith('https://')) {
          try {
            const parts = fname.split('/upload/');
            if (parts.length > 1) {
              let publicId = parts[1];
              publicId = publicId.replace(/^v\d+\//, '');
              publicId = publicId.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '');
              await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
            }
          } catch (e) {
            console.warn('Failed to delete cloudinary file', fname, e);
          }
        } else {
          try {
            const filePath = path.join(__dirname, '../utils/carimages', fname);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.warn('Failed to unlink file', fname, e);
          }
        }
      }
    } catch (fsErr) {
      console.warn('Failed to delete gallery files from disk/cloud:', fsErr);
    }

    return res.json({ success: true, deletedCount: filenames.length });
  } catch (err) {
    console.error('Delete all gallery error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
