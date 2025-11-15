import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], total = 0, delivery = 50, grandTotal = 0 } = location.state || {};

  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const masenoLocations = [
    'Market',
    'Space', 
    'Umbwa Kali',
    'Niles',
    'Linwick',
    'GV',
    'Other Maseno Location'
  ];

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || !deliveryLocation || !specificAddress) {
      alert('Please fill in all required fields!');
      return;
    }

    setSubmitting(true);

    const orderData = {
      customerName,
      customerPhone,
      deliveryLocation,
      specificAddress,
      paymentMethod,
      orderNotes,
      cart,
      subtotal: total,
      deliveryFee: delivery,
      grandTotal: grandTotal,
      orderDate: new Date().toLocaleString()
    };

    try {
      // Try to submit to backend
      const response = await axios.post('http://localhost:5000/api/simple-orders/submit', orderData);
      
      if (response.data.success) {
        const orderSummary = `
Order Placed Successfully! 🎉

📦 Order Details:
Order ID: ${response.data.data.orderId}
Name: ${customerName}
Phone: ${customerPhone}
Location: ${deliveryLocation}
Address: ${specificAddress}
Payment: ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}

🛒 Items:
${cart.map(item => `• ${item.quantity}x ${item.pricingTier} - KSh ${item.totalPrice}`).join('\n')}

💰 Total: KSh ${grandTotal}

${response.data.data.estimatedDelivery} to ${deliveryLocation}!
You will receive a confirmation call shortly.
        `;

        alert(orderSummary);
        
        // Reset and redirect
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryLocation('');
        setSpecificAddress('');
        setPaymentMethod('mpesa');
        setOrderNotes('');
        
        // Redirect to home or order confirmation page
        navigate('/');
      }
    } catch (error) {
      console.log('Backend submission failed, using fallback');
      
      // Fallback: Show order summary without backend
      const orderSummary = `
Order Ready for Processing! 📞

📦 Order Details:
Name: ${customerName}
Phone: ${customerPhone}
Location: ${deliveryLocation}
Address: ${specificAddress}
Payment: ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}

🛒 Items:
${cart.map(item => `• ${item.quantity}x ${item.pricingTier} - KSh ${item.totalPrice}`).join('\n')}

💰 Total: KSh ${grandTotal}

⚠️ Please call/send WhatsApp to 07XXXXXXX to confirm your order!
We'll deliver to ${deliveryLocation} in 20-30 minutes!
      `;

      alert(orderSummary);
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryLocation('');
      setSpecificAddress('');
      setPaymentMethod('mpesa');
      setOrderNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add some ORIS products to your cart first!</p>
        <Link 
          to="/products" 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
      <p className="text-gray-600 mb-6">Complete your ORIS order for Maseno delivery</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📦 Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center pb-3 border-b">
                <div>
                  <div className="font-medium">{item.pricingTier}</div>
                  <div className="text-sm text-gray-600">{item.quantity} x KSh {item.unitPrice}</div>
                </div>
                <div className="font-semibold">KSh {item.totalPrice}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>KSh {total}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>KSh {delivery}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Amount:</span>
              <span>KSh {grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmitOrder} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">👤 Your Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Full Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Select Maseno Location *
            </label>
            <select 
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={submitting}
            >
              <option value="">Choose your location...</option>
              {masenoLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Specific Address/Hostel/Room *
            </label>
            <input
              type="text"
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
              placeholder="e.g., Hostel B, Room 12 or Building name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Additional Notes (Optional)
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special delivery instructions..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">💳 Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                  disabled={submitting}
                />
                <div>
                  <span className="font-medium">M-Pesa</span>
                  <p className="text-sm text-gray-600">Pay via M-Pesa. You'll receive payment details after order.</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                  disabled={submitting}
                />
                <div>
                  <span className="font-medium">Cash on Delivery</span>
                  <p className="text-sm text-gray-600">Pay cash when your order arrives.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              ⚡ <strong>Fast Delivery:</strong> 20-30 minutes to {deliveryLocation || 'your location'}!
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-lg text-lg font-semibold transition ${
              submitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {submitting ? '🔄 Processing Order...' : `Place Order - KSh ${grandTotal}`}
          </button>

          <p className="text-center text-gray-600 mt-4 text-sm">
            By placing order, you agree to our delivery terms for Maseno University area
          </p>
        </form>
      </div>

      {/* Back to Products */}
      <div className="text-center mt-8">
        <Link to="/products" className="text-green-600 hover:text-green-700 font-medium">
          ← Back to Products
        </Link>
      </div>
    </div>
  );
};

export default Checkout;