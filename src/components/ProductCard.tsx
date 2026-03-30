import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useToast } from '../ToastContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(product.id || '');

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromWishlist(product.id || '');
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist!', 'success');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group h-full flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block flex-1">
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all z-10 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {product.stockStatus === 'Out of Stock' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-orange-600 font-semibold uppercase mb-1">{product.brand}</p>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
          <div className="mt-auto">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                {product.discountPrice ? (
                  <>
                    <span className="text-lg font-bold text-gray-900 leading-none">৳{product.discountPrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
                )}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stockStatus}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 grid grid-cols-2 gap-2 mt-auto">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          disabled={product.stockStatus === 'Out of Stock'}
          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <ShoppingCart size={18} />
          Cart
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleBuyNow}
          disabled={product.stockStatus === 'Out of Stock'}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Zap size={18} />
          Buy
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
