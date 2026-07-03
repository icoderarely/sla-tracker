import Link from "next/link";
import { getClientsWithThreadSummaries } from "@/lib/queries";
import ClientCard from "@/components/ClientCard";
import ClientFormDialog from "@/components/ClientFormDialog";
import type { ClientType } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: ClientType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "B2B", value: "b2b" },
  { label: "B2C", value: "b2c" },
];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const typeFilter = sp.type === "b2b" || sp.type === "b2c" ? sp.type : "all";

  const clients = await getClientsWithThreadSummaries();
  const filtered =
    typeFilter === "all" ? clients : clients.filter((c) => c.client_type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold">Clients</h1>
          <p className="text-sm text-muted">
            {clients.length === 0
              ? "No clients yet."
              : `${clients.length} client${clients.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <ClientFormDialog mode="create" triggerLabel="+ New client" />
      </div>

      <div className="flex items-center gap-1 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/clients" : `/clients?type=${f.value}`}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              typeFilter === f.value
                ? "bg-primary-600 text-white"
                : "text-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
          {clients.length === 0
            ? "Add your first client to start logging issues."
            : "No clients match this filter."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
