import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getElapsedMs, getUrgency } from "@/lib/sla";
import type { Message, Thread } from "@/lib/types";

/**
 * Polled by an external scheduler (Vercel Cron / cron-job.org / a Supabase
 * scheduled Edge Function) every 10-15 minutes, since the SLA clock has to
 * keep running even when nobody has the app open. Flags threads that just
 * crossed the 2-hour mark and, if SLA_ALERT_WEBHOOK_URL is configured, POSTs
 * a notification payload to it (e.g. a Slack incoming webhook, or a
 * Zapier/Make hook that forwards to email/SMS).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: threads, error } = await supabase
    .from("threads")
    .select("*, client:clients(*), messages(*)")
    .eq("status", "open");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const newlyBreached: { id: string; client: string; title: string }[] = [];

  for (const t of (threads ?? []) as unknown as (Thread & {
    client: { name: string };
    messages: Message[];
  })[]) {
    const elapsed = getElapsedMs(t, t.messages, now);
    const urgency = getUrgency(elapsed);
    if (urgency === "red" && elapsed >= 120 * 60 * 1000 && !t.sla_breach_notified_at) {
      newlyBreached.push({ id: t.id, client: t.client?.name ?? "Unknown", title: t.title });
      await supabase
        .from("threads")
        .update({ sla_breach_notified_at: now.toISOString() })
        .eq("id", t.id);
    }
  }

  if (newlyBreached.length > 0 && process.env.SLA_ALERT_WEBHOOK_URL) {
    await fetch(process.env.SLA_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${newlyBreached.length} SLA breach(es): ${newlyBreached
          .map((t) => `${t.client} — ${t.title}`)
          .join("; ")}`,
        breaches: newlyBreached,
      }),
    }).catch(() => {
      // Best-effort notification; don't fail the cron run over it.
    });
  }

  return NextResponse.json({
    checked: threads?.length ?? 0,
    newlyBreached,
  });
}
