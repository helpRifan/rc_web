import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Link as LinkIcon, Plus, CheckCircle, ArrowRight, 
  Linkedin, Cpu, Layers, Hammer, BrainCircuit, Code, 
  GraduationCap, Instagram, X, User, Sparkles, Send, Check,
  Crown, ShieldCheck, Briefcase, Megaphone, PenTool, ClipboardList
} from "lucide-react";
import { BOARD_MEMBERS, CORE_MEMBERS, CLUB_MEMBERS } from "../data";
import { Member } from "../types";

// Faculty coordinator image reference
const FACULTY_COORDINATOR_IMAGE = "/arockia.jpg";

const getInitials = (name: string) => {
  const cleanName = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+/i, "");
  const parts = cleanName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase();
};

// Department configuration for organized grouping
const DEPARTMENT_GROUPS = [
  {
    id: "Projects",
    name: "Projects & Robotics",
    tag: "Engineering & Hardware",
    icon: <Hammer className="w-4 h-4 text-[#e8b828]" />,
    desc: "Autonomous rovers, robotic arms, mechanical kinematics, and embedded PCB hardware stacks."
  },
  {
    id: "Web Dev",
    name: "Technical & Software",
    tag: "Digital & Telemetry",
    icon: <Code className="w-4 h-4 text-[#e8b828]" />,
    desc: "Cloud infrastructure, telemetry streaming, software architecture, and club digital platforms."
  },
  {
    id: "Teaching",
    name: "Teaching & Mentorship",
    tag: "Education & Pedagogy",
    icon: <GraduationCap className="w-4 h-4 text-[#e8b828]" />,
    desc: "Workshops, junior cohort mentorship, technical bootcamps, and open curriculum development."
  },
  {
    id: "Media and Design",
    name: "Design & Creative",
    tag: "Visual & 3D Media",
    icon: <Sparkles className="w-4 h-4 text-[#e8b828]" />,
    desc: "Visual branding, 3D CAD renders, promotional media, symposium teasers, and UI/UX design."
  },
  {
    id: "Operations",
    name: "Management & Operations",
    tag: "Sprint & Resource Coordination",
    icon: <Layers className="w-4 h-4 text-[#e8b828]" />,
    desc: "Logistics pipelines, cross-team sprint sync, event operations, and lab inventory management."
  },
  {
    id: "Marketing and Sponsorship",
    name: "Outreach & Publicity",
    tag: "Partnerships & Media",
    icon: <Send className="w-4 h-4 text-[#e8b828]" />,
    desc: "Corporate sponsorships, inter-university alliances, public relations, and campus campaigns."
  }
];

// Map custom projects and focus structures based on member departments
const getMemberDetails = (member: Member) => {
  const dept = member.department || "Core Leadership";
  
  if (dept.includes("Projects")) {
    return {
      subheading: "R&D and Engineering Core",
      experience: "2+ Years in Hardware & Systems",
      tools: ["Fusion 360", "Altium PCB", "ROS2", "Ansys FEA", "STM32 CubeMX"],
      projects: [
        "6-DOF Robotic Kinematics Manipulator Chassis",
        "Autonomous Navigation Algorithms",
        "Torsional Load Distribution Rigs"
      ]
    };
  } else if (dept.includes("Teaching")) {
    return {
      subheading: "Knowledge & Mentorship",
      experience: "Advanced Subject Matter Experts",
      tools: ["Curriculum Design", "Technical Pedagogy", "Workshop Orchestration", "Hands-on Debugging", "Hardware Fundamentals"],
      projects: [
        "Freshman Robotics Bootcamp",
        "Advanced CAD & PCB Seminars",
        "Open-Source Embedded Systems Guides"
      ]
    };
  } else if (dept.includes("Web Dev")) {
    return {
      subheading: "Digital Infrastructure",
      experience: "Full-Stack Development",
      tools: ["React/TypeScript", "Node.js", "PostgreSQL", "Telemetry APIs", "Docker/AWS"],
      projects: [
        "Real-Time Telemetry Dashboard",
        "Club Roster & Events Portal",
        "Internal Logistics API"
      ]
    };
  } else if (dept.includes("Media")) {
    return {
      subheading: "Visual Brand & Identity",
      experience: "UI/UX & 3D Visualization",
      tools: ["Blender 3D", "Figma", "Adobe Premiere", "After Effects", "Photoshop"],
      projects: [
        "Symposium Teaser Trailers",
        "Dashboard UI Architecture",
        "RoboClash Promotional Campaigns"
      ]
    };
  } else if (dept.includes("Operations")) {
    return {
      subheading: "Logistics & Internal Affairs",
      experience: "Event & Supply Chain Management",
      tools: ["Inventory Trackers", "Agile Sprints", "Notion Workspaces", "Event Planning", "Vendor Procurement"],
      projects: [
        "National Level Symposia Management",
        "R&D Lab Equipment Procurement",
        "Cross-team Sprint Synchronization"
      ]
    };
  } else {
    // Marketing and Sponsorship
    return {
      subheading: "Outreach & Growth",
      experience: "Corporate Relations",
      tools: ["CRM Databases", "Pitch Decks", "Campaign Strategy", "Financial Ledgers", "Public Relations"],
      projects: [
        "Corporate Sponsorship Seed Funding Drives",
        "External Industrial Incubation Sponsorships",
        "Campus Engagement Campaigns"
      ]
    };
  }
};

export default function MembersView() {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cohortFormOpen, setCohortFormOpen] = useState(false);
  const [cohortEmail, setCohortEmail] = useState("");
  const [cohortEmailSubmitted, setCohortEmailSubmitted] = useState(false);

  const handleCohortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cohortEmail.trim()) {
      try {
        await fetch("/api/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            formType: "recruitment", 
            fullName: cohortEmail.split("@")[0], // Fallback name
            email: cohortEmail 
          }),
        });
      } catch (err) {
        console.error("Failed to submit cohort form:", err);
      }
      setCohortEmailSubmitted(true);
      setTimeout(() => {
        setCohortEmail("");
        setCohortEmailSubmitted(false);
        setCohortFormOpen(false);
      }, 2500);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-16 pb-xl"
      >
        {/* Header and title */}
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#101010] border border-zinc-800 px-3 py-1.5 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-[#e8b828]"></span>
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-semibold">Organizational Hierarchy</span>
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-normal text-[#e5e1e4] tracking-[-0.65px]">Club Leadership</h1>
          <p className="font-sans text-base text-zinc-400 leading-relaxed">
            Structured leadership driving innovation across mechanical engineering, embedded hardware, software systems, and campus outreach at VIT Chennai Robotics Club.
          </p>
        </header>

        {/* ========================================================================= */}
        {/* TIER 1: FACULTY COORDINATOR (TOP OF HIERARCHY) */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#e8b828] bg-[#e8b828]/10 border border-[#e8b828]/30 px-2.5 py-0.5 rounded-sm uppercase tracking-[0.15em] font-semibold">
              Level 01
            </span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-[0.15em] font-medium">Faculty Leadership</span>
            <span className="h-[1px] flex-grow bg-zinc-800/80"></span>
          </div>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-md border border-zinc-800 bg-[#101010] p-6 md:p-10 hover:border-zinc-700 transition-colors duration-300 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Column A: Faculty Coordinator Bio Card */}
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4 lg:border-r lg:border-zinc-800 lg:pr-8">
                <div className="relative">
                  <div className="relative w-36 h-36 rounded-md overflow-hidden border border-zinc-800 bg-[#0c0c0e] flex items-center justify-center group shadow-md">
                    <img src="/fc.jpg" alt="Dr. Arockia Selvakumar A." className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-sans text-xl font-medium text-[#e5e1e4] tracking-[-0.65px] leading-tight">
                    Dr. Arockia Selvakumar A.
                  </h2>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#e8b828] bg-[#e8b828]/10 border border-[#e8b828]/30 px-3 py-1 rounded-sm uppercase tracking-[0.1em] font-semibold">
                    Faculty Coordinator
                  </span>
                  <p className="font-mono text-[9px] text-zinc-500 tracking-[0.2em] mt-1 font-semibold">
                    VIT CHENNAI ROBOTICS CLUB
                  </p>
                </div>
              </div>

              {/* Column B: Statement Text & Actions */}
              <div className="lg:col-span-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-zinc-800"></span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">Coordinator Address</span>
                    <span className="h-[1px] flex-grow bg-zinc-800"></span>
                  </div>

                  <blockquote className="font-sans text-sm sm:text-base text-zinc-400 leading-relaxed italic relative pl-4 border-l border-zinc-800">
                    "As the faculty coordinator of the Robotics Club, it is my privilege to introduce our dynamic and vibrant community. Our club is a hub of creativity, innovation, and collaborative learning. We provide a platform for students to explore their passion for robotics, expand their technical skills, and cultivate a problem-solving mindset. Through engaging workshops, exciting projects, and competitive events, we empower our members to excel."
                  </blockquote>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-end gap-4 border-t border-zinc-800 border-dashed">
                  <motion.a 
                    href="https://chennai.vit.ac.in/member/dr-arockia-selvakumar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 font-sans text-sm text-[#101010] bg-[#e8b828] hover:bg-yellow-400 px-6 py-2.5 rounded-md font-semibold transition-colors"
                  >
                    <span>Know More</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Hierarchy Connector Stem */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-[2px] h-8 bg-gradient-to-b from-zinc-700 to-[#e8b828]/60"></div>
            <div className="w-3 h-3 rounded-full bg-[#101010] border-2 border-[#e8b828] -mt-1 shadow-[0_0_8px_rgba(232,184,40,0.4)]"></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TIER 2: THE EXECUTIVE BOARD */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#e8b828] bg-[#e8b828]/10 border border-[#e8b828]/30 px-2.5 py-0.5 rounded-sm uppercase tracking-[0.15em] font-semibold">
              Level 02
            </span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-[0.15em] font-medium">The Executive Board</span>
            <span className="h-[1px] flex-grow bg-zinc-800/80"></span>
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-3xl font-normal text-[#e5e1e4] tracking-[-0.65px]">The Board</h2>
            <p className="font-sans text-sm text-zinc-400 max-w-2xl">
              Steering strategic governance, institutional liaison, and multi-disciplinary operational roadmaps for the tenure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BOARD_MEMBERS.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedMember(member)}
                className="group relative bg-[#101010] border border-zinc-800 hover:border-[#e8b828]/60 rounded-md p-8 flex flex-col items-center text-center overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg"
              >
                {/* Board Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#e8b828]/10 border border-[#e8b828]/30 px-2 py-0.5 rounded text-[9px] font-mono text-[#e8b828] uppercase font-bold">
                  <Crown className="w-3 h-3" />
                  <span>Board</span>
                </div>

                {/* Profile Avatar Frame */}
                <div className="relative w-28 h-28 rounded-md overflow-hidden mb-6 border border-zinc-800 group-hover:border-[#e8b828]/50 transition-colors bg-[#0c0c0e] flex items-center justify-center">
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#e8b828] font-mono select-none px-4 text-center">
                    <span className="text-2xl font-medium tracking-[-0.65px]">{getInitials(member.name)}</span>
                  </div>
                </div>

                {/* Member Details */}
                <div className="space-y-2 flex-grow flex flex-col justify-between w-full">
                  <div className="space-y-2">
                    <h3 className="font-sans text-[#e5e1e4] text-xl font-medium tracking-[-0.65px] group-hover:text-[#e8b828] transition-colors">
                      {member.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#e8b828] bg-[#0c0c0e] border border-zinc-800 px-3 py-1 rounded-sm uppercase tracking-[0.1em] font-semibold">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed mt-4 line-clamp-3">
                    {member.bio}
                  </p>
                </div>

                {/* Quick click details hint */}
                <div className="mt-6 pt-3 border-t border-zinc-900 w-full font-mono text-[9px] text-zinc-500 uppercase tracking-[0.1em] group-hover:text-[#e8b828] transition-colors flex items-center justify-center gap-1">
                  <span>Executive Profile</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Hierarchy Connector Stem */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-[2px] h-8 bg-gradient-to-b from-zinc-700 to-[#e8b828]/60"></div>
            <div className="w-3 h-3 rounded-full bg-[#101010] border-2 border-[#e8b828] -mt-1 shadow-[0_0_8px_rgba(232,184,40,0.4)]"></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TIER 3: CORE MEMBERS CATEGORIZED BY DEPARTMENT */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#e8b828] bg-[#e8b828]/10 border border-[#e8b828]/30 px-2.5 py-0.5 rounded-sm uppercase tracking-[0.15em] font-semibold">
                  Level 03
                </span>
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-[0.15em] font-medium">Departmental Leadership</span>
                <span className="h-[1px] w-12 bg-zinc-800/80"></span>
              </div>
              <h2 className="font-sans text-3xl font-normal text-[#e5e1e4] tracking-[-0.65px]">Core Team by Department</h2>
              <p className="font-sans text-sm text-zinc-400 max-w-xl">
                Specialized heads and leads driving engineering research, software stacks, design aesthetics, sprint operations, and external outreach.
              </p>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap gap-2 bg-[#0c0c0e] p-1.5 rounded-md border border-zinc-800 max-w-full">
              {[
                { id: "All", name: "All Divisions", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "Projects", name: "Projects", icon: <Hammer className="w-3.5 h-3.5" /> },
                { id: "Web Dev", name: "Technical", icon: <Code className="w-3.5 h-3.5" /> },
                { id: "Teaching", name: "Teaching", icon: <GraduationCap className="w-3.5 h-3.5" /> },
                { id: "Media and Design", name: "Design", icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: "Operations", name: "Management", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "Marketing and Sponsorship", name: "Outreach", icon: <Send className="w-3.5 h-3.5" /> },
              ].map((tab) => {
                const isActive = selectedDept === tab.id;
                const count = tab.id === "All" 
                  ? CORE_MEMBERS.length 
                  : CORE_MEMBERS.filter(m => m.department === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedDept(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-sm font-sans text-sm transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? "text-[#e5e1e4] font-medium bg-[#101010] border border-zinc-800" 
                        : "text-zinc-500 hover:text-[#e5e1e4]"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                    <span className="text-[10px] font-mono opacity-80 bg-[#0c0c0e] px-1.5 py-0.5 rounded-sm border border-zinc-800">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department-Wise Grouped Display */}
          <div className="space-y-12">
            {DEPARTMENT_GROUPS
              .filter(group => selectedDept === "All" || selectedDept === group.id)
              .map((group) => {
                const groupMembers = CORE_MEMBERS.filter(m => m.department === group.id);
                if (groupMembers.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-6">
                    {/* Department Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#101010] border border-zinc-800 rounded-md">
                          {group.icon}
                        </div>
                        <div>
                          <h3 className="font-sans text-xl font-medium text-[#e5e1e4] tracking-[-0.5px]">
                            {group.name}
                          </h3>
                          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            {group.tag} &middot; {groupMembers.length} {groupMembers.length === 1 ? "Member" : "Members"}
                          </p>
                        </div>
                      </div>
                      <p className="font-sans text-xs text-zinc-400 max-w-md hidden md:block text-right">
                        {group.desc}
                      </p>
                    </div>

                    {/* Member Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupMembers.map((member, idx) => (
                        <motion.div
                          key={member.name}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.06 }}
                          onClick={() => setSelectedMember(member)}
                          className="group relative bg-[#101010] border border-zinc-800 hover:border-zinc-700 rounded-md p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer min-h-[280px]"
                        >
                          <div className="space-y-4">
                            {/* Top Avatar & Role Info */}
                            <div className="flex items-center gap-4">
                              <div className="relative shrink-0">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-800 bg-[#0c0c0e] flex items-center justify-center">
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[#e8b828] font-mono select-none px-1 text-center">
                                    <span className="text-base font-medium tracking-[-0.65px]">{getInitials(member.name)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 min-w-0 flex-grow">
                                <h4 className="font-sans text-[#e5e1e4] text-base font-medium tracking-[-0.65px] truncate group-hover:text-[#e8b828] transition-colors">
                                  {member.name}
                                </h4>
                                <p className="font-mono text-[10px] text-[#e8b828] uppercase tracking-[0.1em] font-semibold">
                                  {member.role}
                                </p>
                                <div className="inline-block font-mono text-[9px] bg-[#0c0c0e] border border-zinc-800 px-2 py-0.5 rounded-sm text-zinc-400 truncate max-w-full">
                                  {member.subsystem || "Core Member"}
                                </div>
                              </div>
                            </div>

                            {/* Bio */}
                            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3 italic border-l border-zinc-800 pl-3">
                              "{member.bio}"
                            </p>
                          </div>

                          {/* Card Footer */}
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-dashed border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.1em]">
                            <span className="text-zinc-500">
                              {member.department}
                            </span>
                            <span className="text-[#e8b828] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <span>Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

            {/* Dynamic CTA Card - "Join the Core" */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              onClick={() => setCohortFormOpen(true)}
              className="group border border-zinc-800 border-dashed bg-[#101010] rounded-md p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 hover:border-zinc-700 hover:bg-[#151515] transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="w-14 h-14 rounded-md bg-[#0c0c0e] flex items-center justify-center text-zinc-500 group-hover:text-[#e8b828] transition-colors duration-300 border border-zinc-800 shrink-0">
                  <Plus className="w-6 h-6" />
                </div>

                <div className="space-y-1 max-w-xl">
                  <h3 className="font-sans text-[#e5e1e4] text-lg font-medium tracking-[-0.65px]">Join the Core Leadership</h3>
                  <p className="font-sans text-zinc-400 text-sm leading-relaxed">
                    We are constantly seeking exceptional student brains to lead customized mechanical, software, and operational pipelines.
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setCohortFormOpen(true); }}
                className="font-mono text-xs text-[#101010] bg-[#e8b828] hover:bg-yellow-400 font-semibold px-5 py-2.5 rounded-md transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
              >
                Apply for Cohort &rarr;
              </button>
            </motion.div>
          </div>
        </section>
      </motion.div>

      {/* MEMBER DETAILS MODAL POPUP */}
      <AnimatePresence>
        {selectedMember && (() => {
          const mDetails = getMemberDetails(selectedMember);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMember(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-xl bg-[#101010] border border-zinc-800 rounded-md overflow-hidden z-10 flex flex-col max-h-[85vh] text-left shadow-none"
              >
                {/* Header profile banner */}
                <div className="p-6 md:p-8 bg-[#0c0c0e] border-b border-zinc-800 flex items-start gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden border border-zinc-800 bg-[#101010] shrink-0 flex items-center justify-center">
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#e8b828] font-mono select-none px-2 text-center">
                      <span className="text-xl font-medium tracking-[-0.65px]">{getInitials(selectedMember.name)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 min-w-0 flex-grow">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-zinc-400 bg-[#101010] border border-zinc-800 px-2.5 py-0.5 rounded-sm uppercase tracking-[0.1em] font-semibold">
                      {selectedMember.department || "CONGRESS EXECUTIVE"}
                    </span>
                    <h3 className="font-sans text-[#e5e1e4] text-xl md:text-2xl font-normal tracking-[-0.65px] truncate">
                      {selectedMember.name}
                    </h3>
                    <p className="font-mono text-xs text-zinc-500 capitalize">
                      {selectedMember.role} &middot; <span className="font-normal">{selectedMember.subsystem || "Core Leader"}</span>
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="p-1.5 rounded-md hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#e5e1e4] transition-all shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal detailed information content body */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
                  {/* Bio block */}
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.1em] font-semibold block">PERSONAL BIO STATEMENT</span>
                    <p className="text-zinc-400 font-sans leading-relaxed text-sm">
                      "{selectedMember.bio} Focused on engineering scalable systems and mentoring future robotics cohorts within VITC."
                    </p>
                  </div>

                  {/* Grid of Key projects and dependencies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Projects Column */}
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.1em] font-semibold block">ACTIVE DIRECT FOCUS</span>
                      <ul className="space-y-2.5 text-xs text-zinc-400">
                        {mDetails.projects.map((project, index) => (
                          <li key={index} className="flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0 mt-1.5"></span>
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tools/Technologies Column */}
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.1em] font-semibold block">TECHNICAL SKILLSET</span>
                      <div className="flex flex-wrap gap-1.5 font-mono">
                        {mDetails.tools.map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 rounded-sm bg-[#101010] border border-zinc-800 text-zinc-400 text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connect details */}
                  <div className="pt-4 border-t border-zinc-900/80 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">OFFICIAL NETWORKS:</span>
                    <div className="flex gap-3">
                      <a 
                        href={`mailto:${selectedMember.email}`}
                        className="p-2 sm:px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-[#e8b828] transition-colors rounded-lg flex items-center gap-2 font-mono text-xs"
                        title="Shoot Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mail</span>
                      </a>
                      <a 
                        href={`https://${selectedMember.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-[#e8b828] transition-colors rounded-lg flex items-center gap-2 font-mono text-xs"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">GitHub</span>
                      </a>
                      {(selectedMember.linkedin || (selectedMember as any).instagram) && (
                        <a 
                          href={`https://${selectedMember.linkedin || (selectedMember as any).instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 sm:px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-[#e8b828] transition-colors rounded-lg flex items-center gap-2 font-mono text-xs"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Minimalist actions footer */}
                <div className="bg-[#0c0c0e] px-6 py-4 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1.5 uppercase tracking-[0.1em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8b828]"></span>
                    Verified Member Directory Entry
                  </span>
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="font-sans text-xs font-semibold text-zinc-400 hover:text-[#e5e1e4] transition-colors"
                  >
                    Close Dialog
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* COHORT APPLICATION SUBSCRIPTION FORM ALERT */}
      <AnimatePresence>
        {cohortFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCohortFormOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md bg-[#101010] border border-zinc-800 rounded-md overflow-hidden z-10 p-6 md:p-8 text-left shadow-none"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="p-2 border border-zinc-800 text-zinc-500 rounded-md">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-sans text-[#e5e1e4] text-lg font-medium tracking-[-0.65px]">Cohort Intake Update</h3>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.1em] font-semibold mt-1">RECRUITMENT AUTONOMY PROTOCOL</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCohortFormOpen(false)}
                  className="p-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:text-[#e5e1e4] hover:bg-zinc-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-sans text-xs sm:text-sm text-zinc-350 leading-relaxed">
                  Thank you for your interest in joining the VITC Robotics core executive team! The regular autumn intake sprint has successfully closed.
                </p>
                <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Please subscribe with your student or registered academic email below, and our automated registry will alert you instantly as soon as the next recruiting loop commences!
                </p>

                {cohortEmailSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-xs"
                  >
                    <Check className="w-5 h-5 shrink-0" />
                    <span>Handshake accepted! You have been queued for active batch recruitment updates.</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleCohortSubmit} className="space-y-3 pt-2">
                    <div className="relative">
                      <input 
                        type="email" 
                        required
                        value={cohortEmail}
                        onChange={(e) => setCohortEmail(e.target.value)}
                        placeholder="yourname2024@vitstudent.ac.in" 
                        className="w-full bg-[#0c0c0e] border border-zinc-800 hover:border-zinc-700 focus:border-[#e8b828] rounded-md px-4 py-3 text-zinc-300 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-[#e8b828] text-[#101010] font-sans font-semibold tracking-wide text-sm px-5 py-3 rounded-md hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Alert Me on Next Intake Loop</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
