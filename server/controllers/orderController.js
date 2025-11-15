const Order = require('../models/order');
const Product = require('../models/product');
const Inventory = require('../models/inventory');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      deliveryAddress, 
      paymentMethod, 
      mpesaCode 
    } = req.body;

    const userId = req.user.id;

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      // Find pricing tier
      const tier = product.pricingTiers.find(t => t.name === item.pricingTier);
      if (!tier) {
        return res.status(400).json({
          success: false,
          message: `Invalid pricing tier: ${item.pricingTier}`
        });
      }

      // Check stock
      if (product.stock.current < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = tier.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        pricingTier: tier.name,
        quantity: item.quantity,
        unitPrice: tier.price,
        totalPrice: itemTotal
      });

      // Update product stock
      product.stock.current -= item.quantity;
      product.stock.sold += item.quantity;
      await product.save();
    }

    // Calculate totals
    const deliveryFee = subtotal > 1000 ? 0 : 150;
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      mpesaCode: paymentMethod === 'mpesa' ? mpesaCode : undefined,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed'
    });

    // Create inventory record for admin tracking
    for (const item of orderItems) {
      await Inventory.create({
        product: item.product,
        date: new Date(),
        unitsSold: item.quantity,
        amountSold: item.totalPrice,
        sellingPrice: item.unitPrice
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name pricingTiers')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('items.product', 'name pricingTiers');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};