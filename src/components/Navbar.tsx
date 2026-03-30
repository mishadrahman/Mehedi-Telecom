import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Phone, MessageCircle, Menu, X, User, LogOut, LayoutDashboard, ClipboardList, Heart } from 'lucide-react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useToast } from '../ToastContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, userData, signOut } = useAuth();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully', 'info');
      navigate('/');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-600">Mehedi</span>
            <span className="text-2xl font-bold text-gray-800">Telecom</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium">Home</Link>
            <Link to="/shop" className="text-gray-600 hover:text-orange-600 font-medium">Shop</Link>
            <Link to="/wishlist" className="relative text-gray-600 hover:text-red-500">
              <Heart size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-gray-600 hover:text-orange-600">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <User size={18} />
                  </div>
                  <span className="max-w-[100px] truncate">{userData?.name || 'User'}</span>
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                    >
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <User size={18} />
                        My Profile
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <ClipboardList size={18} />
                        My Orders
                      </Link>
                      <Link 
                        to="/admin" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={18} />
                        Admin Panel
                      </Link>
                      <button 
                        onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/wishlist" className="relative text-gray-600">
              <Heart size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-gray-600">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="py-4 px-4 flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-medium py-2">Home</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-medium py-2">Shop</Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-600 font-medium py-2">
                <Heart size={20} /> Wishlist ({wishlistCount})
              </Link>
              {user ? (
                <>
                  <div className="py-2 border-t border-gray-50">
                    <p className="text-sm text-gray-400 mb-2">Logged in as {userData?.name}</p>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-600 font-medium py-2">
                      <User size={18} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-600 font-medium py-2">
                      <ClipboardList size={18} /> My Orders
                    </Link>
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-600 font-medium py-2">
                      <LayoutDashboard size={18} /> Admin Panel
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium py-2 w-full text-left">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-center">
                  Login / Signup
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
