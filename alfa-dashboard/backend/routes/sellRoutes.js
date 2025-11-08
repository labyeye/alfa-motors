const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SellRequest = require('../models/SellRequest');
const { protect } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    const missing = [brand, model, year, price, name, email, phone].some((v) => v === undefined || v === null || v === '');
    if (missing) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const images = Array.isArray(req.files) ? req.files.map((f) => f.filename) : [];

    const sellRequest = new SellRequest({
      brand,
      model,
      year,
      expectedPrice: price,
      images,
      sellerName: name,
      sellerEmail: email,
      sellerPhone: phone,
    });

    await sellRequest.save();

    return res.status(201).json({ message: 'Sell request submitted successfully! We will contact you shortly.', request: sellRequest });
  } catch (err) {
    console.error('Error submitting sell request:', err);
    return res.status(500).json({ error: 'Failed to submit sell request. Please try again.' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error('Error fetching sell requests:', err);
    return res.status(500).json({ error: 'Error loading sell requests' });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedRequest = await SellRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Sell request not found' });
    }

    return res.json(updatedRequest);
  } catch (err) {
    console.error('Error updating sell request:', err);
    return res.status(500).json({ error: 'Error updating sell request' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const request = await SellRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Sell request not found' });
    return res.json(request);
  } catch (err) {
    console.error('Error fetching sell request:', err);
    return res.status(500).json({ error: 'Error loading sell request' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await SellRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Sell request not found' });

    if (Array.isArray(request.images) && request.images.length > 0) {
      for (const filename of request.images) {
        try {
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to remove image file:', filename, err);
        }
      }
    }

    await SellRequest.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Sell request deleted' });
  } catch (err) {
    console.error('Error deleting sell request:', err);
    return res.status(500).json({ error: 'Failed to delete sell request' });
  }
});

module.exports = router;
