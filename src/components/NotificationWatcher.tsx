"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getElapsedMs, SLA_MS } from "@/lib/sla";
import type { Message, Thread } from "@/lib/types";

const POLL_MS = 60_000;

/**
 * Client-side companion to the /api/cron/sla-check route: while this tab is
 * open, it polls open threads and fires a browser Notification the moment
 * one crosses the 2-hour mark, without waiting for the external cron pass.
 */
export default function NotificationWatcher() {
  const notifiedRef = useRef<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cancelled = false;
    const supabase = createClient();

    async function check() {
      if (cancelled) return;
      if (Notification.permission !== "granted") return;

      const { data: threads } = await supabase
        .from("threads")
        .select("*, client:clients(*), messages(*)")
        .eq("status", "open");

      if (!threads) return;

      const now = new Date();
      for (const t of threads as unknown as (Thread & {
        client: { name: string };
        messages: Message[];
      })[]) {
        const elapsed = getElapsedMs(t, t.messages, now);
        if (elapsed >= SLA_MS && !notifiedRef.current.has(t.id)) {
          notifiedRef.current.add(t.id);
          new Notification(`SLA breached: ${t.client?.name ?? "Client"}`, {
            body: t.title,
            tag: `sla-${t.id}`,
          });
        }
      }
    }

    check();
    const interval = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
