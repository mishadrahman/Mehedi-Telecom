import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, ChevronRight, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const path = 'orders';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // Sort in memory to avoid composite index requirement
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="text-yellow-500" size={20} />;
      case 'Confirmed': return <Package className="text-blue-500" size={20} />;
      case 'Shipped': return <Truck className="text-purple-500" size={20} />;
      case 'Delivered': return <CheckCircle className="text-green-500" size={20} />;
      case 'Cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h1>
        <p className="text-gray-500 mb-8">You need to be logged in to view your order history.</p>
        <Link 
          to="/login"
          className="inline-block bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
          <ShoppingBag size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500">Track and manage your recent orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center"
        >
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Package size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping now!</p>
          <Link 
            to="/shop"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Explore Shop
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${getStatusColor(order.status)} bg-opacity-10`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order Status</p>
                        <p className={`font-bold ${getStatusColor(order.status).split(' ')[1]}`}>{order.status}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order ID</p>
                      <p className="font-mono text-sm text-gray-900">#{order.id?.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="border-t border-b border-gray-50 py-6 my-6">
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center p-2">
                              <Smartphone size={24} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Placed On</p>
                      <p className="text-gray-900 font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Amount</p>
                        <p className="text-2xl font-bold text-orange-600">৳{order.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Truck size={16} />
                    <span>Payment: {order.paymentMethod}</span>
                  </div>
                  <button className="text-orange-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
