const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { SellRequest } = require('../models_sql/SellRequestSQL');
// Ensure the table exists in SQL
SellRequest.sync({ alter: true }).catch(err => console.error('[SellRequest] Sync failed:', err));

const { upload } = require('../utils/multerMemory');
const { uploadBufferToXOZZ } = require('../utils/xozzUpload');
const { protect } = require('../middleware/auth');
const { formatObjectPrices } = require('../utils/formatIndian');

// Helper to map SQL record to Mongo-style object for frontend compatibility
function mapToFrontend(request) {
  const plain = request.get ? request.get({ plain: true }) : request;
  let details = plain.vehicleDetails || {};
  
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      console.error('[SellRequest] Failed to parse vehicleDetails JSON:', e.message);
      details = {};
    }
  }

  // Fallbacks for direct properties if nested details are missing
  const brand = details.brand || '';
  const model = details.model || '';
  const year = details.year || '';
  const expectedPrice = details.expectedPrice || details.price || 0;
  const images = details.images || [];

  return formatObjectPrices({
    _id: plain.id,
    brand,
    model: model,
    year: year,
    expectedPrice,
    images: Array.isArray(images) ? images : [],
    sellerName: plain.customerName || '',
    sellerPhone: details.sellerPhone || plain.contact || '',
    sellerEmail: details.sellerEmail || '',
    status: (plain.status || 'Pending').charAt(0).toUpperCase() + (plain.status || 'Pending').slice(1).toLowerCase(),
    createdAt: plain.createdAt
  });
}

// @route   POST /api/sell-requests
// @desc    Submit a new sell request with images (uploaded to XOZZ)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    const missing = [brand, model, year, price, name, email, phone].some((v) => v === undefined || v === null || v === '');
    if (missing) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Upload images to XOZZ
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadBufferToXOZZ(file.buffer, file.originalname, file.mimetype)
      );
      const uploadResults = await Promise.all(uploadPromises);
      uploadResults.forEach(result => {
        if (result && result.url) imageUrls.push(result.url);
      });
    }

    // Create SQL record
    const sellRequest = await SellRequest.create({
      customerName: name,
      contact: phone, // primary contact stored in contact column
      vehicleDetails: {
        brand,
        model,
        year,
        expectedPrice: price,
        images: imageUrls,
        sellerEmail: email,
        sellerPhone: phone
      },
      status: 'Pending'
    });

    return res.status(201).json({ 
      message: 'Sell request submitted successfully!', 
      request: mapToFrontend(sellRequest) 
    });
  } catch (err) {
    console.error('Error submitting sell request:', err);
    return res.status(500).json({ error: 'Failed to submit sell request. Please try again.' });
  }
});

// @route   GET /api/sell-requests
// @desc    Get all sell requests (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const requests = await SellRequest.findAll({ 
      order: [['createdAt', 'DESC']] 
    });
    return res.json((requests || []).map(mapToFrontend));
  } catch (err) {
    console.error('Error fetching sell requests:', err);
    return res.status(500).json({ error: 'Error loading sell requests' });
  }
});

// @route   PATCH /api/sell-requests/:id/status
// @desc    Update sell request status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const request = await SellRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Sell request not found' });
    }

    request.status = status;
    await request.save();

    return res.json(mapToFrontend(request));
  } catch (err) {
    console.error('Error updating sell request:', err);
    return res.status(500).json({ error: 'Error updating sell request' });
  }
});

// @route   GET /api/sell-requests/:id
// @desc    Get single sell request
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await SellRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Sell request not found' });
    return res.json(mapToFrontend(request));
  } catch (err) {
    console.error('Error fetching sell request:', err);
    return res.status(500).json({ error: 'Error loading sell request' });
  }
});

// @route   DELETE /api/sell-requests/:id
// @desc    Delete sell request
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await SellRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Sell request not found' });

    await request.destroy();
    return res.json({ message: 'Sell request deleted' });
  } catch (err) {
    console.error('Error deleting sell request:', err);
    return res.status(500).json({ error: 'Failed to delete sell request' });
  }
});

module.exports = router;
