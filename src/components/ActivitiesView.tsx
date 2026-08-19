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
              <div className="h-48 w-full bg-[#0c0c0e] relative overflow-hidden flex items-center justify-center border-b border-zinc-800">
                {event.image ? (
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Terminal className="w-8 h-8 text-zinc-600 mb-2" />
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">SYSTEM SCHEMATIC LIVE_0{idx + 1}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-[#101010]/90 backdrop-blur-sm border border-zinc-800 px-3 py-1 rounded flex items-center gap-2 z-10">
                  <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'Coming Soon' ? 'bg-zinc-500' : 'bg-[#e8b828] animate-pulse'}`}></span>
                  <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-[0.1em] font-semibold">{event.status}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-grow flex flex-col justify-between z-10 relative">
                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-[#e8b828] font-semibold uppercase tracking-[0.2em]">{event.type} // {event.date}</div>
                  <h3 className="font-sans text-[#e5e1e4] text-xl font-medium tracking-tight group-hover:text-[#e8b828] transition-colors">{event.title}</h3>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed line-clamp-3">{event.desc}</p>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <span className="font-sans text-[11px] text-zinc-500 text-center leading-tight">
                    Redirects to VITC Event Hub.<br/>Search for <strong className="text-zinc-300">"{event.title}"</strong> to register.
                  </span>
                  <a 
                    href={event.registrationLink || "https://eventhubcc.vit.ac.in/EventHub/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full font-sans text-sm font-semibold h-10 rounded-md transition-all duration-300 flex items-center justify-center select-none cursor-pointer ${
                      event.status === 'Coming Soon' 
                        ? 'bg-[#0c0c0e] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900' 
                        : 'bg-[#e8b828] text-[#101010] hover:bg-yellow-400 font-bold'
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
      <section className="space-y-12 border-t border-dashed border-zinc-800 pt-16">
        <div>
          <h2 className="font-sans text-[#e5e1e4] text-3xl font-normal tracking-[-0.65px]">Mission Archive</h2>
          <p className="font-sans text-sm text-zinc-400 mt-2">Chronological record of past operations and exhibitions.</p>
        </div>

        {/* 2026 Archive */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="font-mono text-xl text-[#e8b828] font-bold">26'</h3>
            <div className="h-px bg-zinc-800 flex-grow border-t border-dashed border-zinc-700"></div>
          </div>
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {ARCHIVE_RECAPS.filter(item => item.year === '2026').map((item, idx) => (
              <a 
                key={idx}
                href={item.link || "#"}
                target={item.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row bg-[#101010] border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors shrink-0"
              >
                <div className="w-full sm:w-48 h-40 sm:h-auto bg-[#0c0c0e] relative shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Cpu className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col justify-center flex-grow space-y-2">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">{item.category}</span>
                  <h4 className="font-sans text-white text-xl font-bold tracking-tight group-hover:text-[#e8b828] transition-colors">{item.title}</h4>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-2xl">{item.desc}</p>
                </div>
                {item.link && (
                  <div className="hidden sm:flex items-center pr-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                    <ArrowRight className="w-5 h-5 text-[#e8b828]" />
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* 2025 Archive */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="font-mono text-xl text-[#e8b828] font-bold">25'</h3>
            <div className="h-px bg-zinc-800 flex-grow border-t border-dashed border-zinc-700"></div>
          </div>
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {ARCHIVE_RECAPS.filter(item => item.year === '2025').map((item, idx) => (
              <div 
                key={idx}
                className="group flex flex-col sm:flex-row bg-[#101010] border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors shrink-0"
              >
                <div className="w-full sm:w-48 h-40 sm:h-auto bg-[#0c0c0e] relative shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Terminal className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col justify-center flex-grow space-y-2">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">{item.category}</span>
                  <h4 className="font-sans text-white text-xl font-bold tracking-tight">{item.title}</h4>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-2xl">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
