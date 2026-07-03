# Client Communication & SLA Tracker

Personal app for a support/client-facing role: log what you told a client, and
keep a running 2-hour SLA clock on every open thread until you follow up
again or mark it resolved.

## Stack

- Next.js 16 (App Router) + TypeScript, deployed on Vercel
- Supabase (Postgres + Auth)
- Tailwind CSS v4 (purple theme, class-based dark mode)
- date-fns

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema**: open the SQL editor in your project and run the
   contents of `supabase/schema.sql`. This creates `clients`, `threads`,
   `messages`, and RLS policies that allow any authenticated user full access
   (suited to single-user or small shared-team use).
3. **Create a user**: Authentication → Users → Add user (or enable sign-ups
   and use the magic-link flow from the login page). There's no public
   sign-up form in the app itself, by design.
4. **Copy env vars**: `cp .env.example .env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project
   Settings → API.
5. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```

## SLA alerting

Alerting is entirely browser-based: while a tab has the app open,
`NotificationWatcher` polls open threads and fires a native browser
Notification (via the Notification API) the instant one crosses the 2-hour
mark. Click "Enable alerts" in the nav bar to grant permission.

There's no cron job, external scheduler, or third-party integration
(Slack/email/webhook) — Vercel Cron's frequency limits on the Hobby plan
made that path unreliable for a 2-hour SLA, so this app deliberately doesn't
depend on background jobs. The dashboard's urgency coloring is always
correct the moment you open it regardless, since it's computed live from
message timestamps rather than a cached flag. The tradeoff: if no tab is
open, you won't get a push alert — you'll see it as soon as you check in.

## Data model

- **clients** — name, company, contact info.
- **threads** — one open issue per client at a time (plus resolved history).
  Status, optional severity (P0-P3) and tag (bug/feature/question).
- **messages** — append-only log of what you told the client. `is_update`
  flags whether a message resets the SLA clock.

The SLA clock for a thread runs from its most recent `is_update` message, or
from thread creation if none has been logged yet. Urgency thresholds: green
0-1hr, yellow 1-1.75hr, red 1.75hr+ (including overdue).

## Non-goals (v1)

No outbound messaging (email/SMS) — this only logs and tracks what you
already said. No multi-tenant features beyond shared auth.
