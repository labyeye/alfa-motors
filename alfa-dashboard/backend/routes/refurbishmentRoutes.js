const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const refurbController = require('../controllers/refurbishmentController');

router.post('/', protect, refurbController.createRefurbishment);
router.get('/', protect, refurbController.getRefurbishments);
router.get('/:id', protect, refurbController.getRefurbishment);
router.put('/:id', protect, refurbController.updateRefurbishment);
router.delete('/:id', protect, refurbController.deleteRefurbishment);

module.exports = router;
