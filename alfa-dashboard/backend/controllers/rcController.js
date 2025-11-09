const { Rc } = require('../models_sql/RcSQL');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Note: RcSQL stores flexible data in `details` JSON; we store legacy fields
// such as createdBy, pdfUrl, rtoFeesPaid, returnedToDealer inside details.

exports.createRcEntry = async (req, res, next) => {
  try {
    // merge provided details with createdBy marker
    const incomingDetails = req.body.details || {};
    const details = Object.assign({}, incomingDetails, { createdBy: req.user.id });

    // map well-known detail fields to top-level columns for easier queries
    const rcData = {
      carId: req.body.carId || null,
      holderName: req.body.holderName || incomingDetails.ownerName || null,
      registrationNumber: req.body.registrationNumber || incomingDetails.registrationNumber || null,
      vehicleName: incomingDetails.vehicleName || null,
      ownerPhone: incomingDetails.ownerPhone || null,
      applicantName: incomingDetails.applicantName || null,
      applicantPhone: incomingDetails.applicantPhone || null,
      work: incomingDetails.work || null,
      dealerName: incomingDetails.dealerName || null,
      rtoAgentName: incomingDetails.rtoAgentName || null,
      remarks: incomingDetails.remarks || null,
      // status flags
      rtoFeesPaid: incomingDetails.status ? Boolean(incomingDetails.status.rtoFeesPaid) : Boolean(req.body.rtoFeesPaid) || false,
      rcTransferred: incomingDetails.status ? Boolean(incomingDetails.status.rcTransferred) : Boolean(req.body.rcTransferred) || false,
      returnedToDealer: incomingDetails.status ? Boolean(incomingDetails.status.returnedToDealer) : Boolean(req.body.returnedToDealer) || false,
      // pdf fields (may not be present on create)
      pdfUrl: incomingDetails.pdfUrl || req.body.pdfUrl || null,
      pdfPublicId: incomingDetails.pdfPublicId || req.body.pdfPublicId || null,
      details,
    };

    const rcEntry = await Rc.create(rcData);
    // normalize result for frontend compatibility
    const plain = rcEntry.get ? rcEntry.get({ plain: true }) : rcEntry;
    const normalized = normalizeRc(plain);
    res.status(201).json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
};

exports.getAllRcEntries = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role !== 'admin') where['details'] = { createdBy: req.user.id };
    const rcEntries = await Rc.findAll({ where, order: [['createdAt', 'DESC']] });
    const normalized = (rcEntries || []).map((r) => normalizeRc(r.get ? r.get({ plain: true }) : r));
    res.status(200).json({ success: true, count: normalized.length, data: normalized });
  } catch (err) {
    next(err);
  }
};

exports.getRcEntryById = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findByPk(req.params.id);
    if (!rcEntry) return res.status(404).json({ success: false, message: 'RC Entry not found' });
    const plain = rcEntry.get ? rcEntry.get({ plain: true }) : rcEntry;
    res.status(200).json({ success: true, data: normalizeRc(plain) });
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
    if (req.body.rcTransferred !== undefined) newDetails.rcTransferred = Boolean(req.body.rcTransferred);
    // map common fields into top-level columns as well when provided
    if (req.body.details) {
      const d = req.body.details;
      if (d.vehicleName !== undefined) updateData.vehicleName = d.vehicleName;
      if (d.ownerPhone !== undefined) updateData.ownerPhone = d.ownerPhone;
      if (d.applicantName !== undefined) updateData.applicantName = d.applicantName;
      if (d.applicantPhone !== undefined) updateData.applicantPhone = d.applicantPhone;
      if (d.work !== undefined) updateData.work = d.work;
      if (d.dealerName !== undefined) updateData.dealerName = d.dealerName;
      if (d.rtoAgentName !== undefined) updateData.rtoAgentName = d.rtoAgentName;
      if (d.remarks !== undefined) updateData.remarks = d.remarks;
      if (d.pdfUrl !== undefined) updateData.pdfUrl = d.pdfUrl;
      if (d.pdfPublicId !== undefined) updateData.pdfPublicId = d.pdfPublicId;
      if (d.status) {
        if (d.status.rtoFeesPaid !== undefined) updateData.rtoFeesPaid = Boolean(d.status.rtoFeesPaid);
        if (d.status.rcTransferred !== undefined) updateData.rcTransferred = Boolean(d.status.rcTransferred);
        if (d.status.returnedToDealer !== undefined) updateData.returnedToDealer = Boolean(d.status.returnedToDealer);
      }
    }

    updateData.details = newDetails;

    await rcEntry.update(updateData);
    // refetch fresh
    const fresh = await Rc.findByPk(req.params.id);
    const plain = fresh.get ? fresh.get({ plain: true }) : fresh;
    res.status(200).json({ success: true, data: normalizeRc(plain) });
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

    // delete old pdf if exists (local file or cloudinary raw resource)
    try {
      if (rcEntry.details) {
        // delete local file if previously stored under /utils/uploads/
        if (rcEntry.details.pdfUrl && String(rcEntry.details.pdfUrl).includes('/utils/uploads/')) {
          try {
            const oldFilePath = path.join(__dirname, '../utils/uploads', String(rcEntry.details.pdfUrl).split('/uploads/')[1] || '');
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              console.log('Old local PDF file deleted:', oldFilePath);
            }
          } catch (fileError) {
            console.error('Error deleting old local PDF file:', fileError);
          }
        }

        // delete old cloudinary raw resource if pdfPublicId present
        if (rcEntry.details.pdfPublicId) {
          try {
            await cloudinary.uploader.destroy(String(rcEntry.details.pdfPublicId), { resource_type: 'raw' });
            console.log('Old Cloudinary PDF deleted:', rcEntry.details.pdfPublicId);
          } catch (cloudErr) {
            console.error('Error deleting old Cloudinary PDF:', cloudErr);
          }
        }
      }
    } catch (e) {
      console.error('Cleanup error before upload:', e);
    }

    // req.file from Cloudinary storage should include path (secure_url) and filename (public_id)
    let newPdfUrl = (req.file && (req.file.path || req.file.secure_url || req.file.url)) || null;
    let newPdfPublicId = (req.file && (req.file.filename || req.file.public_id)) || null;

    // If the storage didn't return a URL but provided a public id, try to fetch resource info
    if (!newPdfUrl && newPdfPublicId) {
      try {
        const info = await cloudinary.api.resource(String(newPdfPublicId), { resource_type: 'raw' });
        if (info && info.secure_url) newPdfUrl = info.secure_url;
      } catch (e) {
        // ignore; we'll still store what we have
        console.error('Cloudinary lookup failed for public id', newPdfPublicId, e.message || e);
      }
    }

  const details = Object.assign({}, rcEntry.details || {}, { pdfUrl: newPdfUrl });
  if (newPdfPublicId) details.pdfPublicId = newPdfPublicId;

  // update both details JSON and top-level pdf fields for convenience
  const updateData = { details };
  if (newPdfUrl !== null) updateData.pdfUrl = newPdfUrl;
  if (newPdfPublicId) updateData.pdfPublicId = newPdfPublicId;

    await rcEntry.update(updateData);
    // refetch updated entry
    const updated = await Rc.findByPk(req.params.id);
    const plain = updated.get ? updated.get({ plain: true }) : updated;
    res.status(200).json({ success: true, data: normalizeRc(plain) });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

// Helper to normalize a DB row into the legacy frontend shape
function normalizeRc(row) {
  if (!row) return row;
  const details = row.details || {};
  const statusFromDetails = details.status || {};
  return Object.assign({}, row, {
    vehicleRegNo: row.registrationNumber || details.registrationNumber || '',
    vehicleName: row.vehicleName || details.vehicleName || '',
    ownerName: row.holderName || details.ownerName || '',
    applicantName: row.applicantName || details.applicantName || '',
    ownerPhone: row.ownerPhone || details.ownerPhone || '',
    applicantPhone: row.applicantPhone || details.applicantPhone || '',
    work: row.work || details.work || '',
    dealerName: row.dealerName || details.dealerName || '',
    rtoAgentName: row.rtoAgentName || details.rtoAgentName || '',
    remarks: row.remarks || details.remarks || '',
    status: Object.assign({}, {
      rcTransferred: !!row.rcTransferred,
      rtoFeesPaid: !!row.rtoFeesPaid,
      returnedToDealer: !!row.returnedToDealer,
    }, statusFromDetails),
    pdfUrl: row.pdfUrl || details.pdfUrl || null,
    pdfPublicId: row.pdfPublicId || details.pdfPublicId || null,
  });
}
