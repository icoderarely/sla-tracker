import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getClientWithThreads } from "@/lib/queries";
import { SeverityBadge, TagBadge } from "@/components/SeverityTag";
import { ClientTypeBadge } from "@/components/ClientTypeBadge";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getClientWithThreads(id);
  if (!result) notFound();
  const { client, threads } = result;

  const open = threads.filter((t) => t.status === "open");
  const resolved = threads.filter((t) => t.status === "resolved");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-primary-600 hover:underline">
          ← Dashboard
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{client.name}</h1>
          <ClientTypeBadge type={client.client_type} />
        </div>
        <p className="text-sm text-muted mt-0.5">
          {[client.company, client.contact_info].filter(Boolean).join(" · ") || "No additional details"}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Open ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted">No open threads.</p>
        ) : (
          <ul className="space-y-2">
            {open.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/threads/${t.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:border-primary-400 transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{t.title}</span>
                    {t.severity && <SeverityBadge severity={t.severity} />}
                    {t.tag && <TagBadge tag={t.tag} />}
                  </span>
                  <span className="text-xs text-muted shrink-0">
                    {format(new Date(t.created_at), "MMM d, yyyy")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          History ({resolved.length})
        </h2>
        {resolved.length === 0 ? (
          <p className="text-sm text-muted">No resolved threads yet.</p>
        ) : (
          <ul className="space-y-2">
            {resolved.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/threads/${t.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 hover:border-primary-400 transition-colors opacity-80"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{t.title}</span>
                    {t.severity && <SeverityBadge severity={t.severity} />}
                    {t.tag && <TagBadge tag={t.tag} />}
                  </span>
                  <span className="text-xs text-muted shrink-0">
                    Resolved {t.resolved_at ? format(new Date(t.resolved_at), "MMM d, yyyy") : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
