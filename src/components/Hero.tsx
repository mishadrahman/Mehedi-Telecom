import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Banner } from '../types';

const defaultBanners = [
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
        setBanners(data.length > 0 ? data : defaultBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setBanners(defaultBanners);
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
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-200">
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

      {banners.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent(prev => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white z-10"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={() => setCurrent(prev => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white z-10"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
    </div>
  );
};

export default Hero;
