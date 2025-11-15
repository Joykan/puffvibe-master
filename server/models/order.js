const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Changed from 'user' to 'User'
    required: true
  },
  
  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',  // Changed from 'product' to 'Product'
      required: true
    },
    pricingTier: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  
  // Order Summary
  subtotal: Number,
  deliveryFee: { type: Number, default: 0 },
  totalAmount: Number,
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  mpesaCode: String, // M-Pesa transaction code
  
  // Delivery Information
  deliveryAddress: String,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'dispatched', 'delivered'],
    default: 'pending'
  },
  trackingNumber: String,
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);