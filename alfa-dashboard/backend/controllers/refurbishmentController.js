const { Refurbishment } = require('../models_sql/RefurbishmentSQL');
const { Car } = require('../models_sql/CarSQL');

exports.createRefurbishment = async (req, res) => {
  try {
    const { car, items, notes } = req.body;

    if (!car) return res.status(400).json({ success: false, message: 'Car id is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one refurbishment item is required' });
    }

    // confirm car exists
    const foundCar = await Car.findByPk(car);
    if (!foundCar) return res.status(404).json({ success: false, message: 'Car not found' });

    const refurbishment = await Refurbishment.create({ car, items, notes, createdBy: req.user.id });

    res.status(201).json({ success: true, data: refurbishment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRefurbishments = async (req, res) => {
  try {
    const where = {};
    // admins see all
    if (req.user.role !== 'admin') {
      where.createdBy = req.user.id;
    }

    const list = await Refurbishment.findAll({ where, order: [['createdAt', 'DESC']], raw: true });
    // Attach car info (lightweight)
    const withCar = await Promise.all(list.map(async (r) => {
      const car = await Car.findByPk(r.car);
      return Object.assign({}, r, { car: car || null });
    }));
    res.status(200).json({ success: true, count: withCar.length, data: withCar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRefurbishment = async (req, res) => {
  try {
    const refurbishment = await Refurbishment.findByPk(req.params.id, { raw: true });
    if (!refurbishment) return res.status(404).json({ success: false, message: 'Not found' });

    // owner or admin
    const isOwner = refurbishment.createdBy && refurbishment.createdBy.toString() === req.user.id.toString();
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized' });

    const car = await Car.findByPk(refurbishment.car);
    res.status(200).json({ success: true, data: Object.assign({}, refurbishment, { car }) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateRefurbishment = async (req, res) => {
  try {
    const refurbishment = await Refurbishment.findByPk(req.params.id);
    if (!refurbishment) return res.status(404).json({ success: false, message: 'Not found' });

    const isOwner = refurbishment.createdBy && refurbishment.createdBy.toString() === req.user.id.toString();
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized' });

    await refurbishment.update(req.body);
    res.status(200).json({ success: true, data: refurbishment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteRefurbishment = async (req, res) => {
  try {
    const refurbishment = await Refurbishment.findByPk(req.params.id);
    if (!refurbishment) return res.status(404).json({ success: false, message: 'Not found' });

    const isOwner = refurbishment.createdBy && refurbishment.createdBy.toString() === req.user.id.toString();
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized' });

    await Refurbishment.destroy({ where: { id: refurbishment.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
