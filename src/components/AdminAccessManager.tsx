import React, { useState, useEffect } from "react";
import { supabase, ADMIN_EMAILS } from "../lib/supabase";
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ShieldAlert,
  KeyRound,
  Sparkles
} from "lucide-react";

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  added_by?: string;
  created_at?: string;
  is_core?: boolean;
}

const PROTECTED_EMAILS = [
  "mohamed.rifanajmal2025@vitstudent.ac.in",
  "rifanajmal@gmail.com"
];

export default function AdminAccessManager() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "Core Leadership",
    sendEmail: true
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      // 1. Try Backend API endpoint
      const res = await fetch("/api/admin/list", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAdmins(data);
          setLoading(false);
          return;
        }
      }

      // 2. Direct Supabase query fallback
      const { data: dbData, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: true });

      const dbAdmins = (!error && Array.isArray(dbData)) ? dbData : [];
      const existingEmails = new Set(dbAdmins.map(a => a.email?.toLowerCase()));

      const hardcoded = ADMIN_EMAILS.filter(e => !existingEmails.has(e.toLowerCase())).map((e, idx) => ({
        id: `core-${idx}`,
        email: e,
        name: e.includes("rifan") ? "Mohamed Rifan Ajmal" : "System Superadmin",
        role: "Lead Developer",
        added_by: "System Core",
        created_at: new Date(2025, 0, 1).toISOString(),
        is_core: true
      }));

      setAdmins([...hardcoded, ...dbAdmins]);
    } catch (e) {
      console.error("Failed to fetch admin list", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFeedback({ type: "error", text: "Please enter a valid email address." });
      setSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          name: formData.name.trim() || cleanEmail.split("@")[0],
          role: formData.role
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to grant administrator clearance.");
      }

      setFeedback({
        type: "success",
        text: `Administrator access granted to ${cleanEmail}! Official email dispatch was sent via Resend.`
      });

      setShowModal(false);
      setFormData({
        email: "",
        name: "",
        role: "Core Leadership",
        sendEmail: true
      });
      await fetchAdmins();
    } catch (err: any) {
      console.error("Admin grant failed:", err);
      setFeedback({ type: "error", text: err.message || "Failed to grant clearance." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (admin: AdminUser) => {
    if (PROTECTED_EMAILS.includes(admin.email.toLowerCase())) {
      alert("This account is a protected core system developer and cannot be revoked.");
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke Administrator Clearance for ${admin.name || admin.email}?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      // Target email encoded
      const targetParam = encodeURIComponent(admin.email);
      let removedViaApi = false;

      try {
        const res = await fetch(`/api/admin/remove/${targetParam}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) removedViaApi = true;
      } catch (err) {
        console.warn("API delete error, attempting direct database fallback:", err);
      }

      if (!removedViaApi) {
        // Direct Supabase fallback
        const { error: sbErr } = await supabase.from("admins").delete().ilike("email", admin.email);
        if (sbErr) console.warn("Supabase direct delete warning:", sbErr);
      }

      // Optimistically update list
      setAdmins(prev => prev.filter(a => a.email.toLowerCase() !== admin.email.toLowerCase()));

      setFeedback({
        type: "success",
        text: `Revoked clearance for ${admin.email}.`
      });

      await fetchAdmins();
    } catch (e: any) {
      alert("Failed to revoke: " + (e.message || "Unknown error"));
    }
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#e8b828]" />
            <h2 className="font-sans text-lg font-bold text-white">Administrator Access &amp; Role Delegation</h2>
          </div>
          <p className="font-mono text-[10px] text-zinc-500 mt-1">
            Grant VIT student accounts administrator privileges and automatically dispatch official invitation emails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchAdmins}
            disabled={loading}
            className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Admin List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setFeedback(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8b828] text-black font-semibold rounded hover:bg-yellow-400 transition-colors cursor-pointer text-sm font-sans"
          >
            <UserPlus className="w-4 h-4" />
            Grant Admin Access
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 border-b text-xs font-mono flex items-center justify-between gap-3 ${
          feedback.type === "success" 
            ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400" 
            : "bg-red-950/30 border-red-900/50 text-red-400"
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table Roster */}
      <div className="p-6 overflow-x-auto">
        {loading ? (
          <div className="text-zinc-500 text-sm font-mono text-center py-12 animate-pulse">
            Querying Authorized Administrator Clearance Records...
          </div>
        ) : admins.length === 0 ? (
          <div className="text-zinc-500 text-sm font-mono text-center py-12">
            No dynamic administrators found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950/60 border-b border-zinc-800 text-xs font-mono text-zinc-500">
              <tr>
                <th className="p-3.5 uppercase tracking-widest">Administrator</th>
                <th className="p-3.5 uppercase tracking-widest">VIT Mail / Auth ID</th>
                <th className="p-3.5 uppercase tracking-widest">Designated Role</th>
                <th className="p-3.5 uppercase tracking-widest">Authorized By</th>
                <th className="p-3.5 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {admins.map((adm, idx) => {
                const isProtected = PROTECTED_EMAILS.includes(adm.email.toLowerCase());
                return (
                  <tr key={adm.id || idx} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e8b828]/15 border border-[#e8b828]/30 flex items-center justify-center text-[#e8b828] font-mono text-xs font-bold shrink-0">
                          {(adm.name || adm.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{adm.name || "Administrator"}</span>
                          {adm.is_core && (
                            <span className="text-[10px] font-mono text-[#e8b828] uppercase tracking-wider">System Core</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-300">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{adm.email}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {adm.role || "Club Admin"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-xs text-zinc-500">{adm.added_by || "System Core"}</span>
                    </td>
                    <td className="p-3.5 text-right">
                      {isProtected ? (
                        <span className="text-[10px] font-mono text-zinc-600 uppercase">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(adm)}
                          className="p-1.5 bg-red-950/30 hover:bg-red-900/60 text-red-400 rounded transition-colors cursor-pointer border border-red-900/30"
                          title="Revoke Admin Clearance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Grant Admin Access Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#e8b828]" />
                <h3 className="text-lg font-bold text-white">Grant Administrator Clearance</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  VIT Student Email <span className="text-[#e8b828]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aditya.kumarsahu2025@vitstudent.ac.in"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-white text-sm outline-none focus:border-[#e8b828] transition-colors"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block font-mono">
                  Must be the exact email they use to log in via Google Sign In.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aditya Kumar Sahu"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-white text-sm outline-none focus:border-[#e8b828] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Assigned Administrative Role
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-white text-sm outline-none focus:border-[#e8b828] transition-colors"
                >
                  <option value="Core Leadership">Core Leadership</option>
                  <option value="President / Vice President">President / Vice President</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Operations Lead">Operations Lead</option>
                  <option value="Research &amp; Development Lead">Research &amp; Development Lead</option>
                  <option value="Web Development Lead">Web Development Lead</option>
                  <option value="Media &amp; Design Lead">Media &amp; Design Lead</option>
                  <option value="Faculty Advisor">Faculty Advisor</option>
                </select>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center gap-2 text-xs text-zinc-300">
                <Sparkles className="w-4 h-4 text-[#e8b828] shrink-0" />
                <span>An automated invitation email will be dispatched to their VIT inbox via Resend.</span>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#e8b828] hover:bg-yellow-400 text-black font-bold rounded text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? "Granting Access..." : "Grant Admin Clearance"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
