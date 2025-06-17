const Rc = require("../models/Rc");
const path = require("path");
const fs = require("fs");

exports.createRcEntry = async (req, res, next) => {
  try {
    const rcData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const rcEntry = await Rc.create(rcData);

    res.status(201).json({
      success: true,
      data: rcEntry,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllRcEntries = async (req, res, next) => {
  try {
    let query;
    if (req.user.role !== "admin") {
      query = Rc.find({ createdBy: req.user.id });
    } else {
      query = Rc.find();
    }

    const rcEntries = await query.sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rcEntries.length,
      data: rcEntries,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRcEntryById = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findById(req.params.id);

    if (!rcEntry) {
      return res.status(404).json({
        success: false,
        message: "RC Entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rcEntry,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRcEntry = async (req, res, next) => {
  try {
    let rcEntry = await Rc.findById(req.params.id);

    if (!rcEntry) {
      return res.status(404).json({
        success: false,
        message: "RC Entry not found",
      });
    }
    if (
      req.user.role !== "admin" &&
      rcEntry.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this RC entry",
      });
    }

    const updateData = { ...req.body };
    if (updateData.rtoFeesPaid !== undefined) {
      updateData.rtoFeesPaid = Boolean(updateData.rtoFeesPaid);
    }
    if (updateData.returnedToDealer !== undefined) {
      updateData.returnedToDealer = Boolean(updateData.returnedToDealer);
    }

    console.log("Updating RC entry with data:", updateData);

    rcEntry = await Rc.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: rcEntry,
    });
  } catch (err) {
    console.error("Update error:", err);
    next(err);
  }
};

exports.deleteRcEntry = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findById(req.params.id);

    if (!rcEntry) {
      return res.status(404).json({
        success: false,
        message: "RC Entry not found",
      });
    }

    // Check if user has permission to delete (if not admin, only allow deleting own entries)
    if (
      req.user.role !== "admin" &&
      rcEntry.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this RC entry",
      });
    }

    // Delete associated PDF file if it exists
    if (rcEntry.pdfUrl) {
      try {
        const filePath = path.join(
          __dirname,
          "../utils/uploads",
          rcEntry.pdfUrl.split("/uploads/")[1]
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("PDF file deleted:", filePath);
        }
      } catch (fileError) {
        console.error("Error deleting PDF file:", fileError);
        // Don't fail the delete operation if file deletion fails
      }
    }

    // Use findByIdAndDelete instead of remove() which is deprecated
    await Rc.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "RC entry deleted successfully",
      data: {},
    });
  } catch (err) {
    console.error("Delete error:", err);
    next(err);
  }
};

exports.uploadRcPdf = async (req, res, next) => {
  try {
    const rcEntry = await Rc.findById(req.params.id);

    if (!rcEntry) {
      return res.status(404).json({
        success: false,
        message: "RC Entry not found",
      });
    }
    if (
      req.user.role !== "admin" &&
      rcEntry.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to upload PDF for this RC entry",
      });
    }
    if (rcEntry.pdfUrl) {
      try {
        const oldFilePath = path.join(
          __dirname,
          "../utils/uploads",
          rcEntry.pdfUrl.split("/uploads/")[1]
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("Old PDF file deleted:", oldFilePath);
        }
      } catch (fileError) {
        console.error("Error deleting old PDF file:", fileError);
      }
    }

    rcEntry.pdfUrl = `/utils/uploads/${req.file.filename}`;
    await rcEntry.save();

    res.status(200).json({
      success: true,
      data: rcEntry,
    });
  } catch (err) {
    console.error("Upload error:", err);
    next(err);
  }
};
