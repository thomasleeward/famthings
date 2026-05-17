"use client";

import { FormEvent, useState } from "react";
import { CheckSquare, Loader2, Mail, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendPasswordResetEmail, signInWithEmail } from "@/lib/supabase/auth";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const result =
      mode === "signin"
        ? await signInWithEmail(email, password)
        : await sendPasswordResetEmail(email);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "reset") {
      setMessage("Check your email for a password reset link.");
      return;
    }
  }

  return (
    <main className="grid min-h-screen bg-cream px-4 py-10 md:grid-cols-[1fr_440px] md:px-10">
      <section className="flex flex-col justify-between rounded-2xl border border-line bg-soft-green/70 p-8">
        <div>
          <div className="grid size-12 place-items-center rounded-2xl bg-lime/60 font-semibold text-green">FT</div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-green/75">Fam Things</p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl font-medium leading-tight md:text-7xl">
            Shared family planning, without the spillover.
          </h1>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[
            ["Events", CheckSquare],
            ["Meals", Soup],
            ["Invites", Mail],
          ].map(([label, Icon]) => (
            <div className="rounded-xl border border-green/20 bg-white/70 p-4" key={label as string}>
              <Icon className="size-5 text-green" />
              <p className="mt-3 font-semibold">{label as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center py-8 md:px-8">
        <Card className="w-full p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Private household</p>
          <h2 className="mt-2 text-3xl font-medium">{mode === "signin" ? "Sign in" : "Reset password"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {mode === "signin"
              ? "Use your Fam Things account to view your household."
              : "We will send a Supabase password reset email for this web app."}
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-muted">Email</span>
              <input
                className="mt-1 h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            {mode === "signin" ? (
              <label className="block">
                <span className="text-sm font-medium text-muted">Password</span>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
            ) : null}

            {error ? <p className="rounded-xl border border-danger/20 bg-white px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}
            {message ? <p className="rounded-xl border border-green/20 bg-soft-green px-3 py-2 text-sm font-medium text-success">{message}</p> : null}

            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Send reset link"}
            </Button>
          </form>

          <button
            className="mt-4 text-sm font-medium text-green"
            onClick={() => {
              setError("");
              setMessage("");
              setMode(mode === "signin" ? "reset" : "signin");
            }}
            type="button"
          >
            {mode === "signin" ? "Forgot password?" : "Back to sign in"}
          </button>
        </Card>
      </section>
    </main>
  );
}
