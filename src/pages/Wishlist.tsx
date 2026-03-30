import React from 'react';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <Heart size={28} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500">Products you've saved for later</p>
        </div>
      </div>

      {wishlist.length > 0 ? (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {wishlist.map(product => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
        >
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Save items that you like in your wishlist and they will appear here so you can buy them later.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
          >
            Go to Shop <ArrowRight size={20} />
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
