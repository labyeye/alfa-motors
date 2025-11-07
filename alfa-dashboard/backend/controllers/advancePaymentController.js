const { AdvancePayment } = require('../models_sql/AdvancePaymentSQL');
const { SellLetter } = require('../models_sql/SellLetterSQL');

exports.createPayment = async (req, res) => {
  try {
    const { sellLetter, amount, paymentMethod, note } = req.body;
    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ success: false, message: 'Amount is required and must be > 0' });
    if (sellLetter) {
      const sl = await SellLetter.findByPk(sellLetter);
      if (!sl) return res.status(404).json({ success: false, message: 'Sell letter not found' });
    }
    const payment = await AdvancePayment.create({
      sellLetterId: sellLetter || null,
      amount: Number(amount),
      paymentMethod,
      note,
      paidBy: req.user.id,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const where = {};
    if (req.query.sellLetter) where.sellLetterId = req.query.sellLetter;
    if (req.user.role !== 'admin') where.paidBy = req.user.id;
    const payments = await AdvancePayment.findAll({ where, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await AdvancePayment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role !== 'admin' && String(payment.paidBy) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await AdvancePayment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role !== 'admin' && String(payment.paidBy) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await payment.destroy();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
