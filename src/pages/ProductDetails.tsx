import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { ShoppingCart, Zap, Smartphone, Cpu, Battery, MemoryStick as Memory, Camera, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const currentProduct = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(currentProduct);

          // Fetch Related Products
          const productsRef = collection(db, 'products');
          let q = query(
            productsRef, 
            where('category', '==', currentProduct.category || 'Smartphones'),
            limit(10)
          );

          let relatedSnap = await getDocs(q);
          let relatedList = relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(p => p.id !== id);

          // If not enough related by category, try brand
          if (relatedList.length < 3) {
            const brandQ = query(
              productsRef,
              where('brand', '==', currentProduct.brand),
              limit(10)
            );
            const brandSnap = await getDocs(brandQ);
            const brandList = brandSnap.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .filter(p => p.id !== id && !relatedList.find(rp => rp.id === p.id));
            
            relatedList = [...relatedList, ...brandList];
          }

          setRelatedProducts(relatedList.slice(0, 6));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Back to Shop
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-fit"
        >
          <motion.img 
            layoutId={`product-image-${product.id}`}
            src={product.image} 
            alt={product.name} 
            className="max-h-[400px] md:max-h-[500px] w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 md:space-y-8"
        >
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-orange-600 font-bold uppercase tracking-wider mb-2"
            >
              {product.brand} • {product.category}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {product.name}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex flex-col">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">৳{product.discountPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stockStatus}
              </span>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 text-base md:text-lg leading-relaxed"
            >
              {product.shortSpecs}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Full Specs Section */}
      {product.fullSpecs && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-gray-200">Full Specifications</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-4">
              {product.fullSpecs.split(',').filter(s => s.trim()).map((spec, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-700">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                  <p className="leading-relaxed">{spec.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 mb-24 md:mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Link to="/shop" className="text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((p) => (
              <Link 
                key={p.id} 
                to={`/product/${p.id}`}
                className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-gray-50 p-4">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{p.brand}</p>
                <p className="font-bold text-orange-600">৳{(p.discountPrice || p.price).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sticky Action Footer (Persistent) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
          <div className="hidden sm:flex flex-col">
            <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
            <p className="text-xs text-gray-500">{product.brand}</p>
          </div>
          <div className="flex items-center gap-4 md:gap-8 flex-1 sm:flex-initial">
            <div className="flex flex-col">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Price</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">৳{(product.discountPrice || product.price).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 md:gap-4 flex-1 sm:w-80">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { addToCart(product); showToast('Added to cart!', 'success'); }}
                disabled={product.stockStatus === 'Out of Stock'}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-colors disabled:opacity-50"
              >
                <span className="hidden md:inline">Add to </span>Cart
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { addToCart(product); navigate('/checkout'); }}
                disabled={product.stockStatus === 'Out of Stock'}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-colors disabled:opacity-50 shadow-lg shadow-orange-200"
              >
                Buy Now
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;

