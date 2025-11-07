const { Rc } = require('../models_sql/RcSQL');
const path = require('path');
const fs = require('fs');

// Note: RcSQL stores flexible data in `details` JSON; we store legacy fields
// such as createdBy, pdfUrl, rtoFeesPaid, returnedToDealer inside details.

exports.createRcEntry = async (req, res, next) => {
  try {
    const details = Object.assign({}, req.body.details || {}, { createdBy: req.user.id });
    const rcData = {
      carId: req.body.carId || null,
      holderName: req.body.holderName || null,
      registrationNumber: req.body.registrationNumber || null,
      details,
    };
    const rcEntry = await Rc.create(rcData);
    res.status(201).json({ success: true, data: rcEntry });
  } catch (err) {
    next(err);
  }
};

exports.getAllRcEntries = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role !== 'admin') where['details'] = { createdBy: req.user.id };
    const rcEntries = await Rc.findAll({ where, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, count: rcEntries.length, data: rcEntries });
  } catch (err) {
    next(err);
  }
};

exports.getRcEntryById = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findByPk(req.params.id);
    if (!rcEntry) return res.status(404).json({ success: false, message: 'RC Entry not found' });
    res.status(200).json({ success: true, data: rcEntry });
  } catch (err) {
    next(err);
  }
};

exports.updateRcEntry = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findByPk(req.params.id);
    if (!rcEntry) return res.status(404).json({ success: false, message: 'RC Entry not found' });
    const createdBy = rcEntry.details && rcEntry.details.createdBy ? String(rcEntry.details.createdBy) : null;
    if (req.user.role !== 'admin' && createdBy !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized to update this RC entry' });

    const updateData = {};
    if (req.body.carId !== undefined) updateData.carId = req.body.carId;
    if (req.body.holderName !== undefined) updateData.holderName = req.body.holderName;
    if (req.body.registrationNumber !== undefined) updateData.registrationNumber = req.body.registrationNumber;

    // preserve and merge details JSON
    const newDetails = Object.assign({}, rcEntry.details || {}, req.body.details || {});
    if (req.body.rtoFeesPaid !== undefined) newDetails.rtoFeesPaid = Boolean(req.body.rtoFeesPaid);
    if (req.body.returnedToDealer !== undefined) newDetails.returnedToDealer = Boolean(req.body.returnedToDealer);
    updateData.details = newDetails;

    await rcEntry.update(updateData);
    res.status(200).json({ success: true, data: rcEntry });
  } catch (err) {
    console.error('Update error:', err);
    next(err);
  }
};

exports.deleteRcEntry = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findByPk(req.params.id);
    if (!rcEntry) return res.status(404).json({ success: false, message: 'RC Entry not found' });
    const createdBy = rcEntry.details && rcEntry.details.createdBy ? String(rcEntry.details.createdBy) : null;
    if (req.user.role !== 'admin' && createdBy !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized to delete this RC entry' });

    // delete associated PDF if present in details
    if (rcEntry.details && rcEntry.details.pdfUrl) {
      try {
        const filePath = path.join(__dirname, '../utils/uploads', String(rcEntry.details.pdfUrl).split('/uploads/')[1] || '');
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('PDF file deleted:', filePath);
        }
      } catch (fileError) {
        console.error('Error deleting PDF file:', fileError);
      }
    }
    await rcEntry.destroy();
    res.status(200).json({ success: true, message: 'RC entry deleted successfully', data: {} });
  } catch (err) {
    console.error('Delete error:', err);
    next(err);
  }
};

exports.uploadRcPdf = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findByPk(req.params.id);
    if (!rcEntry) return res.status(404).json({ success: false, message: 'RC Entry not found' });
    const createdBy = rcEntry.details && rcEntry.details.createdBy ? String(rcEntry.details.createdBy) : null;
    if (req.user.role !== 'admin' && createdBy !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized to upload PDF for this RC entry' });

    // delete old pdf if exists
    if (rcEntry.details && rcEntry.details.pdfUrl) {
      try {
        const oldFilePath = path.join(__dirname, '../utils/uploads', String(rcEntry.details.pdfUrl).split('/uploads/')[1] || '');
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('Old PDF file deleted:', oldFilePath);
        }
      } catch (fileError) {
        console.error('Error deleting old PDF file:', fileError);
      }
    }

    const details = Object.assign({}, rcEntry.details || {}, { pdfUrl: `/utils/uploads/${req.file.filename}` });
    await rcEntry.update({ details });
    res.status(200).json({ success: true, data: rcEntry });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};
