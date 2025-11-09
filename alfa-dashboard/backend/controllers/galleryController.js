const { Gallery } = require('../models_sql/GallerySQL');
const { Car } = require('../models_sql/CarSQL');
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

    // Attempt to upload the received file to Cloudinary. If that fails,
    // fall back to saving a local filename (existing behavior).
    let storedFilename = '';
    try {
      // multer with diskStorage provides `req.file.path` as the local filepath
      if (req.file && req.file.path) {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: 'carimages',
          resource_type: 'image',
        });
        storedFilename = uploadRes.secure_url || uploadRes.url || '';

        // delete local temp file after successful cloud upload
        try {
          if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (delErr) {
          console.warn('Failed to remove local upload file:', delErr);
        }
      } else if (req.file && (req.file.secure_url || req.file.url)) {
        storedFilename = req.file.secure_url || req.file.url;
      } else {
        storedFilename = req.file.filename || '';
      }
    } catch (uploadErr) {
      console.warn('Cloudinary upload failed, falling back to local filename/path', uploadErr);
      // Fallback: try to use the filename or path so existing serving logic remains valid
      storedFilename = req.file && (req.file.filename || req.file.path || req.file.url || req.file.secure_url) || '';
    }

    const galleryItem = await Gallery.create({
      car: carId,
      filename: storedFilename,
      caption,
      testimonial,
      uploadedBy: req.user.id,
    });

    // If associated with a car, also add to car.soldCustomerPhotos (SQL column soldCustomerPhotos)
    if (carId) {
      const car = await Car.findByPk(carId);
      if (car) {
        const existing = Array.isArray(car.soldCustomerPhotos) ? car.soldCustomerPhotos : (car.soldCustomerPhotos || []);
        existing.push(storedFilename);
        car.soldCustomerPhotos = existing;
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
    const where = {};
    if (req.query.carId) where.car = req.query.carId;
    const items = await Gallery.findAll({ where, order: [['createdAt', 'DESC']] });
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
    const item = await Gallery.findByPk(id);
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
    const item = await Gallery.findByPk(id);
    if (!item) return res.status(404).json({ success: false, error: 'Gallery item not found' });

    const filename = item.filename;
    const carId = item.car;

    await Gallery.destroy({ where: { id } });

    if (carId) {
      const car = await Car.findByPk(carId);
      if (car) {
        const existing = Array.isArray(car.soldCustomerPhotos) ? car.soldCustomerPhotos : (car.soldCustomerPhotos || []);
        car.soldCustomerPhotos = existing.filter(f => f !== filename);
        await car.save();
      }
    }

    // Delete file from disk or Cloudinary depending on how it was stored
    try {
      if (filename && (filename.startsWith('http://') || filename.startsWith('https://'))) {
        try {
          const parts = filename.split('/upload/');
          if (parts.length > 1) {
            let publicId = parts[1];
            publicId = publicId.replace(/^v\d+\//, '');
            publicId = publicId.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '');
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
          }
        } catch (cErr) {
          console.warn('Failed to delete Cloudinary image:', cErr);
        }
      } else {
        const filePath = path.join(__dirname, '../utils/carimages', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
    const items = await Gallery.findAll({ raw: true });
    const filenames = items.map((i) => i.filename).filter(Boolean);

    // Remove filenames from any car.soldCustomerPhotos arrays
    if (filenames.length > 0) {
      const cars = await Car.findAll();
      for (const car of cars) {
        const arr = Array.isArray(car.soldCustomerPhotos) ? car.soldCustomerPhotos : (car.soldCustomerPhotos || []);
        const filtered = arr.filter(f => !filenames.includes(f));
        if (filtered.length !== arr.length) {
          car.soldCustomerPhotos = filtered;
          await car.save();
        }
      }
    }

    await Gallery.destroy({ where: {} });

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
