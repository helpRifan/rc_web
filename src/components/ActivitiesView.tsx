import React, { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Bookmark, ArrowRight, Video, Terminal, Cpu, Hammer, Microscope } from "lucide-react";
import { UPCOMING_EVENTS, ARCHIVE_RECAPS } from "../data";

export default function ActivitiesView() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -420, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 420, behavior: "smooth" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-xxl pb-xl"
    >
      {/* Page Header */}
      <section className="space-y-4 max-w-3xl border-b border-dashed border-zinc-800 pb-12">
        <h1 className="font-normal text-[#e5e1e4] text-5xl md:text-6xl tracking-[-0.65px]">
          Events and <span className="text-[#e8b828]">Workshops.</span>
        </h1>
        <p className="font-sans text-lg text-zinc-400">
          A comprehensive timeline of upcoming events, workshop logs, open system challenges, and historic mission archive recaps.
        </p>
      </section>

      {/* Upcoming Events horizontally scrollable */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-sans text-[#e5e1e4] text-2xl font-bold border-l-4 border-[#e8b828] pl-4">Upcoming Events</h2>
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft}
              className="w-12 h-12 rounded border border-zinc-900 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#e8b828]/45 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e8b828]/30"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollRight}
              className="w-12 h-12 rounded border border-zinc-900 bg-zinc-950 flex items-center justify-center text-[#e5e1e4] hover:text-white hover:border-[#e8b828]/45 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e8b828]/30"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {UPCOMING_EVENTS.map((event, idx) => (
            <div
              key={idx}
              className="min-w-[310px] sm:min-w-[360px] md:min-w-[400px] max-w-[400px] bg-[#101010] border border-zinc-800 rounded-md snap-start shrink-0 flex flex-col relative group overflow-hidden"
            >
              
              {/* Cover Area */}
              <div className="h-40 w-full bg-[#0c0c0e] relative overflow-hidden flex items-center justify-center border-b border-zinc-800">
                <div className="flex flex-col items-center">
                  <Terminal className="w-8 h-8 text-zinc-600 mb-2" />
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">SYSTEM SCHEMATIC LIVE_0{idx + 1}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#101010] border border-zinc-800 px-3 py-1 rounded flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'Coming Soon' ? 'bg-zinc-500' : 'bg-[#e8b828] animate-pulse'}`}></span>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.1em] font-semibold">{event.status}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-grow flex flex-col justify-between z-10 relative">
                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.2em]">{event.type} // {event.date}</div>
                  <h3 className="font-sans text-[#e5e1e4] text-xl font-medium tracking-tight">{event.title}</h3>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed line-clamp-2">{event.desc}</p>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <span className="font-sans text-[11px] text-zinc-500 text-center leading-tight">
                    Redirects to VITC Event Hub.<br/>Search for <strong className="text-zinc-300">"{event.title}"</strong> to register.
                  </span>
                  <a 
                    href="https://eventhubcc.vit.ac.in/EventHub/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full font-sans text-sm font-semibold h-10 rounded-md transition-all duration-300 flex items-center justify-center select-none ${
                      event.status === 'Coming Soon' 
                        ? 'bg-[#0c0c0e] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900' 
                        : 'bg-[#e8b828] text-[#101010] hover:bg-yellow-400'
                    }`}
                  >
                    {event.status === 'Coming Soon' ? 'View on Event Hub' : 'Register on Event Hub'}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Mission Archive */}
      <section className="space-y-8 border-t border-dashed border-zinc-800 pt-16">
        <h2 className="font-sans text-[#e5e1e4] text-3xl font-normal tracking-[-0.65px]">Mission Archive</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Item 1: Large feature item (spans 2 rows) */}
          <div className="lg:row-span-2 md:col-span-1 lg:col-span-1 relative group overflow-hidden bg-[#101010] rounded-md border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center p-4 text-center select-none">
              <Cpu className="w-12 h-12 text-zinc-700 mb-3" />
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1 font-semibold">ROBOTICS ARCHIVE CORE</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full space-y-4">
              <span className="font-mono text-xs text-[#e8b828] uppercase tracking-wider block">{ARCHIVE_RECAPS[0].category}</span>
              <h3 className="font-sans text-white text-2xl font-bold tracking-tight">{ARCHIVE_RECAPS[0].title}</h3>
              <p className="font-sans text-sm text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 leading-relaxed">
                {ARCHIVE_RECAPS[0].desc}
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="relative group overflow-hidden bg-[#101010] rounded-md border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center p-4 text-center select-none">
              <Hammer className="w-8 h-8 text-zinc-700 mb-2" />
              <span className="font-mono text-[9px] text-zinc-500 tracking-[0.2em] uppercase mb-1 font-semibold">ROBOTICS ARCHIVE SUB_01</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold block mb-1">{ARCHIVE_RECAPS[1].category}</span>
              <h3 className="font-sans text-[#e5e1e4] text-lg font-medium tracking-tight">{ARCHIVE_RECAPS[1].title}</h3>
            </div>
          </div>

          {/* Item 3 */}
          <div className="relative group overflow-hidden bg-[#101010] rounded-md border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center p-4 text-center select-none">
              <Microscope className="w-8 h-8 text-zinc-700 mb-2" />
              <span className="font-mono text-[9px] text-zinc-500 tracking-[0.2em] uppercase mb-1 font-semibold">ROBOTICS ARCHIVE SUB_02</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold block mb-1">{ARCHIVE_RECAPS[2].category}</span>
              <h3 className="font-sans text-[#e5e1e4] text-lg font-medium tracking-tight">{ARCHIVE_RECAPS[2].title}</h3>
            </div>
          </div>

          {/* Item 4: Wide recap item (spans 2 columns on desktop) */}
          <div className="md:col-span-2 relative group overflow-hidden bg-[#101010] rounded-md border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center p-4 text-center select-none">
              <Terminal className="w-12 h-12 text-zinc-700 mb-3" />
              <span className="font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase mb-1 font-semibold">ROBOTICS ARCHIVE SUB_03</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold block">{ARCHIVE_RECAPS[3].category}</span>
                <h3 className="font-sans text-[#e5e1e4] text-2xl font-medium tracking-tight">{ARCHIVE_RECAPS[3].title}</h3>
              </div>
              <span className="p-2 border border-zinc-800 text-zinc-400 rounded-md group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
