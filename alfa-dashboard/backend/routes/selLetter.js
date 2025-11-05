const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  createSellLetter,
  getSellLetters,
  getSellLetterById,
  updateSellLetter,
  deleteSellLetter,
  getMySellLetters,
  getSellLettersByRegistration,
} = require("../controllers/sellLetterController");

router.use(protect);

router.route("/by-registration").get(getSellLettersByRegistration);
router.route("/my-letters").get(getMySellLetters);

router.route("/").post(createSellLetter).get(getSellLetters);

router
  .route("/:id")
  .get(getSellLetterById)
  .put(admin, updateSellLetter)
  .delete(admin, deleteSellLetter);

module.exports = router;
