const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Stock Tracking
  openingStock: Number,
  closingStock: Number,
  unitsBought: Number,
  unitsSold: Number,
  
  // Financial Tracking
  buyingPrice: Number,
  sellingPrice: Number,
  amountSold: Number,
  profit: Number,
  
  // Payment Methods
  cashSales: { type: Number, default: 0 },
  mpesaSales: { type: Number, default: 0 },
  totalBalance: Number,
  
  // Reference to product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // Changed from 'product' to 'Product'
    required: true
  }
}, {
  timestamps: true
});

// Calculate profit before saving
inventorySchema.pre('save', function(next) {
  this.profit = (this.sellingPrice - this.buyingPrice) * this.unitsSold;
  this.totalBalance = this.cashSales + this.mpesaSales;
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);