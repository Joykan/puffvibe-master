import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const navigate = useNavigate();

  // API configuration
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.railway.app'  // Replace with your deployed backend URL
    : 'http://localhost:5000';

  // Fallback mock data
  const mockProducts = [
    {
      _id: "68f692a4695306195f07562c",
      name: "ORIS",
      description: "Premium ORIS products delivered fast in Maseno",
      pricingTiers: [
        { name: "Single", quantity: 1, price: 10, unit: "piece" },
        { name: "Packet", quantity: 1, price: 200, unit: "packet" },
        { name: "3 Packets", quantity: 3, price: 540, unit: "packets" },
        { name: "5 Packets", quantity: 5, price: 750, unit: "packets" }
      ],
      stock: { current: 100, minimum: 10 }
    }
  ];

  // Check API health
  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setApiStatus('connected');
      return true;
    } catch (error) {
      setApiStatus('disconnected');
      return false;
    }
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Check if API is available
        const isApiHealthy = await checkApiHealth();
        
        if (isApiHealthy) {
          // Try main API first
          const response = await axios.get(`${API_BASE_URL}/api/products`);
          setProducts(response.data.data);
          setError('');
          console.log('✅ Connected to backend API');
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        console.log('API failed, trying test endpoint...');
        try {
          // Try test endpoint
          const testResponse = await axios.get(`${API_BASE_URL}/api/test-products`);
          setProducts(testResponse.data.data);
          setError('⚠️ Using demo mode - Some features limited');
        } catch (testError) {
          console.log('All APIs failed, using mock data');
          setProducts(mockProducts);
          setError('🔶 Offline Mode - Using demo data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  const addToCart = (product, pricingTier) => {
    const newItem = {
      productId: product._id,
      productName: product.name,
      pricingTier: pricingTier.name,
      quantity: 1,
      unitPrice: pricingTier.price,
      totalPrice: pricingTier.price
    };
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.productId === newItem.productId && item.pricingTier === newItem.pricingTier
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === newItem.productId && item.pricingTier === newItem.pricingTier
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (productId, pricingTier) => {
    setCart(prevCart => 
      prevCart.filter(item => 
        !(item.productId === productId && item.pricingTier === pricingTier)
      )
    );
  };

  const updateQuantity = (productId, pricingTier, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, pricingTier);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId && item.pricingTier === pricingTier
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getDeliveryFee = () => {
    return 50; // Fixed delivery fee for Maseno
  };

  const getGrandTotal = () => {
    return getCartTotal() + getDeliveryFee();
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Add some ORIS products first.');
      return;
    }
    navigate('/checkout', { 
      state: { 
        cart, 
        total: getCartTotal(), 
        delivery: getDeliveryFee(), 
        grandTotal: getGrandTotal() 
      } 
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-2xl">🔄 Loading ORIS products...</div>
        <p className="text-gray-600 mt-2">Connecting to PuffVibe backend</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Connection Status */}
      <div className="mb-6 space-y-3">
        {apiStatus === 'connected' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-xl mr-3">✅</span>
              <div>
                <p className="text-purple-800 font-medium">Connected to PuffVibe Server</p>
                <p className="text-purple-700 text-sm">Real-time order processing enabled</p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              <div>
                <p className="text-yellow-800">{error}</p>
                <p className="text-yellow-700 text-sm mt-1">You can still browse and order - we'll process manually</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⚡</span>
          <div>
            <h3 className="font-semibold text-purple-800">Ultra-Fast Maseno Delivery</h3>
            <p className="text-purple-700 text-sm">
              <strong>Delivery Areas:</strong> Market, Space, Umbwa Kali, Niles, Linwick, GV
            </p>
            <p className="text-purple-600 text-sm font-medium mt-1">
              🚀 Delivery Time: 20-30 minutes • 💰 Delivery Fee: KSh 15
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Order ORIS</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
            Cart: KSh {getCartTotal()} ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </div>
          {cart.length > 0 && (
            <button 
              onClick={proceedToCheckout}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Checkout ›
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-lg border p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h2>
            <p className="text-purple-600 mb-4">In Stock: {product.stock.current} units</p>
            
            <div className="space-y-4">
              {product.pricingTiers.map((tier, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-green-500 transition">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{tier.name}</h3>
                    <span className="text-lg font-bold text-green-600">KSh {tier.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {tier.quantity} {tier.unit} • KSh {tier.price}/unit
                  </p>
                  <button
                    onClick={() => addToCart(product, tier)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary Sidebar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-xl border max-w-sm z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-lg">Cart Summary</h3>
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto mb-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-3 pb-3 border-b">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.pricingTier}</div>
                  <div className="text-xs text-gray-600">KSh {item.unitPrice} each</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.pricingTier, item.quantity - 1)}
                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.pricingTier, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm font-medium w-16 text-right">
                  KSh {item.totalPrice}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>KSh {getCartTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>KSh {getDeliveryFee()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>KSh {getGrandTotal()}</span>
            </div>
          </div>

          <button 
            onClick={proceedToCheckout}
            className="w-full bg-purple-600 text-white py-3 rounded-lg mt-4 hover:bg-purple-700 transition font-semibold"
          >
            Checkout Now ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
