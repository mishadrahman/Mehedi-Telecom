import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Smartphone, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Home = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Latest & Featured
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setLatest(products);
        setFeatured(products.slice(0, 4));

        // Fetch Recommendations based on history
        const viewedCategories = JSON.parse(localStorage.getItem('viewed_categories') || '{}');
        const topCategories = Object.entries(viewedCategories)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 2)
          .map(entry => entry[0]);

        if (topCategories.length > 0) {
          const recQuery = query(
            collection(db, 'products'),
            where('category', 'in', topCategories),
            limit(4)
          );
          const recSnapshot = await getDocs(recQuery);
          const recProducts = recSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setRecommended(recProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    <div className="pb-12 overflow-hidden">
      <Hero />

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-500">Based on your browsing history</p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {recommended.map(product => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Features */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="font-bold">Latest Mobiles</h3>
            <p className="text-sm text-gray-500">All top brands available</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold">Official Warranty</h3>
            <p className="text-sm text-gray-500">100% genuine products</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-bold">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Across all Bangladesh</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Shop by Brand */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900">Shop by Brand</h2>
          <p className="text-gray-500">Find your favorite mobile brand</p>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {['Apple', 'Samsung', 'Xiaomi', 'Vivo', 'Oppo', 'Realme'].map((brand) => (
            <Link 
              key={brand}
              to={`/shop?brand=${brand}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-orange-200 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                <Smartphone size={24} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-600">{brand}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500">Handpicked best sellers for you</p>
          </div>
          <Link to="/shop" className="text-orange-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={20} />
          </Link>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse aspect-[3/4] rounded-xl"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {featured.map(product => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Offers Banner */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-200"
        >
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Flash Sale is Live!</h2>
            <p className="text-xl opacity-90">Get up to 25% off on all accessories and selected mobiles.</p>
          </div>
          <Link to="/shop" className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Shop Now
          </Link>
        </motion.div>
      </section>

      {/* Latest Mobiles */}
      <section className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Arrivals</h2>
            <p className="text-gray-500">Newest additions to our collection</p>
          </div>
          <Link to="/shop" className="text-orange-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={20} />
          </Link>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse aspect-[3/4] rounded-xl"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {latest.map(product => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;
