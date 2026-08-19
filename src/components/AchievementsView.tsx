import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, Factory, Boxes, Users, Zap, BrainCircuit, ShieldCheck, Database, Camera, ExternalLink, Handshake, Globe, X, Terminal } from "lucide-react";

export default function AchievementsView() {
  const [selectedPartner, setSelectedPartner] = useState<typeof partners[number] | null>(null);

  useEffect(() => {
    if (selectedPartner) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPartner]);

  const partners = [
    {
      id: 1,
      name: "Jet Aerospace",
      category: "Aerospace & UAV",
      description: "Collaborating to establish an Innovation Center and Drone Technology Park. We conduct joint R&D projects leveraging their ASSC-accredited framework for UAV prototyping.",
      summary: "Provides complete solutions for academics & industries in Aerospace & Aviation. Partners with IHFC (IIT Delhi) for advanced Drone Tech Park infrastructures.",
      icon: <Rocket className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=jetaero.in&sz=128",
      websiteUrl: "https://jetaero.in"
    },
    {
      id: 2,
      name: "Alstruct India",
      category: "Automation & Handling",
      description: "Partnering to develop modular automated assembly lines. Our members utilize their premium aluminium extrusion profiles for high-load robotic chassis and intelligent conveyors.",
      summary: "Specializes in material handling and assembly technology products, including precision aluminium extrusions, modular conveyors, and IoT-integrated assembly work stations.",
      icon: <Factory className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=alstrut.com&sz=128",
      websiteUrl: "https://www.alstrut.com"
    },
    {
      id: 3,
      name: "Unbox Robotics",
      category: "Supply Chain Systems",
      description: "Exploring next-generation robotics-based fulfillment. We collaborate on optimizing algorithms for rapid parcel sortation and express logistics using swarm intelligence.",
      summary: "Leading supply chain robotics technology company accelerating parcel sortation and order fulfillment for massive e-commerce, retail, and logistics enterprises.",
      icon: <Boxes className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=unboxrobotics.com&sz=128",
      websiteUrl: "https://www.unboxrobotics.com"
    },
    {
      id: 4,
      name: "Prag Robotics",
      category: "Industrial Education",
      description: "Bridging the gap between our student engineers and the industry through the 'T-bridge' platform, focusing on seamless techno-education and process enhancement solutions.",
      summary: "Offers unique 'T-bridge' learning platform blending techno-education for academia with advanced process enhancement robotic solutions for industrial manufacturing.",
      icon: <Users className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=pragrobotics.com&sz=128",
      websiteUrl: "https://pragrobotics.com"
    },
    {
      id: 5,
      name: "EPR LABS",
      category: "Power Electronics",
      description: "Executing joint research in advanced power electronics, STATCOM systems, and harmonic filtering to solve challenging hardware power-draw problems in our autonomous vehicles.",
      summary: "High-tech power electronics specialists designing and manufacturing heavy industrial electronic systems, including STATCOM and complex harmonic filtering solutions.",
      icon: <Zap className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=eprlabs.com&sz=128",
      websiteUrl: "https://eprlabs.com"
    },
    {
      id: 6,
      name: "Tezznova",
      category: "Applied Robotics",
      description: "Engaging in continuous R&D with their expert teams to prototype and test novel artificial intelligence architectures designed for robust industrial integration.",
      summary: "Innovates customized products for industrial and domestic purposes, driving forward extreme energy efficiency, reliability, and modern applied Artificial Intelligence.",
      icon: <BrainCircuit className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=tezznova.com&sz=128",
      websiteUrl: "https://tezznova.com"
    },
    {
      id: 7,
      name: "L&T Technology Services",
      category: "Engineering & R&D",
      description: "Gaining critical exposure to global ER&D standards. Our students participate in knowledge-sharing sessions focused on smart manufacturing and autonomous welding innovations.",
      summary: "Global leader in Engineering and R&D (ER&D) services, innovating across smart manufacturing, digitalization, and deep-tech aerospace solutions with 1000+ patents.",
      icon: <ShieldCheck className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=ltts.com&sz=128",
      websiteUrl: "https://www.ltts.com"
    },
    {
      id: 8,
      name: "PepsiCo",
      category: "FMCG Automation",
      description: "Analyzing large-scale automated manufacturing operations. We study their sustainability tech and supply-chain efficiency to inform our own large-scale automation projects.",
      summary: "Global food beverage industry leader implementing state-of-the-art FMCG automation, sustainability practices, and advanced precision supply-chain mechanics.",
      icon: <Database className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=pepsico.com&sz=128",
      websiteUrl: "https://www.pepsico.com"
    },
    {
      id: 9,
      name: "Booble AI",
      category: "Data Analytics & ML",
      description: "Collaborating on AI-powered machine vision. Our software division works on integrating cutting-edge ML models for real-time robotic navigation and data analytics.",
      summary: "Emerging technology company specializing in artificial intelligence-driven solutions, focusing on sophisticated AI-powered automation and operational machine learning.",
      icon: <BrainCircuit className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://www.google.com/s2/favicons?domain=bobble.ai&sz=128",
      websiteUrl: "https://bobble.ai"
    },
    {
      id: 10,
      name: "KwickPic",
      category: "Cloud Media Solutions",
      description: "Developing interactive visual integrations and gaining expertise in cloud computing structures tailored for heavy, dynamic machine-vision data offloading.",
      summary: "AI-driven visual storytelling platform revolutionizing digital media workflows through comprehensive cloud-based photo and secure video management solutions.",
      icon: <Camera className="w-5 h-5 text-[#e8b828]" />,
      logoUrl: "https://logo.clearbit.com/kwikpic.in",
      websiteUrl: "https://kwikpic.in"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 lg:space-y-16"
    >
      {/* Header Section */}
      <section className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Handshake className="w-8 h-8 text-[#e8b828]" />
          <h1 className="font-sans text-[#e5e1e4] text-4xl md:text-5xl font-normal tracking-[-0.65px]">
            Industry Collaborations
          </h1>
        </div>
        <p className="font-sans text-base text-zinc-400 mt-6 leading-relaxed">
          Our major wins aren't just competitive trophies; they form the backbone of our strategic alliances. 
          We work closely with global tech leaders and fast-growing startups to translate conceptual engineering 
          into industry-ready deployment.
        </p>
      </section>

      {/* Grid Layout for Partners */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {partners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={() => setSelectedPartner(partner)}
            className="group relative bg-[#101010] border border-zinc-800 rounded-md hover:border-zinc-700 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer shadow-none"
          >
            
            <div className="relative p-6 flex flex-col flex-grow z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center shrink-0 transition-transform duration-300 overflow-hidden relative shadow-sm border border-zinc-200 p-1.5">
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-zinc-800">{partner.icon}</div>
                    )}
                  </div>
                </div>
                <div 
                  className="p-2 text-zinc-500 hover:text-[#e8b828] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="font-sans text-[#e5e1e4] text-xl font-medium tracking-[-0.65px] mb-2 group-hover:text-[#e8b828] transition-colors">
                  {partner.name}
                </h3>
                <span className="inline-block font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-400 mb-4 bg-[#0c0c0e] border border-zinc-800 px-2 py-1 rounded-sm font-semibold">
                  {partner.category}
                </span>
                
                <p className="font-sans text-sm text-zinc-400 leading-relaxed transition-colors duration-300">
                  {partner.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 border-dashed flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Integration Logs &rarr;</span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
      
      {/* Footer minimal spacer */}
      <div className="h-4"></div>

      {/* Partner Details Modal Popover */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPartner(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
            />
            
            {/* Modal Body Card Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-[#101010] border border-zinc-800 rounded-md overflow-hidden shadow-none z-10 flex flex-col max-h-[90vh]"
            >
              
              {/* Scrollable Container */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-[#e5e1e4] bg-[#0c0c0e] hover:bg-zinc-900 border border-zinc-800 rounded-md transition-colors cursor-pointer z-50"
                  title="Close Terminal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-zinc-800 pb-6">
                  {/* Partner Media Block */}
                  <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden bg-white flex justify-center items-center p-3 border border-zinc-200 shadow-md">
                    <div className="w-full h-full flex items-center justify-center relative z-20">
                      {selectedPartner.logoUrl ? (
                        <img src={selectedPartner.logoUrl} alt={selectedPartner.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="scale-[1.5] text-zinc-800">{selectedPartner.icon}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-grow">
                    <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-[0.1em] font-semibold bg-[#0c0c0e] border border-zinc-800 px-2.5 py-0.5 rounded-sm inline-block">
                      {selectedPartner.category}
                    </span>
                    <h2 className="font-sans text-3xl font-medium tracking-[-0.65px] text-[#e5e1e4]">{selectedPartner.name}</h2>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-4 pt-2">
                  <div className="bg-[#0c0c0e] border border-zinc-800 rounded-md p-5">
                    <span className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 uppercase tracking-[0.1em] font-semibold mb-3 pb-3 border-b border-zinc-800">
                      <Terminal className="w-3.5 h-3.5 text-[#e8b828]" />
                      Company Briefing // COM_{selectedPartner.name.toUpperCase().replace(/\s+/g, '_').substring(0, 8)}
                    </span>
                    <p className="text-zinc-400 text-sm leading-relaxed font-sans mb-6">
                      {selectedPartner.summary}
                    </p>
                    <p className="text-zinc-500 text-sm leading-relaxed font-sans italic border-l border-zinc-800 pl-4">
                      {selectedPartner.description}
                    </p>
                  </div>
                </div>

                {/* Interactive Action */}
                <div className="pt-4">
                  <a 
                    href={selectedPartner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e8b828] text-[#101010] font-semibold px-6 py-2.5 rounded-md hover:bg-yellow-400 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Official System Terminal
                  </a>
                </div>
              </div>

              {/* Secure footer panel */}
              <div className="bg-[#0c0c0e] px-6 py-4 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 uppercase tracking-[0.1em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Connection Secure
                </span>
                <span className="uppercase tracking-[0.1em]">VIT_R_SYSTEMS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


