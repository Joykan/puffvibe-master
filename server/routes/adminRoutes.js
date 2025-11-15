const express = require('express');
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  updateProductStock,
  getAllCustomers,
  // NEW ENHANCED FEATURES
  getAdvancedAnalytics,
  exportOrders,
  bulkUpdateOrderStatus,
  getLowStockAlerts,
  bulkUpdateStock,
  searchOrders
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Analytics
router.get('/analytics', getAdvancedAnalytics);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/search', searchOrders);
router.get('/orders/export', exportOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/bulk-status', bulkUpdateOrderStatus);

// Products & Inventory
router.get('/products', getAllProducts);
router.put('/products/:id/stock', updateProductStock);
router.get('/inventory/alerts', getLowStockAlerts);
router.put('/inventory/bulk-update', bulkUpdateStock);

// Customers
router.get('/customers', getAllCustomers);

module.exports = router;