import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const HERO_IMAGES = [
  "/hero/1.jpg",
  "/hero/2.jpg",
  "/hero/3.jpg",
  "/hero/4.jpg",
  "/hero/5.jpg",
  "/hero/6.jpg",
  "/hero/7.jpg",
  "/hero/8.jpg",
  "/hero/9.jpg",
];

interface GalleryImage {
  id: string;
  url: string;
  positionClasses: string;
  delay: number;
}

export default function HeroGallery() {
  const [activeImages, setActiveImages] = useState<GalleryImage[]>([]);

  // Spread 8 images vertically along the far left and right edges.
  // This guarantees no images overlap with each other, nor with the central text.
  const TOP_GALLERY_POSITIONS = [
    // Left Side
    "top-[5%] left-[6%] sm:left-[8%]",
    "top-[25%] left-[2%] sm:left-[4%]",
    "top-[48%] left-[4%] sm:left-[6%]",
    // Bottom Left (near Explore Events button, but pushed out to avoid overlap)
    "bottom-[25%] left-[15%] sm:left-[25%]",
    
    // Right Side
    "top-[5%] right-[6%] sm:right-[8%]",
    "top-[25%] right-[2%] sm:right-[4%]",
    "top-[48%] right-[4%] sm:right-[6%]",
    // Bottom Right (near About Us button, pushed out to avoid overlap)
    "bottom-[25%] right-[15%] sm:right-[25%]",
  ];

  useEffect(() => {
    // Read the image used by the loading screen and exclude it
    const lastLoadingImage = sessionStorage.getItem('lastLoadingImage');
    const availableImages = HERO_IMAGES.filter(img => img !== lastLoadingImage).slice(0, 8);
    
    const mappedImages = availableImages.map((url, i) => ({
      id: `img-${i}`,
      url,
      positionClasses: TOP_GALLERY_POSITIONS[i % TOP_GALLERY_POSITIONS.length],
      delay: i * 0.15
    }));

    setActiveImages(mappedImages);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {activeImages.map((img) => (
          <StaticFloatingImage key={img.id} img={img} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function StaticFloatingImage({ img }: { img: GalleryImage; key?: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        opacity: { duration: 0.8, delay: img.delay },
        scale: { type: "spring", stiffness: 80, damping: 20, delay: img.delay }
      }}
      className={`absolute ${img.positionClasses} pointer-events-none`}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0] // Gentle vertical float
        }}
        transition={{ 
          duration: 4 + Math.random() * 2, 
          repeat: Infinity, 
          repeatType: "mirror", 
          ease: "easeInOut",
          delay: Math.random() * 2
        }}
        className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-md overflow-hidden bg-[#101010] border border-zinc-800"
      >
        <div className="w-full h-full relative">
          <img 
            src={img.url} 
            alt="Gallery Asset" 
            className="w-full h-full object-cover opacity-40 sm:opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent mix-blend-overlay"></div>
        </div>
      </motion.div>
    </motion.div>
  );
}
