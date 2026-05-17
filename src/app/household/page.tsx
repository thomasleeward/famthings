import { MailPlus, ShieldCheck, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { household } from "@/lib/data/sample";

export default function HouseholdPage() {
  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Account"
        title="Household"
        action={
          <Button>
            <UserRoundPlus className="size-4" /> Invite member
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-green">Fam Things</p>
                <h2 className="mt-1 text-3xl font-black">{household.name}</h2>
              </div>
              <Badge>Owner</Badge>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {household.members.map((member, index) => (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-cream p-3" key={member}>
                  <div className="grid size-10 place-items-center rounded-full bg-soft-green font-black text-green">
                    {member[0]}
                  </div>
                  <div>
                    <p className="font-black">{member}</p>
                    <p className="text-sm text-muted">{index === 0 ? "Owner" : "Member"}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-green" />
              <h2 className="text-lg font-black">Setup checklist</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Supabase auth", "Profiles", "Household members", "Invite RPCs", "Resend Edge Function", "Vercel env vars"].map((item) => (
                <div className="rounded-lg border border-line bg-cream px-3 py-2 text-sm font-bold" key={item}>{item}</div>
              ))}
            </div>
          </Card>
        </section>

        <Card className="h-fit p-5">
          <div className="flex items-center gap-2">
            <MailPlus className="size-5 text-green" />
            <h2 className="text-lg font-black">Send invite</h2>
          </div>
          <div className="mt-4 space-y-3">
            <input className="h-11 w-full rounded-lg border border-line bg-cream px-3 font-medium" placeholder="name@example.com" type="email" />
            <Button className="w-full">Send household invite</Button>
            <p className="text-sm leading-6 text-muted">
              This will call <span className="font-bold text-ink">send-household-invite</span> with <span className="font-bold text-ink">householdId</span> and <span className="font-bold text-ink">email</span>. Pending invites use the existing RPCs for accept and decline.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
