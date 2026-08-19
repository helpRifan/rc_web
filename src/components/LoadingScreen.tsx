import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

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

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const randomImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * HERO_IMAGES.length);
    const selected = HERO_IMAGES[randomIndex];
    sessionStorage.setItem('lastLoadingImage', selected);
    return selected;
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5 seconds loading time
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0e] overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-sonar-pulse {
          0% {
            transform: scale(0.08);
            opacity: 0;
          }
          15% {
            opacity: 0.55;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }
      ` }} />

      <div className="absolute inset-0 flex items-center justify-center opacity-90 select-none pointer-events-none z-0">
        <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px]">
          <span 
            className="absolute inline-flex h-full w-full rounded-full bg-[#e8b828]/30 mix-blend-screen" 
            style={{ 
              animation: "slow-sonar-pulse 4s cubic-bezier(0.1, 0.8, 0.25, 1) infinite",
              transformOrigin: "center"
            }}
          ></span>
          <span 
            className="absolute inline-flex h-full w-full rounded-full bg-[#e8b828]/25 mix-blend-screen" 
            style={{ 
              animation: "slow-sonar-pulse 4s cubic-bezier(0.1, 0.8, 0.25, 1) infinite",
              animationDelay: "1.3s",
              transformOrigin: "center"
            }}
          ></span>
          <span className="relative inline-flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(232,184,40,0.15)] relative mb-6"
            >
              <img src={randomImage} alt="Loading Asset" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent mix-blend-overlay pointer-events-none"></div>
            </motion.div>
            <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-widest font-bold animate-pulse">Initializing System</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
