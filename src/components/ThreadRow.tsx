import Link from "next/link";
import CountdownBadge from "@/components/CountdownBadge";
import { SeverityBadge, TagBadge } from "@/components/SeverityTag";
import type { ThreadWithMessages } from "@/lib/types";

export default function ThreadRow({ thread }: { thread: ThreadWithMessages }) {
  const messages = [...thread.messages].sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  );
  const last = messages[0];

  return (
    <Link
      href={`/threads/${thread.id}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5 hover:border-primary-400 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">{thread.client.name}</span>
          {thread.client.company && (
            <span className="text-xs text-muted truncate">{thread.client.company}</span>
          )}
          {thread.severity && <SeverityBadge severity={thread.severity} />}
          {thread.tag && <TagBadge tag={thread.tag} />}
        </div>
        <p className="text-sm text-muted truncate mt-0.5">{thread.title}</p>
        {last && (
          <p className="text-xs text-muted/80 truncate mt-1">
            {last.is_update ? "↻ " : ""}
            {last.body}
          </p>
        )}
      </div>
      <div className="shrink-0">
        <CountdownBadge thread={thread} messages={thread.messages} />
      </div>
    </Link>
  );
}
