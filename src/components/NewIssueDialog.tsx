"use client";

import { useRef, useState } from "react";
import { createIssue } from "@/lib/actions";
import type { Client } from "@/lib/types";

export default function NewIssueDialog({
  clients,
  fixedClient,
  triggerLabel = "New issue",
  triggerClassName,
}: {
  clients: Client[];
  /** When set, skips the client picker and locks the issue to this client. */
  fixedClient?: Client;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [useNewClient, setUseNewClient] = useState(!fixedClient && clients.length === 0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await createIssue(formData);
      // createIssue redirects on success; if we get here without throwing
      // there's nothing left to do.
    } catch (err) {
      // Next.js redirect() throws a special error; let it propagate.
      if (err && typeof err === "object" && "digest" in err) throw err;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          triggerClassName ??
          "inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3.5 py-2 transition-colors"
        }
      >
        <span className="text-base leading-none">+</span> {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/40 bg-transparent p-0 m-auto rounded-xl w-full max-w-lg"
        onClose={() => setPending(false)}
      >
        <form
          action={handleSubmit}
          className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Log a new issue</h2>
            <button
              type="button"
              onClick={close}
              className="text-muted hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {fixedClient ? (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Client</label>
              <input type="hidden" name="client_id" value={fixedClient.id} />
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {fixedClient.name}
                {fixedClient.company ? ` — ${fixedClient.company}` : ""}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-muted">Client</label>
                {clients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseNewClient((v) => !v)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {useNewClient ? "Pick existing client" : "New client"}
                  </button>
                )}
              </div>

              {useNewClient ? (
                <div className="space-y-2">
                  <input
                    name="new_client_name"
                    required
                    placeholder="Client name"
                    autoFocus
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="new_client_company"
                      placeholder="Company (optional)"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      name="new_client_contact"
                      placeholder="Email / phone / Slack"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <select
                  name="client_id"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` — ${c.company}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Summary</label>
            <input
              name="title"
              required
              placeholder="e.g. Export button throws 500"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Severity</label>
              <select
                name="severity"
                defaultValue=""
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">None</option>
                <option value="P0">P0 — Critical</option>
                <option value="P1">P1 — High</option>
                <option value="P2">P2 — Medium</option>
                <option value="P3">P3 — Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Type</label>
              <select
                name="tag"
                defaultValue=""
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">None</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature request</option>
                <option value="question">Question</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              What did you tell them?
            </label>
            <textarea
              name="body"
              rows={3}
              placeholder="Log the message you sent the client…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                name="is_update"
                defaultChecked
                className="rounded border-border accent-[var(--primary-600)]"
              />
              Counts as a progress update (starts the SLA clock now)
            </label>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3.5 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3.5 py-2 transition-colors disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create issue"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
