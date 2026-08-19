import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Cpu, Info, Users, Library, Award, Settings, Menu, X, 
  Terminal, ShieldCheck, Layers, Trophy, Mail, Instagram, Linkedin, Check,
  LogOut, ShieldAlert, UserCheck
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { ClubTab } from "./types";
import { supabase, signInWithGoogle, signOut, isAuthorizedStudentEmail } from "./lib/supabase";

// Modular View Imports
import HomeView from "./components/HomeView";
import ActivitiesView from "./components/ActivitiesView";
import LoadingScreen from "./components/LoadingScreen";

// Lazy Loaded Views (Optimization)
const AboutView = React.lazy(() => import("./components/AboutView"));
const DepartmentsView = React.lazy(() => import("./components/DepartmentsView"));
const MembersView = React.lazy(() => import("./components/MembersView"));
const CertificatesView = React.lazy(() => import("./components/CertificatesView"));
const AdminView = React.lazy(() => import("./components/AdminView"));
const AchievementsView = React.lazy(() => import("./components/AchievementsView"));

// Google Brand Icon Component
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ClubTab>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emailCopied, setEmailCopied] = useState(false);

  // Authentication states
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Listen to Supabase Auth state and enforce @vitstudent.ac.in domain
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          setAuthUser(session.user);
          setAuthError(null);
        } else {
          // Reject and immediately sign out non-vitstudent emails
          const rejectedEmail = session.user.email || "Unknown email";
          signOut().then(() => {
            setAuthUser(null);
            setAuthError(`Access Denied: ${rejectedEmail} is not authorized. Only @vitstudent.ac.in accounts are permitted.`);
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          setAuthUser(session.user);
          setAuthError(null);
        } else {
          const rejectedEmail = session.user.email || "Unknown email";
          await signOut();
          setAuthUser(null);
          setAuthError(`Access Denied: ${rejectedEmail} is not authorized. Only @vitstudent.ac.in accounts are permitted.`);
        }
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to initialize Google login.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthUser(null);
      localStorage.removeItem("vit_robotics_club_admin_session");
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("robotics.club@vit.ac.in");
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const navigationItems = [
    { id: "home", label: "Home", icon: <Cpu className="w-4 h-4" /> },
    { id: "about", label: "About Us", icon: <Info className="w-4 h-4" /> },
    { id: "achievements", label: "Partners & Wins", icon: <Trophy className="w-4 h-4" /> },
    { id: "departments", label: "Divisions", icon: <Layers className="w-4 h-4" /> },
    { id: "members", label: "Core Members", icon: <Users className="w-4 h-4" /> },
    { id: "activities", label: "Events", icon: <Library className="w-4 h-4" /> },
    { id: "certificates", label: "Certificate Portal", icon: <Award className="w-4 h-4" /> },
    { id: "admin", label: "Admin Control", icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavigate = (tab: ClubTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const studentName = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Student";
  const studentAvatar = authUser?.user_metadata?.avatar_url;

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Auth Error Banner */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 inset-x-0 z-50 bg-red-950/95 border-b border-red-500/50 backdrop-blur-md px-4 py-3 text-red-200 text-xs flex items-center justify-between shadow-2xl"
          >
            <div className="max-w-container-max mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span className="font-mono">{authError}</span>
              </div>
              <button 
                onClick={() => setAuthError(null)}
                className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen flex flex-col bg-[#0c0c0e] text-[#e5e1e4] relative industrial-grid overflow-x-hidden ${isLoading ? 'pointer-events-none opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}>
        
      {/* Main Elegant Header - Voltagent Style */}
      <header className="sticky top-0 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800 z-20">
        <div className="w-full max-w-container-max mx-auto px-gutter py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo Brand / Icon */}
          <div 
            onClick={() => handleNavigate("home")} 
            className="flex items-center gap-3.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Robotics Club Logo" className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex flex-col border-l-2 border-[#e8b828] pl-3.5 py-0.5">
              <span className="font-sans font-black text-white text-base md:text-lg tracking-[0.2em] uppercase leading-tight group-hover:text-[#e8b828] transition-colors">
                ROBOTICS
              </span>
              <span className="font-sans font-bold text-zinc-400 text-xs md:text-sm tracking-[0.4em] uppercase leading-tight">
                CLUB
              </span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-[0.1em] uppercase mt-0.5">
                VIT Chennai
              </span>
            </div>
          </div>

          {/* Desktop Navigation Row */}
          <nav className="hidden xl:flex items-center gap-5">
            {navigationItems.filter((item) => item.id !== "admin").map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as ClubTab)}
                className={`flex items-center gap-1.5 py-1.5 font-sans text-xs md:text-sm transition-all duration-300 relative border-b-2 ${
                  activeTab === item.id 
                    ? 'text-white border-[#e8b828] font-semibold'
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Header Action: Google Login / User Profile Badge */}
          <div className="hidden lg:flex items-center gap-3">
            {authUser ? (
              <div className="flex items-center gap-3 bg-[#121214] border border-zinc-800 rounded-lg p-1.5 pr-3">
                {studentAvatar ? (
                  <img src={studentAvatar} alt={studentName} className="w-8 h-8 rounded-md object-cover border border-zinc-700" />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-[#e8b828]/15 border border-[#e8b828]/30 flex items-center justify-center text-[#e8b828] font-mono text-xs font-bold">
                    {studentName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-sans font-semibold text-white leading-tight max-w-[130px] truncate">
                    {studentName}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    @vitstudent
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-1 p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 rounded transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-[#121214] hover:bg-zinc-900 border border-zinc-800 hover:border-[#e8b828]/50 rounded-lg text-xs font-sans font-semibold text-zinc-200 hover:text-white transition-all shadow-sm group cursor-pointer"
                title="Sign in with your @vitstudent.ac.in Google account"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Student Login</span>
                <span className="text-[9px] font-mono text-[#e8b828] bg-[#e8b828]/10 px-1.5 py-0.5 rounded border border-[#e8b828]/25 group-hover:bg-[#e8b828] group-hover:text-black transition-colors">
                  @vitstudent
                </span>
              </button>
            )}
          </div>

          {/* Mobile Menu Action trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800 bg-[#101010] rounded transition-all focus:outline-none"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-b border-zinc-800 bg-[#101010] overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {/* Mobile Google Auth block */}
              <div className="pb-3 border-b border-zinc-800 mb-1">
                {authUser ? (
                  <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      {studentAvatar ? (
                        <img src={studentAvatar} alt={studentName} className="w-9 h-9 rounded-md object-cover border border-zinc-700" />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-[#e8b828]/15 border border-[#e8b828]/30 flex items-center justify-center text-[#e8b828] font-mono text-xs font-bold">
                          {studentName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-sans font-semibold text-white">{studentName}</span>
                        <span className="text-[10px] font-mono text-emerald-400">@vitstudent.ac.in Verified</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded text-xs font-mono flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-sans font-semibold text-white transition-all"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Sign in with Google (@vitstudent.ac.in)</span>
                  </button>
                )}
              </div>

              {navigationItems.filter((item) => item.id !== "admin").map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as ClubTab)}
                  className={`flex items-center gap-3 p-3 rounded font-sans text-sm text-left transition-colors border border-transparent ${
                    activeTab === item.id 
                      ? 'text-white bg-zinc-800/50 border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30 hover:border-zinc-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => handleNavigate("admin")}
                className="flex items-center gap-3 p-3 rounded font-sans text-sm text-left text-[#e8b828] bg-[#e8b828]/10 border border-[#e8b828]/25 hover:bg-[#e8b828]/20 transition-colors mt-2"
              >
                <Settings className="w-4 h-4 text-[#e8b828]" />
                <span>Admin Control Panel</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Router Content Container and animations */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <React.Suspense fallback={
              <div className="w-full flex justify-center py-24">
                <div className="w-8 h-8 border-2 border-[#e8b828]/30 border-t-[#e8b828] rounded-full animate-spin"></div>
              </div>
            }>
              {activeTab === "home" && <HomeView onNavigate={(tab) => handleNavigate(tab as ClubTab)} />}
              {activeTab === "about" && <AboutView />}
              {activeTab === "achievements" && <AchievementsView />}
              {activeTab === "departments" && <DepartmentsView />}
              {activeTab === "members" && <MembersView />}
              {activeTab === "activities" && <ActivitiesView />}
              {activeTab === "certificates" && <CertificatesView />}
              {activeTab === "admin" && <AdminView />}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Elegant structural footer */}
      <footer className="border-t border-zinc-800 bg-[#0c0c0e] py-16 md:py-24 relative z-10">
        <div className="w-full max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-zinc-800 pb-12 mb-8">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Robotics Club Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
              </div>
              <div className="flex flex-col border-l border-zinc-800 pl-3 py-0.5">
                <span className="font-sans font-black text-white text-base tracking-[0.2em] uppercase leading-tight group-hover:text-[#e8b828] transition-colors">
                  ROBOTICS
                </span>
                <span className="font-sans font-bold text-zinc-500 text-xs tracking-[0.4em] uppercase leading-tight">
                  CLUB
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-sm">
              Precision mechanical rigs, cybernetics systems, &amp; machine layouts. 
              Pioneering the next generation of autonomous engineering in real-world scenarios.
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-[#e8b828] uppercase font-semibold tracking-[0.2em]">
              <span className="hover:text-white transition-colors cursor-default">VIT Chennai</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
              <span className="hover:text-white transition-colors cursor-default">SWC</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-4 space-y-6">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">Terminal Links</span>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              {[
                { id: "home", label: "Homepage" },
                { id: "activities", label: "Events" },
                { id: "departments", label: "Divisions" },
                { id: "achievements", label: "Collaborations" },
                { id: "members", label: "Team Page" },
                { id: "about", label: "Genesis" }
              ].map(link => (
                <a 
                  key={link.id}
                  href={`#${link.id}`} 
                  onClick={(e) => { e.preventDefault(); handleNavigate(link.id as ClubTab); }} 
                  className="font-mono text-xs text-zinc-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group w-fit py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-[#e8b828] transition-colors"></span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Connect Column */}
          <div className="md:col-span-3 space-y-6">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">Connect</span>
            <div className="flex flex-col gap-4">
              <button onClick={handleCopyEmail} className="font-mono text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-3 group w-fit cursor-pointer">
                <div className={`w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors ${emailCopied ? "border-[#e8b828]" : "group-hover:border-zinc-700"}`}>
                  {emailCopied ? (
                    <Check className="w-3 h-3 text-[#e8b828]" />
                  ) : (
                    <Mail className="w-3 h-3 group-hover:text-[#e8b828] transition-colors" />
                  )}
                </div>
                {emailCopied ? "Copied to clipboard!" : "robotics.club@vit.ac.in"}
              </button>
              <a href="https://www.instagram.com/robotics_club_vitc/" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-3 group w-fit">
                <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                  <Instagram className="w-3 h-3 group-hover:text-[#e8b828] transition-colors" />
                </div>
                Instagram
              </a>
              <a href="https://in.linkedin.com/company/robotics-club-vitc" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-3 group w-fit">
                <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                  <Linkedin className="w-3 h-3 group-hover:text-[#e8b828] transition-colors" />
                </div>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="w-full max-w-container-max mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] text-center md:text-left">
            &copy; {new Date().getFullYear()} VIT Chennai Robotics. All Rights Reserved.
          </div>
          <button 
            onClick={() => handleNavigate("admin")} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#101010] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </button>
        </div>
      </footer>

    </div>
    </>
  );
}
