import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { useAuth } from '../AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendOrderToTelegram, getFirebaseErrorMessage } from '../lib/utils';
import { CreditCard, Truck, CheckCircle2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Checkout = () => {
  const { cart, totalPrice, clearCart, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'Cash on Delivery'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const orderData = {
        ...formData,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'N/A',
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice,
        status: 'Pending',
        createdAt: Date.now()
      };

      // Save to Firestore
      await addDoc(collection(db, 'orders'), orderData);
      
      // Send to Telegram
      await sendOrderToTelegram(orderData);

      setOrderSuccess(true);
      clearCart();
      showToast('Order placed successfully!', 'success');
    } catch (error) {
      showToast(getFirebaseErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-7xl mx-auto px-4 py-24 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Thank you for shopping with Mehedi Telecom. Your order has been received and is being processed. We will contact you soon.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors"
        >
          Back to Home
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-orange-600" size={24} />
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your delivery address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-orange-600" size={24} />
                Payment Method
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Cash on Delivery', 'bKash', 'Nagad', 'Rocket'].map(method => (
                  <motion.label 
                    key={method}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === method ? 'border-orange-600 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      className="hidden" 
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    />
                    <span className={`font-bold ${formData.paymentMethod === method ? 'text-orange-600' : 'text-gray-600'}`}>{method}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || cart.length === 0}
              type="submit"
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-orange-700 transition-colors shadow-xl shadow-orange-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Confirm Order (৳${totalPrice.toLocaleString()})`}
            </motion.button>
          </form>
        </div>

        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-2 text-xs font-bold min-w-[24px] text-center">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">৳{item.price.toLocaleString()} each</span>
                      </div>
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>৳{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
