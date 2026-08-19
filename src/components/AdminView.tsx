import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Layers, Calendar, Plus, ToggleLeft, ToggleRight, 
  Terminal as TermIcon, ShieldAlert, CheckCircle, RefreshCcw,
  Sparkles, Send, Eye, ShieldCheck, Database,
  Lock, EyeOff, Fingerprint, LogOut, KeyRound, Mail
} from "lucide-react";
import { CLUB_MEMBERS, DIVISIONAL_MEMBERS, UPCOMING_EVENTS } from "../data";
import { Member, ActivityLog } from "../types";
import { supabase, signInWithGoogle, signOut, isAuthorizedStudentEmail, isClubAdmin } from "../lib/supabase";

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

export default function AdminView() {
  // Session Authentication states
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem("vit_robotics_club_admin_session");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");

  // Settings toggle states
  const [labAccess, setLabAccess] = useState(true);
  const [equipmentCheckout, setEquipmentCheckout] = useState(true);
  const [serverMaintenance, setServerMaintenance] = useState(false);
  
  // Real-time table states
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  
  // AI assistant states
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([
    { id: "1", role: "model", text: "Cognitive Cybernetic Brain ONLINE. Systems operational. High Reasoning mode is fully activated. Submit problem constraints for mechanical, software, or kinetic optimization." }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New simulation entry form dialog
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newRoll, setNewRoll] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Member");
  const [newDept, setNewDept] = useState("Electronics");

  // Request Access states
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"idle" | "success" | "error">("idle");
  const [requestMessage, setRequestMessage] = useState("");

  // Check active Supabase Google session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          const allMembers = [...CLUB_MEMBERS, ...DIVISIONAL_MEMBERS];
          const matched = allMembers.find(
            (m) => m.email.toLowerCase() === session.user.email?.toLowerCase()
          );
          if (matched) {
            setCurrentUser(matched);
          } else {
            const hasAdminRole = isClubAdmin(session.user.email);
            const studentProfile: Member = {
              name: session.user.user_metadata?.full_name || session.user.email.split("@")[0] || "VIT Student",
              role: hasAdminRole ? "Lead Administrator" : "Student Member",
              email: session.user.email,
              github: "github.com/vitstudent",
              image: session.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300",
              bio: hasAdminRole ? "Authorized Core Administrator." : "Authenticated VIT Chennai Student Member.",
              department: "Web Dev",
              departmentId: "webdev"
            };
            setCurrentUser(studentProfile);
          }
        }
      }
    });
  }, []);

  // Fetch admin settings & activities
  const fetchSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/settings", {
        headers: {
          "Authorization": `Bearer ${session?.access_token || ""}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLabAccess(data.labAccess);
        setEquipmentCheckout(data.equipmentCheckout);
        setServerMaintenance(data.serverMaintenance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActivities = async () => {
    setLoadingTable(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/activities", {
        headers: {
          "Authorization": `Bearer ${session?.access_token || ""}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTable(false);
    }
  };

  // Only query telemetry endpoints if authenticated
  useEffect(() => {
    if (currentUser) {
      fetchSettings();
      fetchActivities();
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, aiLoading]);

  // Google OAuth Login Trigger
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError("");
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to initialize Google login.");
    } finally {
      setIsAuthenticating(false);
    }
  };



  // Logout / clear session
  const handleLogout = async () => {
    localStorage.removeItem("vit_robotics_club_admin_session");
    await signOut();
    setCurrentUser(null);
  };

  const handleRequestAccess = async () => {
    if (!currentUser) return;
    setRequestingAccess(true);
    setRequestStatus("idle");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/request-access", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRequestStatus("success");
        setRequestMessage(data.message || "Request sent successfully!");
      } else {
        setRequestStatus("error");
        setRequestMessage(data.error || "Failed to send request.");
      }
    } catch (e) {
      setRequestStatus("error");
      setRequestMessage("Network error. Please try again.");
    } finally {
      setRequestingAccess(false);
    }
  };

  // Handle toggles
  const handleToggle = async (key: string, currentValue: boolean) => {
    const newVal = !currentValue;
    if (key === "labAccess") setLabAccess(newVal);
    if (key === "equipmentCheckout") setEquipmentCheckout(newVal);
    if (key === "serverMaintenance") setServerMaintenance(newVal);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
        body: JSON.stringify({
          labAccess: key === "labAccess" ? newVal : labAccess,
          equipmentCheckout: key === "equipmentCheckout" ? newVal : equipmentCheckout,
          serverMaintenance: key === "serverMaintenance" ? newVal : serverMaintenance,
        }),
      });
    } catch (e) {
      console.error("Failed to update remote settings", e);
    }
  };

  // Live simulator trigger to add new activities
  const handleAddSimulatedActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRoll.trim()) return;

    const uppercaseRoll = newRoll.trim().toUpperCase();
    const newLog: ActivityLog = {
      id: uppercaseRoll.startsWith("RBT-") ? uppercaseRoll : `RBT-${newRoll.trim().slice(-3)}`,
      status: "Active",
      name: newName.trim(),
      role: newRole,
      dept: newDept,
      time: "Just now"
    };

    setActivities(prev => [newLog, ...prev]);
    setShowNewEntry(false);
    setNewRoll("");
    setNewName("");
  };

  // Submit trigger to AI Core
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || aiLoading) return;

    const userMsg = prompt.trim();
    setPrompt("");
    setAiError("");
    setChatLog(prev => [...prev, { id: Date.now().toString(), role: "user", text: userMsg }]);
    setAiLoading(true);

    // Simulate high thinking step visualization
    const steps = [
      "Accessing cybernetic memory loops...",
      "Mapping kinetic control laws...",
      "Optimizing microsecond PID control coefficient values...",
      "Re-weighting mechanical structural constraints...",
      "Generating high reasoning synthesis output..."
    ];
    setThinkingSteps([]);

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setThinkingSteps(prev => [...prev, steps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(stepInterval);
      }
    }, 700);

    try {
      const response = await fetch("/api/ai/think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: chatLog.map(turn => ({
            role: turn.role,
            text: turn.text
          }))
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (response.ok && data.success) {
        setChatLog(prev => [...prev, { 
          id: Date.now().toString(), 
          role: "model", 
          text: data.text 
        }]);
      } else {
        // Fallback instructions / missing API key
        setChatLog(prev => [...prev, { 
          id: Date.now().toString(), 
          role: "model", 
          text: data.fallback || `Cognitive core report Error: ${data.error}`
        }]);
        if (data.error) {
          setAiError(data.error);
        }
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setAiError("Connection to AI Core server timed out. Check environment configuration.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto py-16 space-y-10 text-left"
      >
        <header className="flex flex-col items-center justify-center gap-6 pb-6 border-b border-zinc-800 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center gap-2 bg-[#0c0c0e] px-3 py-1.5 rounded-sm border border-zinc-800">
              <Fingerprint className="w-4 h-4 text-[#e8b828]" />
              <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-[0.2em] font-semibold">Secure Operational Gateway</span>
            </div>
            <h1 className="font-sans text-[#e5e1e4] text-4xl font-medium tracking-[-0.65px]">Admin Terminal</h1>
            <p className="font-sans text-sm text-zinc-400">
              Access is restricted to verified VITC Chennai Robotics administrators.
            </p>
          </div>
        </header>

        <section className="bg-[#101010] border border-zinc-800 rounded-md p-8 relative overflow-hidden flex flex-col justify-between shadow-none">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6 font-mono text-[11px] text-zinc-500 font-semibold">
              <span>TERMINAL_IDENT_0x992B</span>
              <span className="text-zinc-600">STATUS: CHALLENGE</span>
            </div>

            <AnimatePresence mode="wait">
              {isAuthenticating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 space-y-4 text-center h-full"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-dashed border-[#e8b828]/35 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-2 border-[#e8b828] rounded-full animate-[ping_1.5s_infinite]"></div>
                    <KeyRound className="w-5 h-5 text-[#e8b828]" />
                  </div>
                  <div className="space-y-1 pt-2">
                    <p className="font-mono text-xs text-[#e8b828] uppercase tracking-wider font-semibold animate-pulse">Authenticating...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isAuthenticating}
                    className="w-full bg-[#18181b] hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold py-4 px-4 rounded-md flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <span>Sign In with Google</span>
                    <span className="text-[10px] font-mono text-[#e8b828] bg-[#e8b828]/10 px-2 py-0.5 rounded border border-[#e8b828]/25 group-hover:bg-[#e8b828] group-hover:text-black transition-colors font-bold">
                      @vitstudent.ac.in
                    </span>
                  </button>

                  {authError && (
                    <div className="p-4 border border-red-500/20 bg-[#0c0c0e] text-red-500 rounded-md text-xs flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="font-mono leading-tight">{authError}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </motion.div>
    );
  }

  // If authenticated as a general student without admin clearance
  const isAdmin = isClubAdmin(currentUser.email) || currentUser.role !== "Student Member";
  if (!isAdmin) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto py-8 space-y-8 text-left"
      >
        <div className="bg-[#101010] border border-zinc-800 rounded-xl p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold block">Access Restricted</span>
                <h2 className="font-sans text-2xl font-bold text-white">Administrator Clearance Required</h2>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer w-fit"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-850 rounded-lg p-5 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8b828]/15 border border-[#e8b828]/30 flex items-center justify-center text-[#e8b828] font-mono text-sm font-bold shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-sans text-base font-semibold text-white">{currentUser.name}</h3>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                  Student Member
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  @vitstudent.ac.in Verified
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-400">{currentUser.email}</p>
              <p className="font-sans text-xs text-zinc-400 pt-2 leading-relaxed">
                You are logged in with your verified VIT student account. However, the <strong>Admin Control Terminal</strong> is restricted to verified Robotics Club Core Leadership (Presidents, Technical Heads, Operations &amp; Division Leads).
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Student Portal Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <span className="font-sans text-xs font-bold text-white block">Official Certificates</span>
                <p className="font-sans text-[11px] text-zinc-400 leading-normal">
                  Search, validate, and download authenticated credentials from your workshops and bootcamps.
                </p>
              </div>
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <span className="font-sans text-xs font-bold text-white block">Core Team Recruitment</span>
                <p className="font-sans text-[11px] text-zinc-400 leading-normal">
                  Submit an application to join our technical R&amp;D divisions or core leadership cluster.
                </p>
              </div>
            </div>
          </div>

          {/* Request Admin Access block */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-sans text-[11px] text-zinc-400 max-w-sm">
                  If you are a core team member who recently joined or requires terminal access for lab duties, you can request manual clearance.
                </p>
                <button
                  onClick={handleRequestAccess}
                  disabled={requestingAccess || requestStatus === "success"}
                  className="w-full sm:w-auto px-4 py-2 bg-[#e8b828] hover:bg-[#d4a824] disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {requestingAccess ? "Requesting..." : (requestStatus === "success" ? "Request Sent" : "Request Clearance")}
                </button>
             </div>
             {requestStatus !== "idle" && (
               <div className={`p-3 rounded border text-xs font-mono flex items-center gap-2 ${
                 requestStatus === "success" ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400" : "bg-red-950/30 border-red-900/50 text-red-400"
               }`}>
                 {requestStatus === "success" ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                 <span>{requestMessage}</span>
               </div>
             )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8 pb-xl text-left"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-zinc-950 border border-zinc-900 rounded-xl gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">TERMINAL SESSION ACTIVE</span>
          </div>
          <h1 className="font-sans text-white text-3xl font-extrabold tracking-tight">System Overview</h1>
          <p className="font-sans text-xs text-zinc-400">
            Authenticated as <span className="text-[#e8b828] font-bold">{currentUser.name}</span> (<span className="text-zinc-350 font-mono italic">{currentUser.role}</span>)
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-350 border border-red-900/40 hover:border-red-500/30 rounded font-mono text-xs uppercase flex items-center gap-2 transition-all cursor-pointer font-bold duration-300"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>Lock Terminal</span>
        </button>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 flex items-center justify-between group cursor-pointer hover:border-[#e8b828]/25 transition-all">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Total Registered</span>
            <div className="font-mono text-3xl font-bold text-white">428</div>
            <span className="font-mono text-[10px] text-[#e8b828]">+12% this semester</span>
          </div>
          <Users className="w-10 h-10 text-[#e8b828]/25" />
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 flex items-center justify-between group cursor-pointer hover:border-[#e8b828]/25 transition-all">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Active Projects</span>
            <div className="font-mono text-3xl font-bold text-white">14</div>
            <span className="font-mono text-[10px] text-zinc-400">3 in review stage</span>
          </div>
          <Layers className="w-10 h-10 text-[#e8b828]/25" />
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 flex items-center justify-between group cursor-pointer hover:border-[#e8b828]/25 transition-all">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Upcoming Events</span>
            <div className="font-mono text-3xl font-bold text-white">{String(UPCOMING_EVENTS.length).padStart(2, '0')}</div>
            <span className="font-mono text-[10px] text-zinc-400 truncate w-32">Next: {UPCOMING_EVENTS[0]?.title || "None"}</span>
          </div>
          <Calendar className="w-10 h-10 text-[#e8b828]/25" />
        </div>

        {/* Action button card */}
        <div 
          onClick={() => setShowNewEntry(true)}
          className="bg-[#18181b] border-2 border-dashed border-[#e8b828]/20 rounded-lg p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:border-[#e8b828]/50 hover:bg-[#e8b828]/[0.02] transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#e8b828]/10 flex items-center justify-center text-[#e8b828] mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#e8b828]">Simulate Lab Log Entry</span>
        </div>
      </section>

      {/* Main complex admin section: Toggles + Logs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left side: Activities logs */}
        <div className="lg:col-span-8 bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
            <div>
              <h2 className="font-sans text-lg font-bold text-white">Recent Member Activity</h2>
              <p className="font-mono text-[10px] text-zinc-500 mt-1">Live tracking of robotics lab access and active commits.</p>
            </div>
            <button 
              onClick={fetchActivities}
              className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded text-zinc-400 hover:text-white transition-colors"
              title="Refresh Activities"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loadingTable ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-950 border-b border-zinc-900 text-xs font-mono text-zinc-500">
                <tr>
                  <th className="p-4 uppercase tracking-widest">ID / Status</th>
                  <th className="p-4 uppercase tracking-widest">Member Info</th>
                  <th className="p-4 uppercase tracking-widest">Operational Unit</th>
                  <th className="p-4 uppercase tracking-widest text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-zinc-950/20 text-sm">
                {activities.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'Active' ? 'bg-[#e8b828] animate-pulse' : 'bg-zinc-600'}`}></span>
                        <span className="font-mono text-xs text-white">{log.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-sans font-semibold text-zinc-350">{log.name}</div>
                      <div className="font-sans text-xs text-zinc-500">{log.role}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-zinc-400">{log.dept}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono text-xs text-zinc-500">{log.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: System controls settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-6">
            <div>
              <h3 className="font-sans text-lg font-bold text-white">System Controls</h3>
              <p className="font-mono text-[10px] text-zinc-500">Manage digital hardware workspace logic.</p>
            </div>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded border border-zinc-900 transition-colors">
                <div className="space-y-1">
                  <p className="font-sans text-sm font-semibold text-white">Lab Gate Access</p>
                  <p className="font-sans text-xs text-zinc-500">Allow RFID turnstile scanner entry</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("labAccess", labAccess)}
                  className="text-zinc-400 hover:text-white"
                >
                  {labAccess ? (
                    <ToggleRight className="w-8 h-8 text-[#e8b828]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-zinc-600" />
                  )}
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded border border-zinc-900 transition-colors">
                <div className="space-y-1">
                  <p className="font-sans text-sm font-semibold text-white">Equipment Checkout</p>
                  <p className="font-sans text-xs text-zinc-500">Enable microcontoller requests</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("equipmentCheckout", equipmentCheckout)}
                  className="text-zinc-400 hover:text-white"
                >
                  {equipmentCheckout ? (
                    <ToggleRight className="w-8 h-8 text-[#e8b828]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-zinc-600" />
                  )}
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded border border-zinc-900 transition-colors">
                <div className="space-y-1">
                  <p className="font-sans text-sm font-semibold text-white">Maintenance Mode</p>
                  <p className="font-sans text-xs text-zinc-500">Disable registration modules</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("serverMaintenance", serverMaintenance)}
                  className="text-zinc-400 hover:text-white"
                >
                  {serverMaintenance ? (
                    <ToggleRight className="w-8 h-8 text-[#e8b828]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-zinc-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Alert block */}
            <AnimatePresence>
              {serverMaintenance && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border border-red-500/20 bg-red-500/5 text-red-400 rounded-lg space-y-1"
                >
                  <div className="flex gap-2 items-center">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <p className="font-sans text-xs font-bold uppercase tracking-wider">ALERT: ACTIVE MAINTENANCE</p>
                  </div>
                  <p className="font-sans text-xs text-zinc-500">All external registration portals will decline incoming boot requests during system migration schedules.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </section>

      {/* Cybernetic High-Thinking AI Lab Terminal Section */}
      <section className="bg-zinc-950 rounded-xl border border-zinc-900 p-8 space-y-6 relative overflow-hidden blueprint-grid">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8b828]/[0.02] rounded-bl-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-[#e8b828] animate-pulse" />
              <span className="font-mono text-label-sm text-[#e8b828] uppercase tracking-widest">COGNITIVE AI CORE</span>
            </div>
            <h2 className="font-sans text-2xl font-bold text-white">Autonomous Brain Diagnostic Core</h2>
            <p className="font-sans text-sm text-zinc-400">
              Direct telemetry client connection to <code className="text-[#e8b828] bg-zinc-900 px-1.5 py-0.5 rounded">gemini-3.1-pro-preview</code> calibrated at <code className="text-[#e8b828]">ThinkingLevel.HIGH</code>.
            </p>
          </div>

          {/* Glowing cyber brain animation representation */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-zinc-500 uppercase">Neural Status</span>
            <div className="relative w-10 h-10 rounded-full border border-[#e8b828]/30 flex items-center justify-center">
              <div className="absolute inset-1 rounded-full bg-[#e8b828]/10 animate-ping"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#e8b828] shadow shadow-yellow-500"></div>
            </div>
          </div>
        </div>

        {/* AI chat logger display */}
        <div className="relative z-10 flex flex-col h-[400px] border border-zinc-900 rounded-lg bg-zinc-950/80 overflow-hidden">
          
          {/* Chat scroll workspace */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatLog.map((turn, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[85%] ${turn.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <span className="font-mono text-[9px] text-zinc-500 uppercase mb-1">
                  {turn.role === 'user' ? 'INTELLIGENT COMMAND' : 'COGNITIVE RESOLUTION'}
                </span>
                <div 
                  className={`p-4 rounded-lg text-sm leading-relaxed ${
                    turn.role === 'user' 
                      ? 'bg-zinc-800 text-white border border-zinc-700' 
                      : 'bg-zinc-900/60 text-zinc-300 border border-zinc-850'
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))}

            {/* Simulated Reasoning steps visual feedback */}
            {aiLoading && (
              <div className="flex flex-col mr-auto max-w-[85%] items-start animate-pulse">
                <span className="font-mono text-[9px] text-[#e8b828] uppercase mb-1">Reasoning Diagnostics</span>
                <div className="p-4 rounded-lg text-sm bg-zinc-900/80 border border-[#e8b828]/20 space-y-3 w-full">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-[#e8b828] animate-ping"></span>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider">ACTIVE INTELLECT MATRIX COUPLING...</span>
                  </div>
                  
                  {/* Staggered thinking steps */}
                  <div className="space-y-1.5 pl-4 border-l border-zinc-850 font-mono text-[11px] text-zinc-500">
                    {thinkingSteps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-[#e8b828]" />
                        <span>{step}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-zinc-650">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"></span>
                      <span>Calculating cybernetic logical weights...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef}></div>
          </div>

          {/* Notification box for paid models */}
          {aiError && (
            <div className="px-6 py-3 border-t border-red-500/20 bg-red-950/20 text-red-400 text-xs font-sans flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Chat input block */}
          <form onSubmit={handleAskAI} className="p-4 bg-zinc-900/50 border-t border-zinc-900 flex gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={aiLoading}
              placeholder="Ask Core Brain e.g., 'Suggest a swarm algorithm strategy' or 'Compute CAD chassis balance'..."
              className="flex-grow bg-zinc-950 border border-zinc-850 text-white rounded p-3 text-sm focus:outline-none focus:border-[#e8b828] focus:ring-1 focus:ring-[#e8b828]/20 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={aiLoading || !prompt.trim()}
              className="bg-[#e8b828] hover:brightness-110 text-black px-6 rounded flex items-center justify-center font-mono font-bold text-xs uppercase gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>COUPLE</span>
            </button>
          </form>
        </div>
      </section>

      {/* Simulator entry dialog */}
      <AnimatePresence>
        {showNewEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <div className="space-y-1">
                <h3 className="font-sans text-xl font-bold text-white">Simulate Lab Access Log</h3>
                <p className="font-sans text-xs text-zinc-500">Inject mock security event into the panel table.</p>
              </div>

              <form onSubmit={handleAddSimulatedActivity} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-zinc-400 font-semibold" htmlFor="simName">Student Full Name</label>
                  <input 
                    type="text" 
                    id="simName" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.G. Aditya Sahu"
                    className="bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:outline-none focus:border-[#e8b828]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs text-zinc-400 font-semibold" htmlFor="simRoll">Registration Number</label>
                  <input 
                    type="text" 
                    id="simRoll" 
                    required
                    value={newRoll}
                    onChange={(e) => setNewRoll(e.target.value)}
                    placeholder="E.G. 24BCE10731"
                    className="bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:outline-none focus:border-[#e8b828]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-sans text-xs text-zinc-400 font-semibold" htmlFor="simRole">Role</label>
                    <select
                      id="simRole"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded p-3 text-sm"
                    >
                      <option value="Member">Member</option>
                      <option value="Research Lead">Research Lead</option>
                      <option value="Core Team">Core Team</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-sans text-xs text-zinc-400 font-semibold" htmlFor="simDept">Operational Unit</label>
                    <select
                      id="simDept"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded p-3 text-sm"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Software">Software</option>
                      <option value="Mechanics">Mechanics</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-grow bg-[#e8b828] hover:brightness-110 text-black text-xs font-mono font-bold py-3.5 rounded uppercase"
                  >
                    INJECT EVENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewEntry(false)}
                    className="border border-zinc-800 hover:border-zinc-700 text-zinc-400 px-6 text-xs font-mono py-3.5 rounded uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
