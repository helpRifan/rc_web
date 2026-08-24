import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Network, Router, X, BookOpen, Clock, Activity, CheckCircle, Wrench, MapPin, Sparkles } from "lucide-react";
import DriftWall, { DriftWallItem } from "./DriftWall";
import { GALLERY_ITEMS } from "../data";
import { supabase } from "../lib/supabase";

export default function AboutView() {
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState(GALLERY_ITEMS);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("order_index", { ascending: true });

        if (!error && data && data.length > 0) {
          setGalleryItems(data.map(d => ({
            id: d.id,
            title: d.title,
            subtitle: d.subtitle || d.category,
            image: d.image_url || d.image,
            story: d.story || d.description
          })));
        }
      } catch (e) {
        console.warn("Using default gallery items for DriftWall", e);
      }
    };

    fetchHighlights();
  }, []);

  const driftItems: DriftWallItem[] = (galleryItems && galleryItems.length > 0 ? galleryItems : GALLERY_ITEMS).map(item => ({
    image: item.image,
    title: item.title,
    href: undefined
  }));

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-xxl pb-xl"
      >
        {/* Full-Bleed 3D DriftWall Interactive Header (Full Viewport Width, unboxed) */}
        <section className="relative w-screen left-1/2 right-1/2 -mx-[50vw] h-[480px] sm:h-[580px] md:h-[680px] overflow-hidden -mt-12 mb-16 bg-transparent">
          <DriftWall
            items={driftItems}
            columns={7}
            tileWidth={230}
            tileHeight={152}
            gap={20}
            tilt={15}
            turn={-12}
            perspective={1200}
            depth={130}
            speed={38}
            direction="up"
            variance={0.45}
            parallax={0.65}
            lift={68}
            fade={0.7}
            dim={0.6}
            overlayColor="#0c0c0e"
            radius={14}
            roll={0}
            pauseOnHover={false}
            grayscale={false}
          />

          {/* Seamless Edge Blending into page background */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0c0c0e] via-[#0c0c0e]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/70 to-transparent pointer-events-none" />

          {/* Ambient Overlay Tag */}
          <div className="absolute top-6 left-6 sm:left-12 z-10 pointer-events-none flex items-center gap-2.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 px-4 py-2 rounded-full shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8b828] animate-pulse"></span>
            <span className="font-mono text-xs text-zinc-300 font-semibold tracking-wider uppercase">
              Operations &amp; R&amp;D Highlights Wall
            </span>
          </div>
        </section>

        {/* Genesis & Split Story */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-xxl items-center">
          <div className="md:col-span-7 space-y-md">
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-[0.2em] block font-semibold">Operational Core</span>
              <h2 className="font-sans text-4xl md:text-5xl font-normal text-[#e5e1e4] tracking-[-0.65px]">Our Genesis</h2>
            </div>
            <p className="font-sans text-base text-zinc-400 leading-relaxed">
              The Robotics Club at VIT Chennai is a dynamic student-driven community dedicated to innovation, learning, and collaboration in robotics and automation. The club provides a platform for students to explore cutting-edge technologies such as artificial intelligence, machine learning, and embedded systems.
            </p>
            <p className="font-sans text-base text-zinc-400 leading-relaxed">
              Through hands-on projects, workshops, and competitions, members enhance their technical skills and teamwork abilities. The club also fosters creativity by encouraging students to develop unique robotic solutions for real-world challenges.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => setManifestoOpen(true)}
                className="inline-flex items-center gap-2 font-sans text-sm text-[#101010] bg-[#e8b828] hover:bg-yellow-400 px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Launch System Manifesto
              </button>
            </div>
          </div>

          {/* Image containers for Our Genesis */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full items-center">
            <div className="rounded-lg overflow-hidden tech-border relative group aspect-video sm:aspect-[4/5] w-full bg-zinc-950">
              <img src="/genesis-1.jpg" alt="Genesis Team 1" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            
            <div className="rounded-lg overflow-hidden tech-border relative group aspect-video sm:aspect-[4/5] w-full bg-zinc-950">
              <img src="/genesis-2.jpg" alt="Genesis Team 2" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>
        </section>

        {/* VIT Chennai Campus Section */}
        <section className="border-t border-dashed border-zinc-800 pt-16 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-md bg-[#101010] border border-zinc-800 w-full flex flex-col overflow-hidden tech-border group">
                {/* Image Section - Completely unobstructed */}
                <div className="relative w-full overflow-hidden bg-zinc-950 flex justify-center">
                  <img src="/campus.jpg" alt="VIT Chennai Campus" className="w-full h-auto max-h-[600px] object-contain brightness-110 contrast-125 transition-transform duration-700 group-hover:scale-105" />
                </div>
                
                {/* Action Section */}
                <div className="p-6 relative z-10">
                  <div className="pt-2">
                    <a 
                      href="https://maps.google.com/?q=VIT+Chennai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full gap-2 font-sans text-sm text-[#101010] bg-zinc-100 hover:bg-white px-6 py-3 rounded-md font-semibold transition-colors mt-4"
                    >
                      <MapPin className="w-4 h-4 text-zinc-900" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-[0.2em] font-semibold block">Physical Infrastructure</span>
                <h3 className="font-sans text-3xl font-normal text-[#e5e1e4] tracking-[-0.65px]">VIT Chennai Campus</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-[#101010] border border-zinc-800 p-6 rounded-md transition-all">
                  <div className="flex items-center gap-3 text-[#e5e1e4] font-sans font-medium mb-3 text-sm sm:text-base">
                    <span className="text-zinc-500">
                      <Network className="w-5 h-5" />
                    </span>
                    The Workspace
                  </div>
                  <p className="font-sans text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Located in the physical heart of VIT Chennai campus, our designated lab operates as a 24/7 sandbox space equipped with high-frequency kinetic machinery and 3D prototyping layers.
                  </p>
                </div>

                <div className="bg-[#101010] border border-zinc-800 p-6 rounded-md transition-all">
                  <div className="flex items-center gap-3 text-[#e5e1e4] font-sans font-medium mb-3 text-sm sm:text-base">
                    <span className="text-zinc-500">
                      <Router className="w-5 h-5" />
                    </span>
                    Inventory & Computational Hub
                  </div>
                  <p className="font-sans text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    We maintain robust inventory units with STM32 systems, modular microcontrollers, NVIDIA Jetson modules, and multi-sensor spatial navigation arrays.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </motion.div>

      {/* Interactive Manifesto details modal */}
      <AnimatePresence>
        {manifestoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop Blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManifestoOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
            />

            {/* Modal Body container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, translateY: 30 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, translateY: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl bg-[#101010] border border-zinc-800 rounded-md overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh] text-left"
            >
              {/* Header block */}
              <div className="bg-[#0c0c0e] p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 border border-zinc-800 text-zinc-400 rounded-md">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-sans text-[#e5e1e4] font-medium text-lg">System Manifesto</h3>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-semibold mt-1">ROBOTICS CLUB ADMINISTRATIVE GENERAL RULES</p>
                  </div>
                </div>
                <button 
                  onClick={() => setManifestoOpen(false)}
                  className="p-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable body contents */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto font-sans leading-relaxed text-sm text-zinc-300">
                <div className="space-y-3">
                  <h4 className="font-medium text-[#e5e1e4] text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    Cooperation & Domain Integration
                  </h4>
                  <p className="text-sm text-zinc-400">
                    We bring mechanical developers, board routing artisans, and high-level AI designers together into deep workspace alignment. All club projects operate on a unified design tree to ensure compatibility across structural mechanisms and microcontrollers.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-[#e5e1e4] text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-500" />
                    Academic Transparency & Security
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Our workspace utilizes standard academic protocols. All hardware nodes, inventory tools, and credential validation processes operate securely to maintain physical safety and data privacy limits.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-[#e5e1e4] text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-zinc-500" />
                    Our Five Prime Objectives:
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400 pl-4 list-decimal">
                    <li>Deliver hands-on physical labs and workshops addressing inverse mechanics and firmware logic.</li>
                    <li>Nurture innovative national level prototypes for elite autonomous contests (ERC, RoboClash, etc.).</li>
                    <li>Bridge industry expertise with active VIT Chennai student researchers.</li>
                    <li>Empower members with real-world project portfolios, industry linkages, and community mentors.</li>
                    <li>Pioneer secure, safe, and accessible robotic initiatives serving society and humanitarian tasks.</li>
                  </ul>
                </div>
              </div>

              {/* Clean minimal footer */}
              <div className="bg-[#0c0c0e] px-6 py-4 border-t border-zinc-800 text-right">
                <button 
                  onClick={() => setManifestoOpen(false)}
                  className="bg-[#e8b828] text-[#101010] font-sans text-sm px-6 py-2.5 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
