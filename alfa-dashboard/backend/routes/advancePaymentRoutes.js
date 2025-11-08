const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const payments = require("../controllers/advancePaymentController");

router.post("/", protect, payments.createPayment);
router.get("/", protect, payments.getPayments);
router.get("/:id", protect, payments.getPayment);
router.delete("/:id", protect, payments.deletePayment);

module.exports = router;
