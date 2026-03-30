import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/product/');

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Mehedi Telecom</h3>
            <p className="text-gray-400">Your trusted mobile shop for the latest smartphones and accessories. Quality products at the best prices.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-orange-500">Home</a></li>
              <li><a href="/shop" className="hover:text-orange-500">Shop</a></li>
              <li><a href="/cart" className="hover:text-orange-500">Cart</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4 text-sm">Subscribe to get the latest offers and updates.</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button 
                type="submit" 
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-700 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>© 2026 Mehedi Telecom. All rights reserved.</p>
        </div>
      </div>

      {/* Sticky Contact Buttons */}
      <div className={`fixed ${isProductPage ? 'bottom-28' : 'bottom-6'} right-6 flex flex-col gap-3 z-50`}>
        <a 
          href="https://wa.me/8801234567890" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
        >
          <MessageCircle size={28} />
        </a>
        <a 
          href="tel:+8801234567890" 
          className="bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
        >
          <Phone size={28} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
