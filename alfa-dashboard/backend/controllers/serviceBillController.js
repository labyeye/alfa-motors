// controllers/serviceBillController.js
const { ServiceBill } = require('../models_sql/ServiceBillSQL');
const { generateServiceBillPDF } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { formatIndianNumber, formatObjectPrices } = require('../utils/formatIndian');

// Create a new service bill
exports.createServiceBill = async (req, res) => {
  try {
    const { serviceItems, ...otherData } = req.body;

    // Normalize registration number from common field names
    const registrationNumber =
      otherData.registrationNumber ||
      otherData.regNo ||
      otherData.reg_number ||
      otherData.reg_num ||
      otherData.registration ||
      otherData.reg ||
      null;

    // Basic server-side validation for required fields
    const missing = [];
    const requiredFields = [
      "customerName",
      "customerPhone",
      "customerAddress",
      "vehicleType",
      "vehicleBrand",
      "vehicleModel",
      "kmReading",
      "deliveryDate",
      "serviceType",
    ];

    requiredFields.forEach((f) => {
      if (!otherData[f] && f !== "kmReading") missing.push(f);
    });

    // kmReading may be provided as km or kmReading
    if (
      otherData.kmReading === undefined &&
      otherData.km === undefined &&
      otherData.km_reading === undefined
    ) {
      missing.push("kmReading");
    }

    if (
      !serviceItems ||
      !Array.isArray(serviceItems) ||
      serviceItems.length === 0
    ) {
      missing.push("serviceItems");
    }

    // registrationNumber is optional now; do not force it as required

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing,
      });
    }

    // Calculate amounts safely
    const totalAmount = serviceItems.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );
    const taxRate = Number(otherData.taxRate) || 0;
    const taxAmount = (taxRate / 100) * totalAmount;
    const grandTotal =
      totalAmount + taxAmount - (Number(otherData.discount) || 0);
    const balanceDue = grandTotal - (Number(otherData.advancePaid) || 0);

    const serviceBillData = {
      customerName: otherData.customerName,
      customerPhone: otherData.customerPhone,
      customerAddress: otherData.customerAddress,
      customerEmail: otherData.customerEmail,
      vehicleType: otherData.vehicleType,
      vehicleBrand: otherData.vehicleBrand,
      vehicleModel: otherData.vehicleModel,
      registrationNumber,
      chassisNumber: otherData.chassisNumber,
      engineNumber: otherData.engineNumber,
      kmReading: Number(otherData.kmReading || otherData.km || 0),
      serviceDate: otherData.serviceDate || Date.now(),
      deliveryDate: otherData.deliveryDate,
      serviceType: otherData.serviceType,
      serviceItems,
      totalAmount,
      discount: Number(otherData.discount) || 0,
      taxEnabled: Boolean(otherData.taxEnabled),
      businessName: otherData.businessName,
      businessGSTIN: otherData.businessGSTIN,
      businessAddress: otherData.businessAddress,
      taxRate,
      taxAmount,
      grandTotal,
      paymentMethod: otherData.paymentMethod || "cash",
      paymentStatus: otherData.paymentStatus || "pending",
      advancePaid: Number(otherData.advancePaid) || 0,
      balanceDue,
      issuesReported: otherData.issuesReported,
      technicianNotes: otherData.technicianNotes,
      warrantyInfo: otherData.warrantyInfo,
      createdBy: req.user.id,
    };
    const serviceBill = await ServiceBill.create(serviceBillData);
    // generate PDF and attach metadata if generator returns urls/paths
    try {
      const { pdfUrl, filePath } = await generateServiceBillPDF(serviceBill);
      if (pdfUrl || filePath) {
        await serviceBill.update({ pdfUrl: pdfUrl || null, pdfPath: filePath || null });
      }
    } catch (pdfErr) {
      // non-fatal: continue returning created record
      console.warn('PDF generation failed:', pdfErr.message || pdfErr);
    }
    res.status(201).json({ success: true, data: formatObjectPrices(serviceBill.get ? serviceBill.get({ plain: true }) : serviceBill) });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all service bills
exports.getServiceBills = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'admin') where.createdBy = req.user.id;
    const serviceBills = await ServiceBill.findAll({ where, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, count: serviceBills.length, data: (serviceBills || []).map(sb => formatObjectPrices(sb.get ? sb.get({ plain: true }) : sb)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Add to serviceBillController.js
exports.getServiceBillsByRegistration = async (req, res) => {
  try {
    const { registrationNumber } = req.query;
    if (!registrationNumber) return res.status(400).json({ message: 'Registration number is required' });
    // registrationNumber isn't a first-class column in ServiceBillSQL; return empty
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Add this to your serviceBillController.js
exports.downloadServiceBillPDF = async (req, res) => {
  try {
    const billId = req.params.id;
    const filePath = path.join(
      __dirname,
      "../uploads/service-bills",
      `service-bill-${billId}.pdf`
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "PDF file not found" });
    }

    // Set headers and send file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=service-bill-${billId}.pdf`
    );

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    res.status(500).json({ message: "Error downloading PDF" });
  }
};
// Get single service bill
exports.getServiceBill = async (req, res) => {
  try {
    const serviceBill = await ServiceBill.findByPk(req.params.id);
    if (!serviceBill) return res.status(404).json({ success: false, message: 'Service bill not found' });
    if (req.user.role !== 'admin' && String(serviceBill.createdBy) !== String(req.user.id))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.status(200).json({ success: true, data: formatObjectPrices(serviceBill.get ? serviceBill.get({ plain: true }) : serviceBill) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update service bill
exports.updateServiceBill = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to update service bills' });
    const serviceBill = await ServiceBill.findByPk(req.params.id);
    if (!serviceBill) return res.status(404).json({ success: false, message: 'Service bill not found' });

    // Update fields
    await serviceBill.update(req.body);

    // Recalculate amounts if relevant fields are updated
    if (req.body.serviceItems || req.body.discount || req.body.taxRate || req.body.advancePaid) {
      const serviceItems = req.body.serviceItems || serviceBill.serviceItems || [];
      const totalAmount = (serviceItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
      const taxRate = Number(req.body.taxRate || serviceBill.taxRate || 0);
      const taxAmount = (taxRate / 100) * totalAmount;
      const grandTotal = totalAmount + taxAmount - (Number(req.body.discount) || Number(serviceBill.discount) || 0);
      const balanceDue = grandTotal - (Number(req.body.advancePaid) || Number(serviceBill.advancePaid) || 0);
      await serviceBill.update({ totalAmount, taxAmount, grandTotal, balanceDue });
    }

    // Regenerate PDF if needed
    if (req.body.serviceItems || req.body.taxRate || req.body.discount || req.body.advancePaid) {
      try {
        const pdfUrl = await generateServiceBillPDF(serviceBill);
        if (pdfUrl) await serviceBill.update({ pdfUrl });
      } catch (pdfErr) {
        console.warn('Failed to regenerate PDF:', pdfErr.message || pdfErr);
      }
    }

    res.status(200).json({ success: true, data: formatObjectPrices(serviceBill.get ? serviceBill.get({ plain: true }) : serviceBill) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete service bill
exports.deleteServiceBill = async (req, res) => {
  try {
    const serviceBill = await ServiceBill.findByPk(req.params.id);
    if (!serviceBill) return res.status(404).json({ success: false, message: 'Service bill not found' });
    const isOwner = serviceBill.createdBy && String(serviceBill.createdBy) === String(req.user.id);
    if (!(req.user.role === 'admin' || isOwner)) return res.status(403).json({ success: false, message: 'Not authorized to delete this service bill' });
    await serviceBill.destroy();
    // Delete associated PDF file if it exists
    if (serviceBill.pdfUrl) {
      const filePath = path.join(__dirname, '../', serviceBill.pdfUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Generate PDF for service bill
exports.generateServiceBillPDF = async (req, res) => {
  try {
    const serviceBill = await ServiceBill.findByPk(req.params.id);
    if (!serviceBill) return res.status(404).json({ success: false, message: 'Service bill not found' });
    if (req.user.role !== 'admin' && String(serviceBill.createdBy) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const pdfBuffer = await generateServiceBillPDF(serviceBill, true);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=service-bill-${serviceBill.id}.pdf` });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  }
};
