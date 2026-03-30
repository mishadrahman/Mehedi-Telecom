import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-24 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600"
        >
          <ShoppingBag size={48} />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Explore our latest mobiles and find your perfect match!</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors">
          Start Shopping <ArrowRight size={20} />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Shopping Cart ({totalItems})
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-50 rounded-lg p-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 md:text-lg truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.brand} | {item.category}</p>
                  <p className="font-bold text-orange-600">৳{item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50 text-gray-500"
                    >
                      <Minus size={16} />
                    </motion.button>
                    <span className="px-4 font-bold text-gray-900">{item.quantity}</span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50 text-gray-500"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFromCart(item.id!)}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
            >
              Proceed to Checkout
            </motion.button>
            <Link to="/shop" className="block text-center mt-4 text-gray-500 font-medium hover:text-orange-600">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
