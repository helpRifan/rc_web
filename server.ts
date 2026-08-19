import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import ImageKit from "imagekit";
import dns from "dns";

// Fix Node dns resolution for local/internal calls
dns.setDefaultResultOrder("ipv4first");

const app = express();
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize Resend Client
const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Initialize ImageKit Client
const ikPublicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.VITE_IMAGEKIT_PUBLIC_KEY || "";
const ikPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
const ikUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.VITE_IMAGEKIT_URL_ENDPOINT || "";
const imagekit = (ikPublicKey && ikPrivateKey && ikUrlEndpoint)
  ? new ImageKit({
      publicKey: ikPublicKey,
      privateKey: ikPrivateKey,
      urlEndpoint: ikUrlEndpoint
    })
  : null;


// Security: Core Admin list (mirrored from client)
const ADMIN_EMAILS = [
  "ihsan.2023@vitstudent.ac.in",
  "grace.2023@vitstudent.ac.in",
  "vinayak.2023@vitstudent.ac.in",
  "pranjal.2023@vitstudent.ac.in",
  "aurka.2023@vitstudent.ac.in",
  "karthik.2023@vitstudent.ac.in",
  "akshaj.2023@vitstudent.ac.in",
  "tarun.2023@vitstudent.ac.in",
  "basil.2023@vitstudent.ac.in",
  "leni.2023@vitstudent.ac.in",
  "gurudeep.2023@vitstudent.ac.in",
  "madhava.2023@vitstudent.ac.in",
  "goutham.2023@vitstudent.ac.in",
  "akshita.2023@vitstudent.ac.in",
  "aditya.kumarsahu2025@vitstudent.ac.in",
  "ashton.2023@vitstudent.ac.in",
  "daksh.2023@vitstudent.ac.in",
  "robotics.club@vit.ac.in",
  "mohamed.rifanajmal2025@vitstudent.ac.in" 
];

function isClubAdmin(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase().trim());
}

// Authentication Middleware
async function requireAdminAuth(req: any, res: any, next: any) {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase not configured." });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || !user.email) {
    return res.status(401).json({ error: "Unauthorized: Invalid session token." });
  }

  if (!isClubAdmin(user.email)) {
    return res.status(403).json({ error: "Forbidden: Administrator clearance required." });
  }

  req.user = user;
  next();
}

async function requireAuth(req: any, res: any, next: any) {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || !user.email) {
    return res.status(401).json({ error: "Unauthorized: Invalid session token." });
  }

  req.user = user;
  next();
}


// Health & System Status Endpoint
app.get("/api/health", async (req, res) => {
  let supabaseStatus = "disconnected";
  let supabaseError = null;

  if (supabase) {
    try {
      const { data, error } = await supabase.from("certificates").select("id").limit(1);
      if (!error) supabaseStatus = "connected";
      else supabaseError = error.message;
    } catch (e: any) {
      supabaseError = e.message;
    }
  }

  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        configured: !!supabase,
        status: supabaseStatus,
        error: supabaseError
      },
      resend: {
        configured: !!resend
      },
      imagekit: {
        configured: !!imagekit
      }
    }
  });
});

// ImageKit Authentication Parameter endpoint for direct client uploads
app.get("/api/imagekit/auth", requireAdminAuth, (req, res) => {
  if (!imagekit) {
    return res.status(503).json({
      error: "ImageKit is not configured. Add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT to .env.local."
    });
  }
  const authParams = imagekit.getAuthenticationParameters();
  res.json(authParams);
});



// Events CRUD Endpoints
app.get("/api/events", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/events", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { data, error } = await supabase.from("events").insert([req.body]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/events/:id", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("events").update(req.body).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/events/:id", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id } = req.params;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint to toggle simulated features
let labSettings = {
  labAccess: true,
  equipmentCheckout: true,
  serverMaintenance: false,
};

app.get("/api/admin/settings", requireAdminAuth, (req, res) => {
  res.json(labSettings);
});

app.post("/api/admin/settings", requireAdminAuth, (req, res) => {
  labSettings = { ...labSettings, ...req.body };
  res.json({ success: true, settings: labSettings });
});

// Admin Request Access Endpoint
app.post("/api/admin/request-access", requireAuth, async (req: any, res: any) => {
  const user = req.user;

  if (isClubAdmin(user.email)) {
    return res.json({ success: true, message: "You already have admin clearance." });
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: "VITC Robotics Club <onboarding@resend.dev>",
        to: ["rifanajmal@gmail.com", "robotics.club@vit.ac.in"],
        subject: `🔒 Admin Access Request: ${user.email}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #18181b; color: #e5e1e4;">
            <h2 style="color: #e8b828;">Admin Clearance Request</h2>
            <p><strong>User:</strong> ${user.user_metadata?.full_name || "Unknown Student"} (<a href="mailto:${user.email}" style="color: #e8b828;">${user.email}</a>)</p>
            <p>This user has requested access to the Admin Terminal.</p>
            <hr style="border: 1px solid #27272a;" />
            <p style="font-size: 12px; color: #a1a1aa;">To approve, please review their credentials and manually add their email to the <code>ADMIN_EMAILS</code> array in the source code.</p>
          </div>
        `
      });
      return res.json({ success: true, message: "Request sent to Core Leadership." });
    } catch (err: any) {
      console.error("Resend error:", err);
      return res.status(500).json({ error: "Failed to dispatch email." });
    }
  }

  return res.status(503).json({ error: "Email configuration unavailable." });
});

// Admin mock activities
const mockActivities = [
  { id: "RBT-901", status: "Active", name: "Alex Kumar", role: "Core Team", dept: "Electronics", time: "Just now" },
  { id: "RBT-902", status: "Active", name: "Sarah Patel", role: "Research Lead", dept: "AI & Vision", time: "2 hrs ago" },
  { id: "RBT-844", status: "Muted", name: "Rahul Mehta", role: "Member", dept: "Mechanics", time: "1 day ago" },
  { id: "RBT-711", status: "Active", name: "Meera Nair", role: "Member", dept: "Software", time: "2 days ago" },
];

app.get("/api/admin/activities", requireAdminAuth, (req, res) => {
  res.json(mockActivities);
});

// Fallback mock certificates
const mockCertificates: Record<string, Record<string, string>> = {
  "2025": {
    "24BCE10234": "Alex Kumar",
    "24BCE10521": "Meera Nair",
    "24BME10099": "Tanya Saxena",
    "24BEE10123": "Rohan Das",
  },
  "2024": {
    "23BCE10111": "Sarah Patel",
    "23BME10450": "Raghav Sen",
  },
  "2023": {
    "22BEC10015": "Arjun Singh",
    "22BCE10732": "Rahul Mehta",
  },
};

// Certificate Validation: Queries Supabase with fallback to local mock
app.post("/api/certificates/validate", async (req, res) => {
  const { year, rollNumber } = req.body;
  const uppercaseRoll = (rollNumber || "").trim().toUpperCase();

  // Try querying Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("year", year)
        .ilike("roll_number", uppercaseRoll)
        .maybeSingle();

      if (data && !error) {
        return res.json({
          found: true,
          name: data.student_name,
          event: data.event_name,
          date: data.issue_date,
          id: data.certificate_id,
          source: "supabase"
        });
      }
    } catch (dbErr) {
      console.warn("Supabase certificate query error, trying local fallback:", dbErr);
    }
  }

  // Fallback to local records
  const yearRecords = mockCertificates[year];
  if (yearRecords && yearRecords[uppercaseRoll]) {
    res.json({
      found: true,
      name: yearRecords[uppercaseRoll],
      event: "Control Theory Bootcamp",
      date: `October 14, ${year}`,
      id: `CERT-${year}-${uppercaseRoll.slice(-5)}`,
      source: "local"
    });
  } else {
    res.status(200).json({
      found: false,
      message: `No certificate found in cohort ${year} for roll number: ${rollNumber}`
    });
  }
});

// Resend Email Notification / OTP Dispatch Endpoint
app.post("/api/email/send-otp", async (req, res) => {
  const { recipientEmail, rollNumber, studentName, otp } = req.body;

  if (!recipientEmail && !process.env.RESEND_API_KEY) {
    return res.status(400).json({ error: "Recipient email or Resend API key missing." });
  }

  const targetEmail = recipientEmail || "rifanajmal@gmail.com";
  const verificationCode = otp || "123456";

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: "VITC Robotics Club <onboarding@resend.dev>",
        to: [targetEmail],
        subject: `🔐 Certificate Verification Code: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #e5e1e4; padding: 32px; border-radius: 8px; max-width: 500px; margin: auto; border: 1px solid #27272a;">
            <h2 style="color: #e8b828; margin-top: 0; font-size: 20px;">VIT CHENNAI ROBOTICS CLUB</h2>
            <p style="font-size: 14px; color: #a1a1aa;">Credential Verification Portal</p>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
            <p>Hello <strong>${studentName || "Student"}</strong>,</p>
            <p>Your one-time verification code to view and download your official Robotics Club credential for registration <code>${rollNumber || ""}</code> is:</p>
            <div style="background-color: #18181b; border: 1px dashed #e8b828; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #e8b828;">${verificationCode}</span>
            </div>
            <p style="font-size: 12px; color: #71717a;">This code is valid for 10 minutes. If you did not request this verification, you can safely ignore this email.</p>
          </div>
        `
      });

      if (error) {
        console.warn("Resend API warning:", error);
        return res.json({
          success: true,
          dispatched: false,
          warning: error.message,
          simulatedOtp: verificationCode,
          message: "Email dispatch limited in test mode. Use simulated OTP."
        });
      }

      return res.json({
        success: true,
        dispatched: true,
        emailId: data?.id,
        message: `Verification email dispatched to ${targetEmail}`
      });
    } catch (err: any) {
      console.error("Resend dispatch exception:", err);
      return res.json({
        success: true,
        dispatched: false,
        simulatedOtp: verificationCode,
        message: "Simulated verification code active."
      });
    }
  }

  res.json({
    success: true,
    dispatched: false,
    simulatedOtp: verificationCode,
    message: "Resend not configured. Use code: " + verificationCode
  });
});

// AI Cybernetic Core Endpoint
app.post("/api/ai/think", requireAdminAuth, async (req: any, res: any) => {
  try {
    const { message, chatHistory } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ success: false, error: "GEMINI_API_KEY not configured" });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const context = `You are the Cognitive Cybernetic Brain of the VITC Robotics Club. 
You manage and provide answers related to the club's administration, mechanics, software, and kinetic optimization. 
Keep your answers concise, highly technical, and futuristic.

Previous Chat History:
${chatHistory?.map((c: any) => `${c.role}: ${c.text}`).join("\n")}

User: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context,
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Form Submissions endpoint (saves to Supabase form_submissions)
app.post("/api/forms/submit", async (req, res) => {
  const { formType, fullName, email, phone, rollNumber, departmentPreference, message } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Full Name and Email are required." });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("form_submissions").insert([
        {
          form_type: formType || "recruitment",
          full_name: fullName,
          email,
          phone,
          roll_number: rollNumber,
          department_preference: departmentPreference,
          message,
          status: "pending"
        }
      ]).select();

      if (error) {
        console.error("Supabase form submission error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, submissionId: data[0]?.id });
    } catch (e: any) {
      console.error("Form submission exception:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  // Fallback success if Supabase table not yet created
  res.json({ success: true, message: "Submission logged locally." });
});

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5173;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Support Vercel serverless functions by exporting the app directly
if (process.env.VERCEL) {
  module.exports = app;
} else {
  startServer();
}
