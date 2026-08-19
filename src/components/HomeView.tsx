import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Cpu, Hammer, Microscope, Terminal, Lightbulb, Instagram, Linkedin, Mail, ExternalLink, Wifi, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY_ITEMS, UPCOMING_EVENTS } from "../data";
import HeroGallery from "./HeroGallery";
import { supabase } from "../lib/supabase";

const SOCIAL_NODES = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@robotics_club_vitc",
    url: "https://www.instagram.com/robotics_club_vitc/",
    tagline: "Follow hardware design snapshots, robotics reels, active workshops & test trials.",
    logs: [
      "ESTABLISHING HIGH-BANDWIDTH DATA LINK...",
      "TARGET IP: instagram.com/robotics_club_vitc",
      "METRICS RETRIEVAL STATUS: COMPLETED",
      "SYNCED: 4 ACTIVE SYSTEM SHOWCASE SEGMENTS",
      "COMMUNICATION LINK [ONLINE & READY]"
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "Robotics Club VITC",
    url: "https://in.linkedin.com/company/robotics-club-vitc",
    tagline: "Engage with commercial partners, student publications, research papers & alumni networks.",
    logs: [
      "SEARCHING PROFESSIONAL INTERFACE STACK...",
      "TARGET GROUP: company/robotics-club-vitc",
      "HANDSHAKE PROTOCOL: SUCCESSFUL",
      "FOUND: 12 ACADEMIC PROJECT PUBLICATIONS",
      "COMMUNICATION LINK [ONLINE & READY]"
    ]
  },
  {
    id: "gmail",
    name: "Email",
    handle: "robotics.club@vit.ac.in",
    url: "mailto:robotics.club@vit.ac.in",
    tagline: "Send us direct proposals, physical hardware sponsorships, or general collaboration inquiries.",
    logs: [
      "OPENING SECURE SMTP HANDSHAKE...",
      "TARGET INBOX: robotics.club@vit.ac.in",
      "RESOLVING INCOMING DISPATCH PROTOCOLS...",
      "CONNECTED TO ROBOTICS CORE MAILBOX",
      "COMMUNICATION LINK [ONLINE & READY]"
    ]
  }
];

interface HomeViewProps {
  onNavigate: (tab: "about" | "departments" | "members" | "activities" | "certificates" | "admin") => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [events, setEvents] = useState<any[]>(UPCOMING_EVENTS);

  useEffect(() => {
    async function fetchEvents() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from("events").select("*").eq("stage", "upcoming").order("date", { ascending: false });
        if (!error && data) {
          setEvents(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchEvents();
  }, []);

  // Reusable custom hook for ultra-smooth counting up with deceleration animation
  function useSmoothCounter(target: number, isVisible: boolean, duration: number = 1800, delay: number = 0) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;
      
      let startTime: number | null = null;
      let animationFrameId: number;

      const startTimeout = setTimeout(() => {
        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          
          // Decelerate ease-out count animation
          const easeProgress = progress * (2 - progress);
          setCount(Math.floor(easeProgress * target));

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            setCount(target);
          }
        };
        animationFrameId = requestAnimationFrame(animate);
      }, delay);

      return () => {
        clearTimeout(startTimeout);
        cancelAnimationFrame(animationFrameId);
      };
    }, [target, isVisible, duration, delay]);

    return count;
  }

  // Stats visibility ref
  const statsRef = React.useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Smooth count states
  const projectsCount = useSmoothCounter(50, statsVisible, 2280, 100);
  const membersCount = useSmoothCounter(200, statsVisible, 2570, 250);
  const awardsCount = useSmoothCounter(15, statsVisible, 2140, 400);

  const exploreScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollExploreLeft = () => {
    if (exploreScrollRef.current) {
      exploreScrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollExploreRight = () => {
    if (exploreScrollRef.current) {
      exploreScrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const scrollGalleryLeft = () => {
    if (galleryScrollRef.current) {
      const width = galleryScrollRef.current.clientWidth;
      galleryScrollRef.current.scrollBy({ left: -width, behavior: "smooth" });
    }
  };

  const scrollGalleryRight = () => {
    if (galleryScrollRef.current) {
      const width = galleryScrollRef.current.clientWidth;
      galleryScrollRef.current.scrollBy({ left: width, behavior: "smooth" });
    }
  };

  const [selectedMarqueeCard, setSelectedMarqueeCard] = useState<typeof UPCOMING_EVENTS[number] | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<typeof GALLERY_ITEMS[number] | null>(null);

  useEffect(() => {
    if (selectedMarqueeCard || selectedGalleryItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMarqueeCard, selectedGalleryItem]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-0"
    >
      {/* Hero Section containing stats counter to display above the fold */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-24 pb-12 overflow-hidden border-b border-dashed border-zinc-800">
        <div className="absolute inset-0 bg-[#0c0c0e] z-0"></div>

        {/* Tech decorative target lines */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-800 z-0"></div>
        <div className="absolute left-6 md:left-gutter top-0 h-full w-[1px] bg-zinc-800 z-0 hidden md:block"></div>
        <div className="absolute right-6 md:right-gutter top-0 h-full w-[1px] bg-zinc-800 z-0 hidden md:block"></div>

        {/* Floating Background Image Fences */}
        <HeroGallery />

        <div className="relative z-10 w-full max-w-container-max mx-auto px-gutter text-center space-y-md md:space-y-lg flex-grow flex flex-col justify-center max-w-4xl pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center justify-center">
            
            <div className="space-y-4">
              <motion.h1 
                initial={{ translateY: 40, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
                className="font-normal text-[#e5e1e4] text-5xl md:text-6xl lg:text-7xl tracking-[-0.65px] leading-[1.1] flex flex-col items-center gap-1"
              >
                <span>Robotics Club</span>
                <span className="text-[#e8b828]">VIT Chennai.</span>
              </motion.h1>

              <motion.p 
                initial={{ translateY: 30, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                className="font-sans text-base md:text-lg text-zinc-400 max-w-2xl mx-auto"
              >
                VIT Chennai's premier division for precision mechanical rigs, cybernetics systems, and real-world engineering.
              </motion.p>
            </div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="pt-8 flex gap-4 justify-center"
            >
              <button 
                onClick={() => onNavigate("activities")}
                className="bg-[#e8b828] text-[#101010] font-sans text-sm font-semibold px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors hover:bg-yellow-400"
              >
                Explore Events
              </button>
              <button 
                onClick={() => onNavigate("about")}
                className="bg-[#101010] text-[#e5e1e4] border border-zinc-800 font-sans text-sm font-medium px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                About Us
              </button>
            </motion.div>
          </div>
        </div>

        {/* Lifted Stats Counter Panel Integrated inside Hero */}
        <motion.div 
          ref={statsRef}
          initial={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
          className="relative z-10 w-full max-w-container-max mx-auto px-gutter mt-auto pt-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800 pt-8">
            <div className="bg-[#101010] p-6 border border-zinc-800 rounded-md text-left flex flex-col justify-between gap-4">
              <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">Deployed Projects</div>
              <div className="font-mono text-3xl font-medium tracking-tight text-[#e5e1e4]">{projectsCount}<span className="text-[#e8b828]">+</span></div>
            </div>
            <div className="bg-[#101010] p-6 border border-zinc-800 rounded-md text-left flex flex-col justify-between gap-4">
              <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">Active Engineers</div>
              <div className="font-mono text-3xl font-medium tracking-tight text-[#e5e1e4]">{membersCount}<span className="text-[#e8b828]">+</span></div>
            </div>
            <div className="bg-[#101010] p-6 border border-zinc-800 rounded-md text-left flex flex-col justify-between gap-4">
              <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">National Laurels</div>
              <div className="font-mono text-3xl font-medium tracking-tight text-[#e5e1e4]">{awardsCount}<span className="text-[#e8b828]">+</span></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Explore Events Section */}
      <section className="space-y-6 overflow-hidden relative py-8 px-gutter max-w-container-max mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div className="space-y-2">
            <h2 className="font-sans text-headline-lg font-bold text-white tracking-tight">Explore Events</h2>
            <p className="font-sans text-body-md text-zinc-400 max-w-xl">
              Join our upcoming workshops, lectures, and competitions to expand your knowledge and skills in robotics.
            </p>
          </div>
          
          <div className="flex gap-2 hidden md:flex">
            <button 
              onClick={scrollExploreLeft}
              className="w-10 h-10 rounded border border-zinc-900 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#e8b828]/45 transition-all active:scale-95 cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollExploreRight}
              className="w-10 h-10 rounded border border-zinc-900 bg-zinc-950 flex items-center justify-center text-[#e5e1e4] hover:text-white hover:border-[#e8b828]/45 transition-all active:scale-95 cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full pt-6">
          <div 
            ref={exploreScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {events.length === 0 ? (
              <div className="text-zinc-500 font-mono text-sm w-full text-center py-10 border border-zinc-800 rounded bg-zinc-900/30">NO UPCOMING EVENTS LOGGED IN DATABASE</div>
            ) : events.map((event, index) => {
              return (
                <div 
                  key={event.id || `${event.title}-${index}`}
                  onClick={() => setSelectedMarqueeCard(event)}
                  className="w-[280px] md:w-[350px] flex-shrink-0 group bg-zinc-900/40 border border-zinc-800/40 p-6 rounded-lg space-y-4 hover:border-[#e8b828]/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none snap-start"
                  title="Click to open event details"
                >
                  <div className="w-full h-32 rounded-md bg-zinc-800/60 flex items-center justify-center overflow-hidden transition-colors duration-500">
                    <img src={event.image_url || event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-sans text-[#e8b828] text-xl font-semibold transition-colors duration-300 group-hover:text-white">{event.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-widest">{event.date}</span>
                  </div>
                  <p className="font-sans text-body-md text-zinc-400 text-sm leading-relaxed line-clamp-2">
                    {event.description || event.desc}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-[#e8b828] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>VIEW EVENT</span>
                    <ArrowRight className="w-3 h-3 translate-y-[0.5px] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlights Gallery */}
      <section className="px-gutter max-w-container-max mx-auto space-y-md border-t border-zinc-900 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-label-sm text-[#e8b828] uppercase tracking-widest block">Operations Recap</span>
            <h2 className="font-sans text-headline-lg font-bold text-white tracking-tight">Highlights Gallery</h2>
            <p className="font-sans text-body-md text-zinc-400 max-w-xl">
              A visual record of our operational events, system integrations, workshop seminars, and competitive teams.
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-3 pb-2">
            <button 
              onClick={scrollGalleryLeft}
              className="p-3 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollGalleryRight}
              className="p-3 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Slider */}
        <div className="relative pt-8">
          <div 
            ref={galleryScrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4"
          >
            {GALLERY_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onClick={() => setSelectedGalleryItem(item)}
                className="min-w-full sm:min-w-[90%] md:min-w-[80%] snap-center relative overflow-hidden group cursor-pointer h-[400px] md:h-[600px] rounded-xl tech-border bg-zinc-950 flex-shrink-0"
              >
                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-100 brightness-110 contrast-125 saturate-150 group-hover:scale-105 group-hover:brightness-125 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none opacity-90"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="font-mono text-xs md:text-sm text-[#e8b828] uppercase tracking-widest mb-3 block">{item.subtitle}</span>
                  <h3 className="font-sans text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
                  <span className="text-[10px] md:text-xs uppercase font-mono text-zinc-300 border border-zinc-700 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded tracking-wider font-bold inline-flex items-center gap-2 group-hover:border-[#e8b828]/50 group-hover:text-[#e8b828] transition-colors">
                    View Project Details <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="px-gutter max-w-container-max mx-auto border-t border-zinc-900 pt-16 pb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="font-sans text-headline-lg font-bold tracking-tight mb-8"
        >
          <span className="text-white">Our</span> <span className="text-[#e8b828]">Socials</span>
          <motion.span 
            animate={{ opacity: [1, 0, 1] }} 
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            className="text-[#e8b828] ml-1 -translate-y-1 inline-block"
          >
            _
          </motion.span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SOCIAL_NODES.map((node) => {
            const IconComponent = 
              node.id === "instagram" ? Instagram : 
              node.id === "linkedin" ? Linkedin : Mail;
            
            return (
              <motion.a
                key={node.id}
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer group flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 relative overflow-hidden backdrop-blur-sm bg-zinc-950/40 border-zinc-950 hover:border-zinc-800 hover:bg-zinc-900/40`}
              >
                <div className={`p-3 rounded-md transition-colors duration-300 bg-zinc-900 text-zinc-400 group-hover:text-[#e8b828] group-hover:bg-[#e8b828]/10`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-white text-md tracking-tight flex items-center gap-2">
                    {node.name}
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="font-mono text-[11px] text-[#e8b828]/80 mt-0.5">{node.handle}</p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </section>

      {/* Interactive Modal Popover */}
      <AnimatePresence>
        {selectedMarqueeCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMarqueeCard(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
            />
            
            {/* Modal Body Card Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Highlight yellow accent bar at top */}
              <div className="h-1 bg-[#e8b828] w-full" />
              
              {/* Scrollable Container */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMarqueeCard(null)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850/60 rounded-full transition-colors cursor-pointer"
                  aria-label="Close details modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header section with Icon */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-zinc-900 pb-5">
                  <div className="w-16 h-16 rounded overflow-hidden bg-zinc-800">
                    <img src={selectedMarqueeCard.image_url || selectedMarqueeCard.image} alt={selectedMarqueeCard.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-[#e8b828] font-mono text-[9px] uppercase tracking-wider font-bold">
                      {selectedMarqueeCard.status || "Upcoming"}
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{selectedMarqueeCard.title}</h2>
                  </div>
                </div>

                {/* Sub-cluster Full Details Narrative */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">
                    EVENT DETAILS
                  </span>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {selectedMarqueeCard.description || selectedMarqueeCard.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">
                      SCHEDULED DATE
                    </span>
                    <ul className="space-y-2.5">
                      <li className="flex items-center gap-2.5 text-sm text-zinc-350">
                        <CheckCircle className="w-4 h-4 text-[#e8b828] shrink-0" />
                        <span className="leading-snug font-mono text-zinc-300">{selectedMarqueeCard.date}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Call to Action for Event Hub */}
                <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-zinc-900">
                  <span className="font-sans text-[12px] text-zinc-400 text-center leading-tight">
                    Redirects to VITC Event Hub.<br/>Search for <strong className="text-zinc-200">"{selectedMarqueeCard.title}"</strong> to register.
                  </span>
                  <a 
                    href={selectedMarqueeCard.registration_link || selectedMarqueeCard.registrationLink || "https://eventhubcc.vit.ac.in/EventHub/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full font-sans text-sm font-semibold h-12 rounded-md transition-all duration-300 flex items-center justify-center select-none mt-2 ${
                      selectedMarqueeCard.status === 'Coming Soon' 
                        ? 'bg-[#0c0c0e] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900' 
                        : 'bg-[#e8b828] text-[#101010] hover:bg-yellow-400 font-bold'
                    }`}
                  >
                    {selectedMarqueeCard.status === 'Coming Soon' ? 'View on Event Hub' : 'Register on Event Hub'}
                  </a>
                </div>
              </div>

              {/* Secure footer panel */}
              <div className="bg-zinc-900/30 px-6 py-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  EVENT LINK SECURED
                </span>
                <span>SYSTEM_AUTHORIZATION_OK</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gallery Details Modal Popover */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGalleryItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
            />
            
            {/* Modal Body Card Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Highlight yellow accent bar at top */}
              <div className="h-1 bg-[#e8b828] w-full" />
              
              {/* Scrollable Container */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedGalleryItem(null)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850/60 rounded-full transition-colors cursor-pointer z-50"
                  title="Close Media View"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Media Schematic Holder */}
                <div className="relative w-full h-[250px] sm:h-[300px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-850 flex flex-col items-center justify-center">
                  <img src={selectedGalleryItem.image} alt={selectedGalleryItem.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none opacity-80"></div>
                  
                  <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-[#27272a]/60 text-[10px] font-mono text-[#e8b828] uppercase font-bold tracking-wider z-20">
                    {selectedGalleryItem.subtitle}
                  </div>
                </div>

                {/* Sub-cluster Full Details Narrative */}
                <div className="space-y-4 pt-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedGalleryItem.title}</h2>
                  
                  <div className="bg-zinc-900/40 border border-zinc-850/60 rounded-lg p-5">
                    <span className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 pb-3 border-b border-zinc-850/80">
                      <Microscope className="w-3.5 h-3.5 text-[#e8b828]" />
                      MISSION LOG FILE // ENTRY_0x{selectedGalleryItem.id.toString().padStart(4, '0')}
                    </span>
                    <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                      {/* Using the added story property or fallback */}
                      {"story" in selectedGalleryItem ? (selectedGalleryItem as any).story : "Log entry currently unavailable for this media slot."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure footer panel */}
              <div className="bg-zinc-900/30 px-6 py-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ENCRYPTED LOG READ SUCCESS
                </span>
                <span>VIT_R_SYSTEMS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
