import { createBrowserSupabaseClient } from "./client";

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = createBrowserSupabaseClient();

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/update-password`,
  });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.signOut();
}

export async function updatePassword(password: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.auth.updateUser({ password });
}
