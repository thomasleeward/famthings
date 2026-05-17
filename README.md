# Fam Things Web

Desktop web app scaffold for Fam Things, built with Next.js App Router, TypeScript, Tailwind CSS, Supabase JS, and Vercel-friendly environment variables.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

These public values are safe for Vercel client-side Supabase usage when Row Level Security is configured correctly in Supabase.

## Supabase Integration Points

- `src/types/database.ts` contains the starter database type map for the existing tables and RPCs.
- `src/lib/supabase/client.ts` creates the typed browser Supabase client.
- `src/lib/supabase/auth.ts` wraps browser-triggered Supabase Auth flows, including password reset email links.
- `src/lib/supabase/households.ts` wraps the invite RPCs and `send-household-invite` Edge Function.
- `src/lib/supabase/planning.ts` includes helpers for event-linked to-dos and meal-plan ingredients flowing into groceries.

Password reset emails are triggered with `supabase.auth.resetPasswordForEmail()` and redirect to `/auth/update-password`.
Household invite emails are triggered by invoking the existing `send-household-invite` Supabase Edge Function. Keep the Resend API key in Supabase Edge Function secrets, not in `NEXT_PUBLIC_*` variables.

## Product Structure

- `/` dashboard
- `/events`
- `/todos`
- `/meals`
- `/groceries`
- `/household`

The current UI uses sample data in `src/lib/data/sample.ts` so the app has a polished shell before auth and live queries are connected.

## Deploy

When you are ready:

1. Create a GitHub repository and push this project.
2. Create a Vercel project from that repository.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` in Vercel project settings.
4. Deploy.
# famthings
