"use client";

import { useEffect, useState } from "react";
import { getElapsedMs, getRemainingMs, getUrgency, formatRemaining } from "@/lib/sla";
import type { Message, Thread } from "@/lib/types";
import StatusPill from "@/components/StatusPill";

export default function CountdownBadge({
  thread,
  messages,
}: {
  thread: Thread;
  messages: Message[];
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Deliberately set on mount (not during render) so the server-rendered
    // placeholder and first client render match, avoiding a hydration diff.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    // Avoid a hydration mismatch: render nothing time-dependent on the server.
    return <span className="inline-block h-5 w-24 rounded-full bg-surface-muted animate-pulse" />;
  }

  const remaining = getRemainingMs(thread, messages, now);
  const elapsed = getElapsedMs(thread, messages, now);
  const urgency = getUrgency(elapsed);

  return (
    <div className="flex items-center gap-2">
      <StatusPill urgency={urgency} />
      <span className="text-xs text-muted tabular-nums">{formatRemaining(remaining)}</span>
    </div>
  );
}
