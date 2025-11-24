import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          ORIS
        </h1>
        <h2 className="text-5xl font-bold text-gray-800 mb-4">
           ORIS Delivery in Maseno ⚡
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          20-30 minute delivery to Market, Space, Umbwa Kali, Niles, Linwick & GV
        </p>
        <Link 
          to="/products" 
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
        >
          Order Now ›
        </Link>

        {/* --- NEW DELIVERY NUMBER --- */}
        <p className="text-lg text-gray-700 mt-6 font-medium">
          Or Call/Text to Order: 
          <a href="tel:YOUR-NUMBER-HERE" className="text-purple-600 font-bold hover:underline">
            0798330644
          </a>
        </p>
        {/* --------------------------- */}

      </section>

      {/* Pricing Preview */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Our Pricing Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { name: 'Single', price: 10, desc: '1 piece', popular: false },
            { name: 'Packet', price: 200, desc: '1 packet', popular: false },
            { name: '3 Packets', price: 540, desc: '3 packets', popular: true },
            { name: '5 Packets', price: 750, desc: '5 packets', popular: false }
          ].map((tier, index) => (
            <div key={index} className={`bg-white p-6 rounded-lg shadow-md text-center border-2 ${tier.popular ? 'border-green-500 border-2' : 'border-gray-200'}`}>
              {tier.popular && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-gray-800">{tier.name}</h3>
              <p className="text-2xl font-bold text-green-600 my-2">KSh {tier.price}</p>
              <p className="text-gray-600 mb-4">{tier.desc}</p>
              <Link 
                to="/products" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition inline-block"
              >
              Add to Cart
              </Link>
            </div>
          ))}
        </div>
      </section>

     {/* Features */}
      <section className="py-12 bg-white rounded-lg my-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose PuffVibe Maseno?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="text-center">
              <div className="text-3xl mb-4">⚡</div>
             <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">20-30 minute delivery guaranteed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2">Campus Coverage</h3>
              <p className="text-gray-600">All Maseno areas covered</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">💵</div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Student-friendly pricing</p>
            </div>
          </div>
        </div>
      </section>

    {/* Delivery Areas */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">🚚 Delivery Areas (20-30 mins)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
           <div className="bg-white p-4 rounded-lg shadow border text-center">
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-semibold">Market</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border text-center">
              <div className="text-2xl mb-2">🏟️</div>
              <div className="font-semibold">Space</div>
            </div>
          <div className="bg-white p-4 rounded-lg shadow border text-center">
              <div className="text-2xl mb-2">🐕</div>
              <div className="font-semibold">Umbwa Kali</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border text-center">
             <div className="text-2xl mb-2">🏠</div>
              <div className="font-semibold">Niles</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border text-center">
              <div className="text-2xl mb-2">🏘️</div>
              <div className="font-semibold">Linwick</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border text-center">
              <div className="text-2xl mb-2">🎓</div>
            <div className="font-semibold">GV</div>
            </div>
          </div>
          <p className="text-green-600 font-medium mt-6 text-lg">
          ⚡ Delivery Time: 20-30 minutes to all locations!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
