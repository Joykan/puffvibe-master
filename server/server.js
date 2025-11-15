const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Enhanced CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173', 
  'http://localhost:3000',
  'https://puffvibe-maseno.netlify.app',
  'https://your-frontend-domain.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for production
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const simpleOrderRoutes = require('./routes/simpleOrderRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/simple-orders', simpleOrderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'PuffVibe Server is running! 🚀',
    status: 'Active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Test products endpoint
app.get('/api/test-products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: "68f692a4695306195f07562c",
        name: "ORIS",
        description: "Premium ORIS products - Fast Maseno Delivery",
        pricingTiers: [
          { name: "Single", quantity: 1, price: 10, unit: "piece" },
          { name: "Packet", quantity: 1, price: 200, unit: "packet" },
          { name: "3 Packets", quantity: 3, price: 540, unit: "packets" },
          { name: "5 Packets", quantity: 5, price: 750, unit: "packets" }
        ],
        stock: { current: 100, minimum: 10 },
        active: true
      }
    ]
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.json({ 
      message: 'PuffVibe Backend API',
      frontend: 'Please visit the frontend website for ordering',
      status: 'API Running'
    });
  });
}

// Database connection with production URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/puffvibe';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('💡 Using in-memory data storage for demo');
  });

// Initialize default data
mongoose.connection.once('open', async () => {
  console.log('✅ MongoDB connected successfully');
  
  const Product = require('./models/product');
  try {
    const productCount = await Product.countDocuments();
    
    if (productCount === 0) {
      await Product.create({ 
        name: 'ORIS',
        description: 'Premium ORIS products for Maseno delivery',
        stock: { current: 100, minimum: 10 }
      });
      console.log('✅ Default ORIS product created');
    }
  } catch (error) {
    console.log('⚠️ Product initialization skipped:', error.message);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : error.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎯 PuffVibe Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🛒 API Ready: http://localhost:${PORT}/api`);
  console.log('');
  console.log('🚀 PuffVibe Backend Ready for Production!');
});

module.exports = app;