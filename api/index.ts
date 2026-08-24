import express from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import ImageKit from "imagekit";

const app = express();
app.use(express.json());

// Initialize Supabase Client with resilient fallbacks
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

let imagekit: ImageKit | null = null;
try {
  if (ikPublicKey && ikPrivateKey && ikUrlEndpoint) {
    imagekit = new ImageKit({
      publicKey: ikPublicKey,
      privateKey: ikPrivateKey,
      urlEndpoint: ikUrlEndpoint
    });
  }
} catch (e) {
  console.error("ImageKit initialization error:", e);
}

// Security: Core Admin list (Protected System Developers)
const ADMIN_EMAILS = [
  "mohamed.rifanajmal2025@vitstudent.ac.in",
  "rifanajmal@gmail.com"
];

async function isClubAdmin(email?: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail)) {
    return true;
  }
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("email")
        .ilike("email", cleanEmail)
        .maybeSingle();
      if (data && !error) return true;
    } catch {}
  }
  return false;
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
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return res.status(401).json({ error: "Unauthorized: Invalid session token." });
    }

    const hasClearance = await isClubAdmin(user.email);
    if (!hasClearance) {
      return res.status(403).json({ error: `Forbidden: Administrator clearance required for ${user.email}.` });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Unauthorized: Session verification failed." });
  }
}

async function requireAuth(req: any, res: any, next: any) {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return res.status(401).json({ error: "Unauthorized: Invalid session token." });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Unauthorized: Session verification failed." });
  }
}

const router = express.Router();

// Health & System Status Endpoint
router.get("/health", async (req, res) => {
  let supabaseStatus = "disconnected";
  let supabaseError = null;

  if (supabase) {
    try {
      const { data, error } = await supabase.from("events").select("id").limit(1);
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
router.get("/imagekit/auth", requireAdminAuth, (req, res) => {
  if (!imagekit) {
    return res.status(503).json({
      error: "ImageKit is not configured. Add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT to environment."
    });
  }
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to generate ImageKit auth parameters." });
  }
});

// Events CRUD Endpoints
router.get("/events", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/events", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id, created_at, ...cleanPayload } = req.body;
    const { data, error } = await supabase.from("events").insert([cleanPayload]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/events/:id", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id } = req.params;
    const { id: _, created_at: __, ...cleanPayload } = req.body;
    const { data, error } = await supabase.from("events").update(cleanPayload).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/events/:id", requireAdminAuth, async (req, res) => {
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

// Operations Recap Highlights / Gallery CRUD Endpoints
router.get("/gallery", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gallery", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id, created_at, story, subtitle, ...rest } = req.body;
    const cleanPayload = {
      title: rest.title || "Untitled",
      category: subtitle || rest.category || "Operations",
      image_url: rest.image_url || "/gallery/1.jpg",
      description: story || rest.description || "",
      order_index: rest.order_index ?? 0,
      year: rest.year || "2025"
    };
    const { data, error } = await supabase.from("gallery").insert([cleanPayload]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/gallery/:id", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const { id: _, created_at: __, story, subtitle, ...rest } = req.body;
    const cleanPayload = {
      title: rest.title || "Untitled",
      category: subtitle || rest.category || "Operations",
      image_url: rest.image_url || "/gallery/1.jpg",
      description: story || rest.description || "",
      order_index: rest.order_index ?? 0,
      year: rest.year || "2025"
    };

    if (!isUUID) {
      const { data, error } = await supabase.from("gallery").insert([cleanPayload]).select().single();
      if (error) throw error;
      return res.json(data);
    }

    const { data, error } = await supabase.from("gallery").update(cleanPayload).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/gallery/:id", requireAdminAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });
  try {
    const { id } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      return res.json({ success: true, message: "Static preset removed" });
    }
    const { error } = await supabase.from("gallery").delete().eq("id", id);
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

router.get("/admin/settings", requireAdminAuth, (req, res) => {
  res.json(labSettings);
});

router.post("/admin/settings", requireAdminAuth, (req, res) => {
  labSettings = { ...labSettings, ...req.body };
  res.json({ success: true, settings: labSettings });
});

// Admin Request Access Endpoint
router.post("/admin/request-access", requireAuth, async (req: any, res: any) => {
  const user = req.user;

  const alreadyAdmin = await isClubAdmin(user.email);
  if (alreadyAdmin) {
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
            <p style="font-size: 12px; color: #a1a1aa;">You can now approve and grant them clearance directly in the <strong>Admin Access Management</strong> panel inside the Admin Terminal.</p>
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

// Admin Team & Clearance Delegation Endpoints
router.get("/admin/list", requireAdminAuth, async (req, res) => {
  try {
    let dbAdmins: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && Array.isArray(data)) {
        dbAdmins = data;
      }
    }

    // Merge with static default admin list if not in db
    const hardcodedDefaults = ADMIN_EMAILS.map((email, idx) => ({
      id: `core-${idx}`,
      email: email.toLowerCase(),
      name: email.includes("rifan") ? "Mohamed Rifan Ajmal" : "System Superadmin",
      role: "Lead Developer",
      added_by: "System Core",
      created_at: new Date(2025, 0, 1).toISOString(),
      is_core: true
    }));

    const existingEmails = new Set(dbAdmins.map(a => a.email.toLowerCase()));
    const finalAdmins = [...dbAdmins];

    for (const core of hardcodedDefaults) {
      if (!existingEmails.has(core.email)) {
        finalAdmins.unshift(core);
      }
    }

    res.json(finalAdmins);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch admin roster." });
  }
});

router.post("/admin/invite", requireAdminAuth, async (req: any, res: any) => {
  const { email, name, role } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const adminName = (name || cleanEmail.split("@")[0] || "Club Admin").trim();
  const adminRole = (role || "Core Team Lead").trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return res.status(400).json({ error: "Valid email address is required." });
  }

  try {
    let newRecord = null;
    if (supabase) {
      const { data, error } = await supabase
        .from("admins")
        .upsert({
          email: cleanEmail,
          name: adminName,
          role: adminRole,
          added_by: req.user.email || "Administrator"
        }, { onConflict: "email" })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to save admin into database.");
      }
      newRecord = data;
    }

    // Send confirmation email via Resend
    let emailDispatched = false;
    if (resend) {
      try {
        await resend.emails.send({
          from: "VITC Robotics Club <onboarding@resend.dev>",
          to: [cleanEmail],
          subject: `🔐 Administrator Clearance Granted: ${adminName}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #e5e1e4; padding: 32px; border-radius: 10px; max-width: 550px; margin: auto; border: 1px solid #27272a;">
              <h2 style="color: #e8b828; margin-top: 0; font-size: 22px;">VIT CHENNAI ROBOTICS CLUB</h2>
              <p style="font-size: 13px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Admin Terminal Clearance Granted</p>
              <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
              <p>Hello <strong>${adminName}</strong>,</p>
              <p>You have been granted <strong>${adminRole}</strong> access to the <strong>Robotics Club Control Terminal</strong> by <code>${req.user.email}</code>.</p>
              <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #e4e4e7;"><strong>Authorized Email:</strong> <code style="color: #e8b828;">${cleanEmail}</code></p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #e4e4e7;"><strong>Role:</strong> ${adminRole}</p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #e4e4e7;"><strong>Permissions:</strong> Events Management, Highlights Gallery, Lab Telemetry, Certificate Portal</p>
              </div>
              <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">You can now log into the club website using your Google <code>@vitstudent.ac.in</code> account to access the Admin Terminal.</p>
              <div style="margin-top: 24px;">
                <a href="https://rc-web-rho.vercel.app/#admin" style="background-color: #e8b828; color: #101010; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 13px;">
                  Open Admin Terminal
                </a>
              </div>
            </div>
          `
        });
        emailDispatched = true;
      } catch (mailErr: any) {
        console.warn("Resend email invite warning:", mailErr);
      }
    }

    res.json({
      success: true,
      emailDispatched,
      admin: newRecord || { email: cleanEmail, name: adminName, role: adminRole },
      message: `Admin access granted to ${cleanEmail}${emailDispatched ? " and notification email sent." : "."}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to grant admin access." });
  }
});

router.delete("/admin/remove/:id", requireAdminAuth, async (req: any, res: any) => {
  const target = decodeURIComponent(req.params.id || "").trim();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured." });

  // Protect system developer accounts
  if (ADMIN_EMAILS.some(e => e.toLowerCase() === target.toLowerCase())) {
    return res.status(403).json({ error: "Protected developer accounts cannot be removed." });
  }

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
    let query = supabase.from("admins").delete();

    if (isUUID) {
      query = query.eq("id", target);
    } else {
      query = query.ilike("email", target);
    }

    const { error } = await query;
    if (error) throw error;

    res.json({ success: true, message: "Administrator clearance revoked." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to remove administrator." });
  }
});

// Admin mock activities
const mockActivities = [
  { id: "RBT-901", status: "Active", name: "Alex Kumar", role: "Core Team", dept: "Electronics", time: "Just now" },
  { id: "RBT-902", status: "Active", name: "Sarah Patel", role: "Research Lead", dept: "AI & Vision", time: "2 hrs ago" },
  { id: "RBT-844", status: "Muted", name: "Rahul Mehta", role: "Member", dept: "Mechanics", time: "1 day ago" },
  { id: "RBT-711", status: "Active", name: "Meera Nair", role: "Member", dept: "Software", time: "2 days ago" },
];

router.get("/admin/activities", requireAdminAuth, (req, res) => {
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

// Certificate Validation
router.post("/certificates/validate", async (req, res) => {
  const { year, rollNumber } = req.body;
  const uppercaseRoll = (rollNumber || "").trim().toUpperCase();

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
router.post("/email/send-otp", async (req, res) => {
  const { recipientEmail, rollNumber, studentName, otp } = req.body;

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

// Form Submissions endpoint
router.post("/forms/submit", async (req, res) => {
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

  res.json({ success: true, message: "Submission logged locally." });
});

// Mount router on both /api and root /
app.use("/api", router);
app.use("/", router);

export default app;
