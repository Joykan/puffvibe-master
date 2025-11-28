import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart = [], total = 0, delivery = 15, grandTotal = 0 } = location.state || {};

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      <div className="bg-white shadow rounded-lg p-4 border">

        <h2 className="text-lg font-semibold mb-3">Your Order</h2>

        {cart.map((item, index) => (
          <div key={index} className="flex justify-between border-b py-2">
            <span>{item.name}</span>
            <span>KSh {item.price}</span>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <span className="font-medium">Total Items Price:</span>
          <span>KSh {total}</span>
        </div>

        <div className="flex justify-between mt-2">
          <span className="font-medium">Delivery Fee:</span>
          <span className="text-green-600 font-semibold">KSh {delivery}</span>
        </div>

        <div className="flex justify-between mt-4 text-lg font-bold border-t pt-3">
          <span>Grand Total:</span>
          <span>KSh {grandTotal}</span>
        </div>

        <button
          onClick={() => navigate("/mpesa")}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          Pay with M-Pesa
        </button>

      </div>
    </div>
  );
};

export default Checkout;
