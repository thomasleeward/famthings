"use client";

import { useEffect, useState } from "react";
import { Loader2, MailPlus, ShieldCheck, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Database, HouseholdRole } from "@/types/database";

type Household = Database["public"]["Tables"]["households"]["Row"];
type HouseholdMember = Database["public"]["Tables"]["household_members"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type MemberView = HouseholdMember & {
  name: string;
  email: string | null;
};

function getDisplayName(profile: Profile | undefined, userId: string) {
  return profile?.name || profile?.email || `Member ${userId.slice(0, 6)}`;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatRole(role: HouseholdRole) {
  return role === "owner" ? "Owner" : "Member";
}

export default function HouseholdPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [currentRole, setCurrentRole] = useState<HouseholdRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHousehold() {
      setLoading(true);
      setError("");

      const supabase = createBrowserSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        if (active) {
          setError(authError?.message || "Could not load the current user.");
          setLoading(false);
        }
        return;
      }

      const { data: currentMembership, error: membershipError } = await supabase
        .from("household_members")
        .select("id, household_id, user_id, role, joined_at")
        .eq("user_id", authData.user.id)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (membershipError || !currentMembership) {
        if (active) {
          setError(membershipError?.message || "You are not currently in a household.");
          setHousehold(null);
          setMembers([]);
          setCurrentRole(null);
          setLoading(false);
        }
        return;
      }

      const [{ data: householdData, error: householdError }, { data: memberRows, error: membersError }] = await Promise.all([
        supabase
          .from("households")
          .select("id, name, created_by, created_at")
          .eq("id", currentMembership.household_id)
          .single(),
        supabase
          .from("household_members")
          .select("id, household_id, user_id, role, joined_at")
          .eq("household_id", currentMembership.household_id)
          .order("joined_at", { ascending: true }),
      ]);

      if (householdError || membersError || !householdData || !memberRows) {
        if (active) {
          setError(householdError?.message || membersError?.message || "Could not load household members.");
          setLoading(false);
        }
        return;
      }

      const userIds = memberRows.map((member) => member.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email, phone, avatar_url, week_starts_on, created_at")
        .in("id", userIds);

      const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
      const nextMembers = memberRows.map((member) => {
        const profile = profileById.get(member.user_id);

        return {
          ...member,
          name: getDisplayName(profile, member.user_id),
          email: profile?.email || null,
        };
      });

      if (active) {
        setHousehold(householdData);
        setMembers(nextMembers);
        setCurrentRole(currentMembership.role);
        setLoading(false);
      }
    }

    void loadHousehold();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Account"
        title="Household"
        action={
          <Button>
            <UserRoundPlus className="size-4" /> Invite member
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Fam Things</p>
                <h2 className="mt-2 font-serif text-4xl font-medium">{household?.name || "Household"}</h2>
              </div>
              {currentRole ? <Badge>{formatRole(currentRole)}</Badge> : null}
            </div>
            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-muted">
                <Loader2 className="size-4 animate-spin text-green" />
                Loading members
              </div>
            ) : error ? (
              <p className="mt-6 rounded-lg border border-danger/20 bg-cream px-3 py-2 text-sm font-medium text-danger">{error}</p>
            ) : members.length ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {members.map((member) => (
                  <div className="flex items-center gap-3 rounded-lg border border-line bg-cream p-3" key={member.id}>
                    <div className="grid size-10 place-items-center rounded-full bg-soft-green font-semibold text-green">
                      {getInitial(member.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{member.name}</p>
                      <p className="truncate text-sm text-muted">{formatRole(member.role)}{member.email ? ` · ${member.email}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm font-medium text-muted">No household members found.</p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-green" />
              <h2 className="text-lg font-medium">Setup checklist</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Supabase auth", "Profiles", "Household members", "Invite RPCs", "Resend Edge Function", "Vercel env vars"].map((item) => (
                <div className="rounded-lg border border-line bg-cream px-3 py-2 text-sm font-medium" key={item}>{item}</div>
              ))}
            </div>
          </Card>
        </section>

        <Card className="h-fit p-4">
          <div className="flex items-center gap-2">
            <MailPlus className="size-5 text-green" />
            <h2 className="text-lg font-medium">Send invite</h2>
          </div>
          <div className="mt-4 space-y-3">
            <input className="h-10 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="name@example.com" type="email" />
            <Button className="w-full" disabled={!household}>Send household invite</Button>
            <p className="text-sm leading-6 text-muted">
              This will call <span className="font-medium text-ink">send-household-invite</span> with <span className="font-medium text-ink">householdId</span> and <span className="font-medium text-ink">email</span>. Pending invites use the existing RPCs for accept and decline.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
