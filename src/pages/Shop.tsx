import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useLocation } from 'react-router-dom';

const Shop = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialBrand = queryParams.get('brand') || 'All';
  const initialCategory = queryParams.get('category') || 'All';

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState(initialBrand);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState('All');

  useEffect(() => {
    const brand = queryParams.get('brand');
    const category = queryParams.get('category');
    const search = queryParams.get('search');
    if (brand) setBrandFilter(brand);
    if (category) setCategoryFilter(category);
    if (search) setSearchTerm(search);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
        setFiltered(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (brandFilter !== 'All') {
      result = result.filter(p => p.brand === brandFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (priceRange !== 'All') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        result = result.filter(p => p.price >= min && p.price <= max);
      } else {
        result = result.filter(p => p.price >= min);
      }
    }

    setFiltered(result);
  }, [searchTerm, brandFilter, categoryFilter, priceRange, products]);

  const brands = ['All', ...new Set(products.map(p => p.brand))];
  const categories = ['All', ...new Set(products.map(p => p.category || 'Smartphones'))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-4 font-bold text-base">
              <SlidersHorizontal size={18} />
              Filters
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brand</label>
                <select 
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select 
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price Range</label>
                <select 
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="All">All Prices</option>
                  <option value="0-15000">Under ৳15,000</option>
                  <option value="15000-30000">৳15,000 - ৳30,000</option>
                  <option value="30000-60000">৳30,000 - ৳60,000</option>
                  <option value="60000-100000">৳60,000 - ৳100,000</option>
                  <option value="100000">Above ৳100,000</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
        <div className="lg:col-span-9">
          {searchTerm && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-gray-600">Showing results for:</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold flex items-center gap-2">
                "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="hover:text-orange-900 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse aspect-[3/4] rounded-xl"></div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div 
              key={searchTerm + brandFilter + priceRange}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(product => (
                  <motion.div 
                    layout
                    key={product.id} 
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100"
            >
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <button 
                onClick={() => { setSearchTerm(''); setBrandFilter('All'); setPriceRange('All'); }}
                className="mt-4 text-orange-600 font-bold"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
