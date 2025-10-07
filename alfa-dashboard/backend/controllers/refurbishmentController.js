const Refurbishment = require('../models/Refurbishment');
const Car = require('../models/Car');

exports.createRefurbishment = async (req, res) => {
  try {
    const { car, items, notes } = req.body;

    if (!car) return res.status(400).json({ success: false, message: 'Car id is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one refurbishment item is required' });
    }

    // confirm car exists
    const foundCar = await Car.findById(car);
    if (!foundCar) return res.status(404).json({ success: false, message: 'Car not found' });

    const refurbishment = new Refurbishment({ car, items, notes, user: req.user.id });
    await refurbishment.save();

    res.status(201).json({ success: true, data: refurbishment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRefurbishments = async (req, res) => {
  try {
    const query = {};
    // admins see all
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const list = await Refurbishment.find(query).populate('car').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRefurbishment = async (req, res) => {
  try {
    const refurbishment = await Refurbishment.findById(req.params.id).populate('car');
    if (!refurbishment) return res.status(404).json({ success: false, message: 'Not found' });

    // owner or admin
    const isOwner = refurbishment.user && refurbishment.user.toString() === req.user.id.toString();
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.status(200).json({ success: true, data: refurbishment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateRefurbishment = async (req, res) => {
  try {
    const refurbishment = await Refurbishment.findById(req.params.id);
    if (!refurbishment) return res.status(404).json({ success: false, message: 'Not found' });

    const isOwner = refurbishment.user && refurbishment.user.toString() === req.user.id.toString();
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized' });

    Object.assign(refurbishment, req.body);
    await refurbishment.save();
    res.status(200).json({ success: true, data: refurbishment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteRefurbishment = async (req, res) => {
  try {
    const refurbishment = await Refurbishment.findById(req.params.id);
    if (!refurbishment) return res.status(404).json({ success: false, message: 'Not found' });

    const isOwner = refurbishment.user && refurbishment.user.toString() === req.user.id.toString();
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized' });

    await Refurbishment.deleteOne({ _id: refurbishment._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
