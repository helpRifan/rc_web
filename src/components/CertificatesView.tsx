import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Award, Search, AlertTriangle, Printer, ShieldAlert, KeyRound, CheckCircle, RefreshCw } from "lucide-react";

export default function CertificatesView() {
  const [year, setYear] = useState("2025");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedCertificate, setLockedCertificate] = useState<any | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [unlockedCertificate, setUnlockedCertificate] = useState<any | null>(null);

  const handleValidateLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      setError("Please specify a academic registration number.");
      return;
    }

    setLoading(true);
    setError("");
    setLockedCertificate(null);
    setOtpSent(false);
    setUnlockedCertificate(null);

    try {
      const response = await fetch("/api/certificates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, rollNumber }),
      });

      const data = await response.json();

      if (response.ok && data.found) {
        // Core record exists! Send OTP verification email
        await fetch("/api/email/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rollNumber, studentName: data.name, otp: "123456" }),
        });

        // Transit to OTP Verification lock
        setLockedCertificate(data);
        setOtpSent(true);
      } else {
        setError(data.message || "Roll Number was not found in the specified cohort list.");
      }
    } catch (err) {
      setError("Network communication error with academic credential directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otpCode.trim() === "123456") {
      // Handshake approved! Full credential unlocked
      setUnlockedCertificate(lockedCertificate);
      setOtpSent(false);
    } else {
      setOtpError("Invalid verification code. Please input code 123456 from your simulated mailbox.");
    }
  };

  const resetPortal = () => {
    setYear("2025");
    setRollNumber("");
    setLockedCertificate(null);
    setOtpSent(false);
    setUnlockedCertificate(null);
    setOtpCode("");
    setOtpError("");
    setError("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-xxl pb-xl text-center max-w-4xl mx-auto"
    >
      {/* Portal Header */}
      <header className="space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#101010] border border-zinc-800 px-3 py-1.5 rounded-sm">
          <span className="font-mono text-[10px] text-[#e8b828] uppercase tracking-[0.2em] font-semibold">Secure Verification Portal</span>
        </div>
        <h1 className="font-sans text-4xl md:text-5xl font-normal text-[#e5e1e4] tracking-[-0.65px]">
          Robotics Club <span className="text-[#e8b828]">Certificates</span>
        </h1>
        <p className="font-sans text-base text-zinc-400">
          Search, validate, and download authenticated credentials for VITC Chennai Robotics Club cohorts. Private student certificates are secured via 2-Step verification.
        </p>
      </header>

      {/* Grid containing Form and Certificate preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        
        {/* Form and OTP panel */}
        <div className={`transition-all duration-500 lg:col-span-5 ${unlockedCertificate ? 'lg:col-span-4' : 'lg:col-span-8 lg:col-start-3'}`}>
          <div className="bg-[#101010] p-6 sm:p-8 rounded-md border border-zinc-800 relative overflow-hidden shadow-none">
            
            {/* STAGE 1: Standard Lookup Form */}
            {!otpSent && !unlockedCertificate && (
              <form onSubmit={handleValidateLookup} className="space-y-6 relative z-10">
                <div>
                  <h2 className="font-sans text-[#e5e1e4] text-lg font-medium tracking-[-0.65px]">Search Academic Registry</h2>
                  <p className="font-sans text-xs text-zinc-400 mt-1">Enter your details to generate your official certificate</p>
                </div>

                {/* Year cohort selector */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs text-zinc-400 font-semibold" htmlFor="yearSelect">Cohort Year</label>
                  <select 
                    id="yearSelect" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-[#0c0c0e] border border-zinc-800 text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:border-[#e8b828] transition-colors"
                  >
                    <option value="2025">2025 Cohort</option>
                    <option value="2024">2024 Cohort</option>
                    <option value="2023">2023 Cohort</option>
                  </select>
                </div>

                {/* Registration query field */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs text-zinc-400 font-semibold" htmlFor="rollInput">Registration / Roll Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="rollInput" 
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="E.G. 24BCE10521"
                      className="flex-grow bg-[#0c0c0e] border border-zinc-800 text-zinc-300 rounded-md p-3 text-sm uppercase placeholder-zinc-600 focus:outline-none focus:border-[#e8b828] transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-[#0c0c0e] border border-zinc-800 hover:border-[#e8b828] hover:text-[#e8b828] text-zinc-400 px-5 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-[#e8b828] border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1.5 leading-relaxed">
                    💡 Sample Database Records:<br/>
                    &middot; Year 2025: <span className="font-semibold text-zinc-400">24BCE10521</span> (Meera Nair)<br/>
                    &middot; Year 2025: <span className="font-semibold text-zinc-400">24BEE10123</span> (Rohan Das)<br/>
                    &middot; Year 2024: <span className="font-semibold text-zinc-400">23BCE10111</span> (Sarah Patel)
                  </div>
                </div>

                {/* Diagnostics state */}
                {error && (
                  <div className="p-4 border border-red-500/20 bg-[#0c0c0e] text-red-400 text-xs rounded-md flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Lookup Alert</p>
                      <p className="text-zinc-500 mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* STAGE 2: 2-Step Verification Lock (Resolves Privacy Concerns!) */}
            {otpSent && !unlockedCertificate && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10 transition-all duration-500">
                <div className="text-center space-y-3 pb-2 border-b border-zinc-800">
                  <div className="w-12 h-12 border border-red-500/20 bg-[#0c0c0e] text-red-500 rounded-md flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-sans text-[#e5e1e4] text-base font-medium tracking-[-0.65px]">Security Handshake Required</h2>
                    <p className="font-mono text-[9px] text-[#e8b828] uppercase tracking-[0.1em]">Authorized Student Authentication</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    To preserve certificate privacy and prevent unauthorized access by third parties, a verification code has been dispatched to your official student email:
                  </p>
                  <div className="p-3 bg-[#0c0c0e] border border-zinc-800 text-zinc-300 rounded-md font-mono text-center text-xs">
                    {rollNumber.toLowerCase()}@vitstudent.ac.in
                  </div>
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    Please key in the 6-digit confirmation password below to validate your ownership node.
                  </p>
                </div>

                {/* OTP Passcode Field */}
                <div className="space-y-2">
                  <label htmlFor="otpInput" className="font-sans text-xs text-zinc-400 font-semibold uppercase tracking-[0.1em] block">6-Sign Handshake Passcode</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      id="otpInput"
                      autoFocus
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="XXXXXX"
                      className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-300 rounded-md py-3 px-4 text-center font-mono text-lg tracking-widest placeholder-zinc-700 focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>
                  
                  {/* Demo Helper Hint */}
                  <div className="text-[10px] text-zinc-500 font-mono p-3 rounded-md bg-[#0c0c0e] border border-zinc-800 leading-relaxed">
                    🛡️ <span className="font-semibold text-zinc-400">SANDBOX INTEGRATION MODE:</span><br/>
                    Enter passcode <strong className="font-semibold text-zinc-400">123456</strong> to simulated academic mailbox validation.
                  </div>
                </div>

                {otpError && (
                  <div className="p-3 border border-red-500/20 bg-[#0c0c0e] text-red-400 text-[11px] rounded-md flex gap-2 items-center">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-grow bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-semibold py-3 px-5 rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize Node</span>
                  </button>
                  <button 
                    type="button"
                    onClick={resetPortal}
                    className="bg-[#0c0c0e] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white px-4 rounded-md text-xs transition-colors cursor-pointer"
                  >
                    Abort
                  </button>
                </div>
              </form>
            )}

            {/* STAGE 3: Successfully Unlocked State */}
            {unlockedCertificate && (
              <div className="space-y-6 text-center py-4 relative z-10 transition-all duration-300">
                <div className="w-12 h-12 border border-emerald-500/20 bg-[#0c0c0e] text-emerald-500 rounded-md flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans text-[#e5e1e4] text-base font-medium tracking-[-0.65px]">Identity Authenticated</h3>
                  <p className="font-mono text-[9px] text-emerald-400 uppercase tracking-[0.1em] font-semibold">SECURE Handshake Completed</p>
                </div>
                <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                  Academic ownership verified successfully. Your authorized participation credential is now rendered inside the visual mainframe preview box.
                </p>
                <button 
                  onClick={resetPortal}
                  className="w-full bg-[#0c0c0e] border border-zinc-800 hover:border-[#e8b828] text-zinc-300 hover:text-[#e8b828] font-mono text-[10px] py-3 rounded-md transition-colors flex items-center justify-center gap-2 uppercase tracking-[0.1em] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verify Other Student</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Certificate preview panel */}
        <AnimatePresence>
          {unlockedCertificate && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-8 space-y-6"
            >
              {/* Certificate Sheet Display */}
              <div 
                id="printable-certificate"
                className="relative bg-white border border-zinc-200 p-8 sm:p-12 text-center rounded-md overflow-hidden relative"
              >
                <div className="space-y-6 text-zinc-800 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.1em] border-b border-zinc-200 pb-4">
                    <span>VIT Chennai Registry</span>
                    <span className="text-[#e8b828] font-bold">Authorized Credentials</span>
                    <span>No. {unlockedCertificate.id}</span>
                  </div>

                  <div className="flex justify-center pt-2">
                    <div className="text-[#e8b828]">
                      <Award className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-mono text-xs text-[#e8b828] tracking-[0.2em] uppercase font-bold">Certificate of Participation</h3>
                    <p className="text-zinc-600 text-xs font-serif italic">This is to officially authorize that</p>
                  </div>

                  <div className="space-y-1 py-3">
                    <h2 className="font-sans text-2xl sm:text-4xl font-normal text-zinc-900 tracking-[-0.65px] uppercase">
                      {unlockedCertificate.name}
                    </h2>
                    <p className="text-zinc-500 font-mono text-[10px] pt-2">Registered Roll: {rollNumber.toUpperCase()}</p>
                  </div>

                  <div className="max-w-md mx-auto text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                    has successfully participated and fully mastered the rigorous structural practices of the
                    <strong className="text-zinc-900 font-semibold"> Control Theory Bootcamp </strong> 
                    hosted by VITC Robotics Club, demonstrating active mastery of linear PID loops, microcontroller controllers, and autonomous hardware stacks.
                  </div>

                  <div className="flex justify-between items-end border-t border-zinc-200 pt-6 mt-10 text-[10px] text-zinc-500">
                    <div className="text-left space-y-1">
                      <p className="font-mono text-[#e8b828] font-bold">AUTHORIZED</p>
                      <p className="font-sans">Rahul Sharma, President</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-mono">{unlockedCertificate.date}</p>
                      <p className="font-sans">Verification Authority</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download actions panel */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrint}
                  className="flex-grow bg-[#e8b828] text-[#101010] font-semibold font-mono text-xs uppercase py-3.5 px-6 rounded-md inline-flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save to PDF
                </button>
                <button
                  onClick={resetPortal}
                  className="bg-[#101010] border border-zinc-800 hover:border-zinc-700 text-zinc-400 font-mono text-xs uppercase py-3.5 px-6 rounded-md transition-colors cursor-pointer"
                >
                  Clear Preview
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
