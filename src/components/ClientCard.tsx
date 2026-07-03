import Link from "next/link";
import { format } from "date-fns";
import type { ClientWithThreadSummary } from "@/lib/types";
import { CLIENT_TYPE_CONTAINER_STYLES } from "@/components/ClientTypeBadge";
import { SeverityBadge, TagBadge } from "@/components/SeverityTag";
import ClientTypeSelect from "@/components/ClientTypeSelect";
import ClientFormDialog from "@/components/ClientFormDialog";
import DeleteClientButton from "@/components/DeleteClientButton";
import NewIssueDialog from "@/components/NewIssueDialog";

const VISIBLE_ISSUES = 2;

export default function ClientCard({ client }: { client: ClientWithThreadSummary }) {
  const visible = client.openThreads.slice(0, VISIBLE_ISSUES);
  const hiddenOpenCount = client.openThreads.length - visible.length;

  return (
    <div
      className={`rounded-xl border-2 p-5 space-y-4 transition-colors ${CLIENT_TYPE_CONTAINER_STYLES[client.client_type]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/clients/${client.id}`}
            className="font-semibold text-foreground hover:underline truncate block"
          >
            {client.name}
          </Link>
          <p className="text-xs text-muted truncate mt-0.5">
            {[client.company, client.contact_info].filter(Boolean).join(" · ") || "No additional details"}
          </p>
        </div>
        <ClientTypeSelect clientId={client.id} type={client.client_type} />
      </div>

      <div className="space-y-2">
        {visible.length === 0 ? (
          <p className="text-sm text-muted">No open issues.</p>
        ) : (
          visible.map((t) => (
            <Link
              key={t.id}
              href={`/threads/${t.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 hover:border-primary-400 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate text-sm">{t.title}</span>
                {t.severity && <SeverityBadge severity={t.severity} />}
                {t.tag && <TagBadge tag={t.tag} />}
              </span>
              <span className="text-xs text-muted shrink-0">
                {format(new Date(t.created_at), "MMM d")}
              </span>
            </Link>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <Link href={`/clients/${client.id}`} className="text-primary-600 hover:underline">
          {hiddenOpenCount > 0
            ? `+${hiddenOpenCount} more open · history`
            : `History (${client.resolvedCount})`}
        </Link>
        <div className="flex items-center gap-3">
          <ClientFormDialog
            mode="edit"
            client={client}
            triggerLabel="Edit"
            triggerClassName="text-muted hover:text-foreground"
          />
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      <NewIssueDialog
        client={client}
        triggerLabel="New issue"
        triggerClassName="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface hover:border-primary-400 text-sm font-medium px-3.5 py-2 transition-colors"
      />
    </div>
  );
}
