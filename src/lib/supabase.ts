import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";
const supabaseAnonKey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ALLOWED_EMAIL_DOMAIN = "@vitstudent.ac.in";

// Designated Core Administrator Emails
export const ADMIN_EMAILS: string[] = [
  "rahul.sharma2022@vitstudent.ac.in",
  "priya.patel2022@vitstudent.ac.in",
  "arjun.singh2022@vitstudent.ac.in",
  "neha.gupta2022@vitstudent.ac.in",
  "karthik.iyer2022@vitstudent.ac.in",
  "ananya.rao2022@vitstudent.ac.in",
  "robotics.club@vit.ac.in",
  "mohamed.rifanajmal2025@vitstudent.ac.in" // Developer / Administrator
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
