const express = require('express');
const {
  addToCart,
  calculateCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, addToCart);
router.post('/calculate', protect, calculateCart);

module.exports = router;