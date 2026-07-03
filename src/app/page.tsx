import Link from "next/link";
import { getClients, getOpenThreadsWithMessages } from "@/lib/queries";
import { getRemainingMs } from "@/lib/sla";
import ThreadRow from "@/components/ThreadRow";
import NewIssueDialog from "@/components/NewIssueDialog";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [threads, clients] = await Promise.all([
    getOpenThreadsWithMessages(),
    getClients(),
  ]);

  const now = new Date();
  const sorted = [...threads].sort(
    (a, b) =>
      getRemainingMs(a, a.messages, now) - getRemainingMs(b, b.messages, now)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Open threads</h1>
          <p className="text-sm text-muted">
            {sorted.length === 0
              ? "Nothing open right now."
              : `${sorted.length} open, sorted by SLA urgency.`}
          </p>
        </div>
        <NewIssueDialog clients={clients} />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
          No open issues. When a client pings you, hit “New issue” to start the clock.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      <div className="pt-2 text-center">
        <Link href="/history?status=resolved" className="text-sm text-muted hover:text-foreground transition-colors">
          View resolved threads →
        </Link>
      </div>
    </div>
  );
}
