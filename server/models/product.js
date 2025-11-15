const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'ORIS'
  },
  description: String,
  
  // Pricing Tiers (EXACTLY as you specified!)
  pricingTiers: [
    {
      name: {
        type: String,
        enum: ['Single', 'Packet', '3 Packets', '5 Packets'],
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        default: 'piece'
      }
    }
  ],
  
  // Inventory Tracking
  stock: {
    current: { type: Number, default: 0 },
    minimum: { type: Number, default: 10 },
    sold: { type: Number, default: 0 }
  },
  
  // Cost & Profit Tracking
  buyingPrice: Number,
  sellingPrice: Number,
  
  // Product Status
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save to set pricing tiers
productSchema.pre('save', function(next) {
  if (this.isNew) {
    this.pricingTiers = [
      { name: 'Single', quantity: 1, price: 10, unit: 'piece' },
      { name: 'Packet', quantity: 1, price: 200, unit: 'packet' },
      { name: '3 Packets', quantity: 3, price: 540, unit: 'packets' },
      { name: '5 Packets', quantity: 5, price: 750, unit: 'packets' }
    ];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);