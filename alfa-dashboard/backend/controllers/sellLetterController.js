const { SellLetter } = require('../models_sql/SellLetterSQL');
const { formatObjectPrices } = require('../utils/formatIndian');

exports.createSellLetter = async (req, res) => {
  try {
    const created = await SellLetter.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(formatObjectPrices(created.get ? created.get({ plain: true }) : created));
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getSellLetters = async (req, res) => {
  try {
    const sellLetters = await SellLetter.findAll({ order: [['createdAt', 'DESC']] });
    res.json((sellLetters || []).map(sl => formatObjectPrices(sl.get ? sl.get({ plain: true }) : sl)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSellLettersByRegistration = async (req, res) => {
  try {
    const { registrationNumber } = req.query;
    if (!registrationNumber) return res.status(400).json({ message: 'Registration number is required' });
    // SellLetterSQL does not store registrationNumber directly; return empty result
    // or implement search across related car records if needed.
    return res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMySellLetters = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'admin') where.createdBy = req.user.id;
    const sellLetters = await SellLetter.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json((sellLetters || []).map(sl => formatObjectPrices(sl.get ? sl.get({ plain: true }) : sl)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSellLetterById = async (req, res) => {
  try {
    const sellLetter = await SellLetter.findByPk(req.params.id);
    if (!sellLetter) return res.status(404).json({ message: 'Sell letter not found' });
    // authorization: if not admin, ensure owner
    if (req.user.role !== 'admin' && String(sellLetter.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(formatObjectPrices(sellLetter.get ? sellLetter.get({ plain: true }) : sellLetter));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSellLetter = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to update sell letters' });
    const sellLetter = await SellLetter.findByPk(req.params.id);
    if (!sellLetter) return res.status(404).json({ message: 'Sell letter not found' });
    await sellLetter.update(req.body);
    res.json(formatObjectPrices(sellLetter.get ? sellLetter.get({ plain: true }) : sellLetter));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteSellLetter = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to update sell letters' });
    const sellLetter = await SellLetter.findByPk(req.params.id);
    if (!sellLetter) return res.status(404).json({ message: 'Sell letter not found' });
    await sellLetter.destroy();
    res.json({ message: 'Sell letter removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
