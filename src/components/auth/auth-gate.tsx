"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";
import { createBrowserSupabaseClient, getSupabaseConfigError } from "@/lib/supabase/client";
import { AuthScreen } from "./auth-screen";

export function AuthGate({ children }: { children: ReactNode }) {
  const configError = getSupabaseConfigError();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (configError) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [configError]);

  if (configError) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream px-4 py-10">
        <Card className="w-full max-w-xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Fam Things setup</p>
          <h1 className="mt-2 text-3xl font-medium">Supabase is not connected</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{configError}</p>
          <div className="mt-5 rounded-xl border border-line bg-cream p-4 font-mono text-sm leading-7">
            <p>NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            <p>NEXT_PUBLIC_APP_URL</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Add these in Vercel Project Settings under Environment Variables, then redeploy the latest commit.
          </p>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-green">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <AppShell>{children}</AppShell>;
}
