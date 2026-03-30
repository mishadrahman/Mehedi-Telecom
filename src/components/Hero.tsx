import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Banner } from '../types';
import { useNavigate } from 'react-router-dom';

const defaultBanners = [
// ... existing defaultBanners ...
  {
    id: '1',
    image: "https://picsum.photos/seed/mobile1/1600/900",
    title: "Latest iPhone 15 Pro",
    subtitle: "Experience the power of titanium.",
    createdAt: Date.now()
  },
  {
    id: '2',
    image: "https://picsum.photos/seed/mobile2/1600/900",
    title: "Samsung S24 Ultra",
    subtitle: "AI integrated for a smarter life.",
    createdAt: Date.now()
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [banners, setBanners] = useState<Banner[]>(() => {
    const cached = localStorage.getItem('hero_banners');
    try {
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(banners.length === 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const preloadImages = (data: Banner[]) => {
    data.forEach(banner => {
      const img = new Image();
      img.src = banner.image;
    });
  };

  useEffect(() => {
    if (banners.length > 0) {
      preloadImages(banners);
    }
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
        const finalData = data.length > 0 ? data : defaultBanners;
        
        setBanners(finalData);
        localStorage.setItem('hero_banners', JSON.stringify(finalData));
        preloadImages(finalData);
      } catch (error) {
        console.error("Error fetching banners:", error);
        if (banners.length === 0) {
          setBanners(defaultBanners);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return <div className="w-full aspect-[16/9] bg-gray-100 animate-pulse" />;
  }

  if (banners.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-8">
      {/* Search Bar Section */}
      <div className="max-w-2xl mx-auto w-full">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search for mobiles, accessories, gadgets..."
            className="w-full pl-12 pr-32 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit"
            className="hidden md:block absolute right-2 top-2 bottom-2 px-6 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
          >
            Search
          </button>
        </form>
      </div>

      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-200 rounded-2xl shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img 
              src={banners[current].image} 
              alt={banners[current].title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {(banners[current].title || banners[current].subtitle) && (
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8 md:px-24">
                {banners[current].title && (
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl md:text-6xl font-bold text-white mb-4"
                  >
                    {banners[current].title}
                  </motion.h1>
                )}
                {banners[current].subtitle && (
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-2xl text-gray-200"
                  >
                    {banners[current].subtitle}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {banners[current].title && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  current === idx ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {banners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrent(prev => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white z-10 backdrop-blur-sm transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrent(prev => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white z-10 backdrop-blur-sm transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;
