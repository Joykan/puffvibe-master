import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: "Oris Mint Ice", price: 550, image: "/images/mint.png" },
    { id: 2, name: "Oris Apple Ice", price: 550, image: "/images/apple.png" },
    { id: 3, name: "Oris Watermelon Ice", price: 550, image: "/images/watermelon.png" },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // UPDATED DELIVERY FEE FUNCTION
  const getDeliveryFee = () => {
    return 15; // New delivery fee
  };

  const checkout = () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const delivery = getDeliveryFee();
    const grandTotal = total + delivery;

    navigate("/checkout", {
      state: {
        cart,
        total,
        delivery,
        grandTotal,
      },
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Order ORIS Flavours</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg p-4 border">
            <img src={item.image} alt={item.name} className="w-full rounded-md mb-3" />
            <h2 className="font-semibold">{item.name}</h2>
            <p className="text-gray-700">KSh {item.price}</p>

            <button
              onClick={() => addToCart(item)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="mt-6">
          <button
            onClick={checkout}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Checkout ({cart.length} items)
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
