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
4. **Copy env vars**: `cp .env.example .env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project
     Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page; used only server-side by the
     SLA cron route.
   - `CRON_SECRET` — any long random string; the external scheduler must send
     it back as `Authorization: Bearer <value>`.
   - `SLA_ALERT_WEBHOOK_URL` — optional. If set, the cron route POSTs a JSON
     payload here whenever a thread crosses the 2-hour mark (point it at a
     Slack incoming webhook, or a Zapier/Make hook that forwards to
     email/SMS).
5. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```

## SLA background checks (cron)

The app watches SLA deadlines client-side via the browser Notification API
while a tab is open (`NotificationWatcher`), but that can't fire if nobody
has the app open — so `/api/cron/sla-check` exists to be polled externally
every 10-15 minutes. It flags newly-overdue threads and optionally calls
`SLA_ALERT_WEBHOOK_URL`.

**Vercel Hobby plan caps cron jobs at once per day**, which is too coarse for
a 2-hour SLA. Options:

- Upgrade to Vercel Pro (supports frequent crons) and keep the included
  `vercel.json` (`*/15 * * * *`).
- Use a free external scheduler (e.g. [cron-job.org](https://cron-job.org),
  a GitHub Actions scheduled workflow, or a Supabase scheduled Edge Function)
  to hit `https://<your-app>/api/cron/sla-check` every 10-15 minutes with
  header `Authorization: Bearer <CRON_SECRET>`.

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
