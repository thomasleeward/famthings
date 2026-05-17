import { createBrowserSupabaseClient } from "./client";

export async function sendHouseholdInvite(householdId: string, email: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.functions.invoke("send-household-invite", {
    body: { householdId, email },
  });
}

export async function getPendingHouseholdInvites() {
  const supabase = createBrowserSupabaseClient();
  return supabase.rpc("get_pending_household_invites");
}

export async function acceptHouseholdInvite(targetInviteId: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.rpc("accept_household_invite", { target_invite_id: targetInviteId } as never);
}

export async function declineHouseholdInvite(targetInviteId: string) {
  const supabase = createBrowserSupabaseClient();
  return supabase.rpc("decline_household_invite", { target_invite_id: targetInviteId } as never);
}
