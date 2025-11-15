const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
let orders = [];
let orderCounter = 1;

// Simple order submission
router.post('/submit', (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order ID
    const orderId = 'PV' + Date.now();
    const orderNumber = orderCounter++;
    
    // Create order record
    const order = {
      orderId,
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryLocation: orderData.deliveryLocation,
      specificAddress: orderData.specificAddress,
      paymentMethod: orderData.paymentMethod,
      orderNotes: orderData.orderNotes,
      cart: orderData.cart,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      grandTotal: orderData.grandTotal,
      status: 'pending',
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    };
    
    // Store order
    orders.push(order);
    
    // Keep only last 100 orders
    if (orders.length > 100) {
      orders = orders.slice(-100);
    }

    console.log('📦 New Order Received:', {
      orderId: order.orderId,
      customer: order.customerName,
      phone: order.customerPhone,
      location: order.deliveryLocation,
      total: order.grandTotal,
      items: order.cart.length
    });

    res.json({
      success: true,
      message: 'Order received successfully! 🎉',
      data: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        estimatedDelivery: '20-30 minutes',
        customer: order.customerName,
        total: order.grandTotal,
        deliveryLocation: order.deliveryLocation,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Order processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing order',
      error: error.message
    });
  }
});

// Get order status
router.get('/status/:orderId', (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        customerName: order.customerName,
        deliveryLocation: order.deliveryLocation,
        grandTotal: order.grandTotal,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order status',
      error: error.message
    });
  }
});

// Get all orders (for admin)
router.get('/all', (req, res) => {
  try {
    res.json({
      success: true,
      data: orders.reverse(), // Latest first
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

module.exports = router;