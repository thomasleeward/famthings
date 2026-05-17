"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updatePassword } from "@/lib/supabase/auth";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage("Password updated. You can return to Fam Things.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green">Fam Things</p>
        <h1 className="mt-2 text-3xl font-medium">Update password</h1>
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-muted">New password</span>
            <input
              className="mt-1 h-11 w-full rounded-xl border border-line bg-cream px-3 font-medium"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="rounded-xl border border-danger/20 bg-white px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}
          {message ? <p className="rounded-xl border border-green/20 bg-soft-green px-3 py-2 text-sm font-medium text-success">{message}</p> : null}

          <Button className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Save password
          </Button>
        </form>
      </Card>
    </main>
  );
}
