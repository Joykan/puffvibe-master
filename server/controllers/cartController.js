const Product = require('../models/product');

// Helper to calculate cart totals
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let itemCount = 0;

  items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
    subtotal += item.totalPrice;
    itemCount += item.quantity;
  });

  return { subtotal, itemCount };
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, pricingTier, quantity = 1 } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find pricing tier
    const tier = product.pricingTiers.find(t => t.name === pricingTier);
    if (!tier) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pricing tier'
      });
    }

    // Check stock
    if (product.stock.current < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Create cart item
    const cartItem = {
      product: productId,
      productName: product.name,
      pricingTier: tier.name,
      quantity: quantity,
      unitPrice: tier.price,
      totalPrice: tier.price * quantity,
      unit: tier.unit
    };

    // For now, we'll return the cart item (in real app, we'd save to user's cart)
    res.json({
      success: true,
      message: 'Item added to cart',
      data: cartItem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

// @desc    Calculate cart totals
// @route   POST /api/cart/calculate
// @access  Private
const calculateCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const { subtotal, itemCount } = calculateCartTotals(items);
    const deliveryFee = subtotal > 1000 ? 0 : 150; // Free delivery over 1000
    const totalAmount = subtotal + deliveryFee;

    res.json({
      success: true,
      data: {
        items,
        subtotal,
        itemCount,
        deliveryFee,
        totalAmount,
        freeDeliveryEligible: subtotal > 1000
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating cart',
      error: error.message
    });
  }
};

module.exports = {
  addToCart,
  calculateCart
};