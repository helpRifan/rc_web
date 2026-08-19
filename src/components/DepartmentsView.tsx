import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hammer, Terminal, BookOpen, PenTool, ClipboardList, Megaphone, ArrowUpRight, X, Users } from "lucide-react";
import { CLUB_MEMBERS } from "../data";

export default function DepartmentsView() {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDeptId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDeptId]);

  const departments = [
    {
      id: "projects",
      name: "Projects",
      icon: <Hammer className="w-8 h-8 text-[#e8b828]" />,
      desc: "The engineering core where physical structures and embedded hardware meet. Responsible for autonomous rovers, robotic arms, and complex electronics integration.",
      tag: "Engineering & R&D"
    },
    {
      id: "webdev",
      name: "Web Dev",
      icon: <Terminal className="w-8 h-8 text-[#e8b828]" />,
      desc: "Architects of our digital infrastructure. This team builds real-time telemetry dashboards, internal management tools, and the club's public-facing digital platforms.",
      tag: "Digital Infrastructure"
    },
    {
      id: "teaching",
      name: "Teaching",
      icon: <BookOpen className="w-8 h-8 text-[#e8b828]" />,
      desc: "Our knowledge pipeline. Instructors who mentor junior cohorts in CAD, board routing, kinematics, and core programming paradigms through structured workshops.",
      tag: "Knowledge Sharing"
    }
  ];

  const subDepartments = [
    {
      id: "media",
      name: "Media and Design",
      icon: <PenTool className="w-6 h-6 text-[#e8b828]" />,
      desc: "Shaping our visual identity. Producing high-quality 3D renders, UI/UX designs, and engaging content that translates our complex engineering into accessible media.",
      span: "lg:col-span-1"
    },
    {
      id: "operations",
      name: "Operations",
      icon: <ClipboardList className="w-6 h-6 text-[#e8b828]" />,
      desc: "The organizational backbone. Ensuring smooth cross-team collaboration, managing inventory, coordinating testing schedules, and running internal club logistics.",
      span: "lg:col-span-1"
    },
    {
      id: "marketing",
      name: "Marketing and Sponsorship",
      icon: <Megaphone className="w-6 h-6 text-[#e8b828]" />,
      desc: "Bridging the lab with the outside world. Securing corporate funding, managing external symposium outreach, and executing high-impact campus campaigns.",
      span: "lg:col-span-1"
    }
  ];

  const allDepts = [...departments, ...subDepartments];
  const activeDept = allDepts.find(d => d.id === selectedDeptId);
  const activeMembers = CLUB_MEMBERS.filter(m => m.departmentId === selectedDeptId);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-xxl pb-xl relative"
      >
        {/* Header and description */}
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#101010] px-3 py-1.5 rounded-sm border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-[#e8b828]"></span>
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-semibold">Core Divisions</span>
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-normal text-[#e5e1e4] tracking-[-0.65px]">Operational Units</h1>
          <p className="font-sans text-base text-zinc-400 leading-relaxed">
            VITC Robotics splits into strategic divisions representing the physical, electronic, 
            and computational aspects of engineering. Explore how our systems collaborate by clicking on a unit to view its members.
          </p>
        </header>

        {/* Main Grid for major depts */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <motion.article 
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              onClick={() => setSelectedDeptId(dept.id)}
              className="group relative bg-[#101010] border border-zinc-800 rounded-md p-8 hover:border-[#e8b828]/50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="p-3 bg-[#0c0c0e] border border-zinc-800 rounded-md w-fit group-hover:bg-[#1a1a1a] transition-colors duration-300">
                  {dept.icon}
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-[0.1em] font-semibold block mb-2">{dept.tag}</span>
                  <h3 className="font-sans text-[#e5e1e4] text-xl font-medium">{dept.name}</h3>
                  <p className="font-sans text-zinc-400 text-sm leading-relaxed">{dept.desc}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-800 border-dashed flex justify-between items-center text-zinc-500 group-hover:text-[#e8b828] transition-colors">
                <span className="font-mono text-[10px] font-semibold tracking-[0.1em] uppercase">View Members</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </motion.article>
          ))}
        </section>

        {/* Grid for supporting depts (Bento style) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-zinc-900 pt-12">
          {subDepartments.map((sdept, idx) => (
            <motion.article
              key={sdept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: (idx + 3) * 0.1 }}
              onClick={() => setSelectedDeptId(sdept.id)}
              className={`group cursor-pointer bg-[#101010] border border-zinc-800 rounded-md p-8 relative overflow-hidden transition-all duration-300 hover:border-[#e8b828]/50 ${sdept.span}`}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                <div className="p-3 bg-[#0c0c0e] border border-zinc-800 rounded-md shrink-0 text-[#e8b828] group-hover:bg-[#1a1a1a] transition-colors duration-300">
                  {sdept.icon}
                </div>
                <div className="space-y-2 flex-grow">
                  <h3 className="font-sans text-[#e5e1e4] text-lg font-medium">{sdept.name}</h3>
                  <p className="font-sans text-zinc-400 text-sm leading-relaxed">{sdept.desc}</p>
                </div>
                <div className="md:ml-auto self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-[#e8b828]" />
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      </motion.div>

      {/* Interactive Member Modal */}
      <AnimatePresence>
        {selectedDeptId && activeDept && (
          <div key="dept-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeptId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto hide-scrollbar bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 md:p-10 z-10 tech-border shadow-2xl"
            >
              {/* Close Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedDeptId(null); }}
                className="absolute top-6 right-6 z-50 p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800 cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-8 mt-4 sm:mt-0">
                <div className="space-y-2 pb-6 border-b border-zinc-800/50 pr-12">
                  <div className="flex items-center gap-3">
                    <span className="text-[#e8b828] bg-zinc-900 p-2 rounded-md border border-zinc-800">{activeDept.icon}</span>
                    <h2 className="font-sans text-3xl md:text-4xl font-normal text-[#e5e1e4] tracking-tight">{activeDept.name} Members</h2>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mt-4">
                    {activeMembers.length} ACTIVE {activeMembers.length === 1 ? 'MEMBER' : 'MEMBERS'} FOUND
                  </p>
                </div>

                {activeMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeMembers.map((member) => (
                      <div key={member.name} className="flex items-center gap-4 p-4 bg-[#101010] hover:bg-[#151515] transition-colors border border-zinc-800 rounded-md">
                        {/* Avatar */}
                        <div className="relative w-16 h-16 rounded bg-[#0c0c0e] border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="absolute inset-0 w-full h-full object-cover brightness-110 saturate-150" />
                          ) : (
                            <span className="text-lg font-medium text-[#e8b828] font-mono">{getInitials(member.name)}</span>
                          )}
                        </div>
                        {/* Details */}
                        <div className="space-y-1">
                          <h4 className="font-sans text-[#e5e1e4] text-base font-medium leading-tight">{member.name}</h4>
                          <p className="font-mono text-[9px] text-[#e8b828] uppercase tracking-wider">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 border border-zinc-800/50 border-dashed rounded-lg bg-[#101010]/30">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <Users className="w-5 h-5 text-[#e8b828]" />
                    </div>
                    <div>
                      <h4 className="font-sans text-zinc-300 font-medium tracking-tight">Recruiting Open</h4>
                      <p className="font-sans text-sm text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">We are currently looking for talented individuals to lead operations in this division.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
