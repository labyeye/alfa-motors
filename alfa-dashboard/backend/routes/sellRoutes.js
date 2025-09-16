const express = require('express');
const router = express.Router();
const SellRequest = require('../models/SellRequest');
const multer = require('multer');
const path = require('path');
const {protect} = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    if (!brand || !model || !year || !price || !name || !email || !phone) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const images = req.files ? req.files.map(file => file.filename) : [];

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
    res.status(201).json({
      message: "Sell request submitted successfully! We will contact you shortly.",
      request: sellRequest
    });
  } catch (err) {
    console.error("Error submitting sell request:", err);
    res.status(500).json({ error: "Failed to submit sell request. Please try again." });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching sell requests:", err);
    res.status(500).json({ error: "Error loading sell requests" });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedRequest = await SellRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Sell request not found" });
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error("Error updating sell request:", err);
    res.status(500).json({ error: "Error updating sell request" });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Sell request not found" });
    }
    res.json(request);
  } catch (err) {
    console.error("Error fetching sell request:", err);
    res.status(500).json({ error: "Error loading sell request" });
  }
});

module.exports = router;
