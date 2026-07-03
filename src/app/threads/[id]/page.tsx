import Link from "next/link";
import { notFound } from "next/navigation";
import { getThreadWithMessages } from "@/lib/queries";
import { markResolved, reopenThread } from "@/lib/actions";
import { getElapsedMs, getUrgency } from "@/lib/sla";
import CountdownBadge from "@/components/CountdownBadge";
import MessageComposer from "@/components/MessageComposer";
import MessageList from "@/components/MessageList";
import ThreadMetaEditor from "@/components/ThreadMetaEditor";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await getThreadWithMessages(id);
  if (!thread) notFound();

  const urgency = getUrgency(getElapsedMs(thread, thread.messages));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/clients/${thread.client.id}`} className="text-sm text-primary-600 hover:underline">
          ← {thread.client.name}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold break-words">{thread.title}</h1>
          <p className="text-sm text-muted mt-0.5">
            {thread.client.name}
            {thread.client.company ? ` · ${thread.client.company}` : ""}
            {thread.client.contact_info ? ` · ${thread.client.contact_info}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {thread.status === "open" ? (
            <>
              <CountdownBadge thread={thread} messages={thread.messages} />
              <form action={markResolved}>
                <input type="hidden" name="thread_id" value={thread.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border hover:bg-surface-muted text-sm font-medium px-3.5 py-2 transition-colors"
                >
                  Mark resolved
                </button>
              </form>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg text-success px-2.5 py-0.5 text-xs font-medium">
                Resolved
              </span>
              <form action={reopenThread}>
                <input type="hidden" name="thread_id" value={thread.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border hover:bg-surface-muted text-sm font-medium px-3.5 py-2 transition-colors"
                >
                  Reopen
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <ThreadMetaEditor threadId={thread.id} severity={thread.severity} tag={thread.tag} />
        {thread.status === "open" && urgency === "red" && (
          <span className="text-xs text-danger font-medium">
            SLA breached — follow up now.
          </span>
        )}
      </div>

      {thread.status === "open" && <MessageComposer threadId={thread.id} />}

      <MessageList messages={thread.messages} />
    </div>
  );
}
