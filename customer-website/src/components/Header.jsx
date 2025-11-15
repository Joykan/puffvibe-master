import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">
            🚬 PuffVibe
          </Link>
          <nav className="flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-green-600 font-medium">
              Order ORIS
            </Link>
            <Link to="/checkout" className="text-gray-700 hover:text-green-600 font-medium">
              Cart 🛒
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;