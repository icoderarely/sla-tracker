import Link from "next/link";
import { format } from "date-fns";
import { getClients, getHistory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const clientId = typeof sp.client_id === "string" ? sp.client_id : undefined;
  const status = sp.status === "open" || sp.status === "resolved" ? sp.status : undefined;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const [clients, rows] = await Promise.all([
    getClients(),
    getHistory({ clientId, status, from, to: to ? `${to}T23:59:59` : undefined, query: q }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Full history</h1>
        <p className="text-sm text-muted">Every message logged, across every client.</p>
      </div>

      <form method="get" className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-xl border border-border bg-surface p-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search messages…"
          className="col-span-2 sm:col-span-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          name="client_id"
          defaultValue={clientId ?? ""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="col-span-2 sm:col-span-5 flex justify-end gap-2">
          <Link href="/history" className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2">
            Clear
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Filter
          </button>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">No messages match those filters.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ message, thread, client }) => (
            <li key={message.id}>
              <Link
                href={`/threads/${thread.id}`}
                className="block rounded-xl border border-border bg-surface px-4 py-3 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-muted mb-1">
                  <span>
                    <span className="font-medium text-foreground">{client.name}</span>
                    {" · "}
                    {thread.title}
                    {" · "}
                    <span className={thread.status === "open" ? "text-success" : ""}>
                      {thread.status}
                    </span>
                  </span>
                  <span>{format(new Date(message.sent_at), "MMM d, yyyy · h:mm a")}</span>
                </div>
                <p className="text-sm truncate">
                  {message.is_update ? "↻ " : ""}
                  {message.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
