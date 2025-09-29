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
