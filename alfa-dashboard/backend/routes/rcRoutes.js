const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createRcEntry,
  getAllRcEntries,
  getRcEntryById,
  updateRcEntry,
  deleteRcEntry,
  uploadRcPdf,
} = require("../controllers/rcController");
// use multer memory upload for RC PDFs
const { upload } = require("../utils/multerMemory");

router.route("/").post(protect, createRcEntry).get(protect, getAllRcEntries);
router
  .route("/:id")
  .get(protect, getRcEntryById)
  .put(protect, updateRcEntry)
  .delete(protect, deleteRcEntry);
router.route("/:id/upload").post(protect, upload.single("pdf"), uploadRcPdf);

module.exports = router;
