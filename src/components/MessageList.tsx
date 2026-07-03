"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { Message } from "@/lib/types";

export default function MessageList({ messages }: { messages: Message[] }) {
  const [newestFirst, setNewestFirst] = useState(true);

  const sorted = [...messages].sort((a, b) => {
    const diff = new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime();
    return newestFirst ? -diff : diff;
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setNewestFirst((v) => !v)}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          {newestFirst ? "Newest first" : "Oldest first"} · switch order
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">No messages logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((m) => (
            <li key={m.id} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-muted">
                  {format(new Date(m.sent_at), "MMM d, yyyy · h:mm a")}
                </span>
                {m.is_update && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 text-primary-700 dark:text-primary-800 px-2 py-0.5 text-[11px] font-medium">
                    ↻ Update
                  </span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
