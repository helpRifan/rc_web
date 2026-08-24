import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";
const supabaseAnonKey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ALLOWED_EMAIL_DOMAIN = "@vitstudent.ac.in";

// Designated Core Administrator Emails (Protected System Developers)
export const ADMIN_EMAILS: string[] = [
  "ihsan.hashir2024@vitstudent.ac.in",
  "aditya.kumarsahu2025@vitstudent.ac.in",
  "mohamed.rifanajmal2025@vitstudent.ac.in", // Developer / Administrator
  "rifanajmal@gmail.com"
];

export function isAuthorizedStudentEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith(ALLOWED_EMAIL_DOMAIN);
}

export function isClubAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail);
}

export async function checkClubAdminAsync(email?: string | null): Promise<boolean> {
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
    } catch { }
  }
  return false;
}

export async function signInWithGoogle() {
  const redirectUrl = window.location.origin;
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        hd: "vitstudent.ac.in",
        prompt: "select_account"
      },
      redirectTo: redirectUrl
    }
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}
