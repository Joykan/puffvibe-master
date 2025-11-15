const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Inventory = require('../models/inventory');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Calculate today's stats
    let todaySales = 0;
    let todayProfit = 0;
    let cashSales = 0;
    let mpesaSales = 0;
    let todayOrderCount = todayOrders.length;

    todayOrders.forEach(order => {
      todaySales += order.totalAmount;
      
      // Calculate profit (assuming 50% margin for demo)
      const profit = order.totalAmount * 0.5;
      todayProfit += profit;

      // Payment method breakdown
      if (order.paymentMethod === 'cash') {
        cashSales += order.totalAmount;
      } else {
        mpesaSales += order.totalAmount;
      }
    });

    // Total stats
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock.current', '$stock.minimum'] }
    });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        today: {
          sales: todaySales,
          profit: todayProfit,
          orders: todayOrderCount,
          paymentBreakdown: {
            cash: cashSales,
            mpesa: mpesaSales
          }
        },
        totals: {
          orders: totalOrders,
          products: totalProducts,
          customers: totalCustomers
        },
        alerts: {
          lowStock: lowStockProducts.length,
          pendingOrders: await Order.countDocuments({ status: 'pending' })
        },
        lowStockProducts,
        recentOrders
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get all orders with filters
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const orders = await Order.find(filter)
      .populate('user', 'name phone email')
      .populate('items.product', 'name pricingTiers')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        ...(status && { status }),
        ...(deliveryStatus && { deliveryStatus })
      },
      { new: true, runValidators: true }
    ).populate('user', 'name phone')
     .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Get all products with inventory
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Update product stock
// @route   PUT /api/admin/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
  try {
    const { current, minimum } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        'stock.current': current,
        'stock.minimum': minimum
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product stock',
      error: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get order counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ user: customer._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: customer._id } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
          ...customer.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );

    res.json({
      success: true,
      data: customersWithStats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// @desc    Get advanced analytics with date range
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdvancedAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    
    // Date range setup
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    // Sales data
    const salesData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrder: { $avg: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Product performance
    const productPerformance = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Payment method breakdown
    const paymentBreakdown = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Customer insights
    const customerInsights = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrder: { $avg: "$totalAmount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        dateRange: {
          start: startDate,
          end: endDate
        },
        salesTrend: salesData,
        topProducts: productPerformance,
        paymentMethods: paymentBreakdown,
        topCustomers: customerInsights,
        summary: {
          totalSales: salesData.reduce((sum, day) => sum + day.totalSales, 0),
          totalOrders: salesData.reduce((sum, day) => sum + day.orderCount, 0),
          averageOrderValue: salesData.reduce((sum, day) => sum + day.averageOrder, 0) / salesData.length
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching advanced analytics',
      error: error.message
    });
  }
};

// @desc    Export orders to CSV
// @route   GET /api/admin/orders/export
// @access  Private/Admin
const exportOrders = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user', 'name phone email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = orders.map(order => ({
      'Order ID': order._id,
      'Date': order.createdAt.toISOString().split('T')[0],
      'Customer': order.user.name,
      'Phone': order.user.phone,
      'Items': order.items.map(item => 
        `${item.quantity}x ${item.product.name} (${item.pricingTier})`
      ).join('; '),
      'Subtotal': order.subtotal,
      'Delivery Fee': order.deliveryFee,
      'Total Amount': order.totalAmount,
      'Payment Method': order.paymentMethod,
      'Status': order.status,
      'Delivery Status': order.deliveryStatus,
      'Delivery Address': order.deliveryAddress
    }));

    res.json({
      success: true,
      data: csvData,
      message: `Exported ${csvData.length} orders`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting orders',
      error: error.message
    });
  }
};

// @desc    Bulk update order status
// @route   PUT /api/admin/orders/bulk-status
// @access  Private/Admin
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, deliveryStatus } = req.body;

    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} orders successfully`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk updating orders',
      error: error.message
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/admin/inventory/alerts
// @access  Private/Admin
const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock.current', '$stock.minimum'] }
    });

    const criticalStock = await Product.find({
      $expr: { $lte: ['$stock.current', { $multiply: ['$stock.minimum', 0.5] }] }
    });

    res.json({
      success: true,
      data: {
        lowStock: lowStockProducts,
        criticalStock: criticalStock,
        summary: {
          lowStockCount: lowStockProducts.length,
          criticalStockCount: criticalStock.length
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stock alerts',
      error: error.message
    });
  }
};

// @desc    Bulk update product stock
// @route   PUT /api/admin/inventory/bulk-update
// @access  Private/Admin
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = await Promise.all(
      updates.map(async (update) => {
        const product = await Product.findByIdAndUpdate(
          update.productId,
          {
            'stock.current': update.current,
            'stock.minimum': update.minimum || 10
          },
          { new: true }
        );
        return product;
      })
    );

    res.json({
      success: true,
      message: `Updated stock for ${results.length} products`,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk updating stock',
      error: error.message
    });
  }
};

// @desc    Search orders with advanced filters - FIXED VERSION
// @route   GET /api/admin/orders/search
// @access  Private/Admin
const searchOrders = async (req, res) => {
  try {
    const { 
      query, 
      status, 
      paymentMethod, 
      startDate, 
      endDate,
      minAmount,
      maxAmount 
    } = req.query;

    let filter = {};

    // Text search - only if query is provided
    if (query && query.trim() !== '') {
      // First, find users that match the query
      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(user => user._id);

      // Build search filter without trying to cast query to ObjectId
      filter.$or = [
        { mpesaCode: { $regex: query, $options: 'i' } },
        { trackingNumber: { $regex: query, $options: 'i' } },
        { deliveryAddress: { $regex: query, $options: 'i' } }
      ];

      // Only add user search if we found matching users
      if (userIds.length > 0) {
        filter.$or.push({ user: { $in: userIds } });
      }

      // Only try ObjectId search if query looks like a valid MongoDB ID
      if (query.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or.push({ _id: query });
      }
    }

    // Additional filters
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = parseInt(minAmount);
      if (maxAmount) filter.totalAmount.$lte = parseInt(maxAmount);
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone email')
      .populate('items.product', 'name pricingTiers')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching orders',
      error: error.message
    });
  }
};

// CORRECTED MODULE EXPORTS
module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  updateProductStock,
  getAllCustomers,
  getAdvancedAnalytics,
  exportOrders,
  bulkUpdateOrderStatus,
  getLowStockAlerts,
  bulkUpdateStock,
  searchOrders
};