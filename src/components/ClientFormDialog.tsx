"use client";

import { useRef, useState } from "react";
import { createClientRecord, updateClientRecord } from "@/lib/actions";
import type { Client } from "@/lib/types";

export default function ClientFormDialog({
  mode,
  client,
  triggerLabel,
  triggerClassName,
}: {
  mode: "create" | "edit";
  client?: Client;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
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
      if (mode === "edit" && client) {
        formData.set("client_id", client.id);
        await updateClientRecord(formData);
      } else {
        await createClientRecord(formData);
      }
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
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
        {triggerLabel ?? (mode === "create" ? "+ New client" : "Edit")}
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/40 bg-transparent border-0 p-0 m-auto rounded-xl w-full max-w-md"
        onClose={() => setPending(false)}
      >
        <form
          action={handleSubmit}
          className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {mode === "create" ? "New client" : "Edit client"}
            </h2>
            <button
              type="button"
              onClick={close}
              className="text-muted hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Name</label>
            <input
              name="name"
              required
              autoFocus
              defaultValue={client?.name}
              placeholder="Client or org name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Company</label>
              <input
                name="company"
                defaultValue={client?.company ?? ""}
                placeholder="Optional"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Contact</label>
              <input
                name="contact_info"
                defaultValue={client?.contact_info ?? ""}
                placeholder="Email / phone / Slack"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Type</label>
            <select
              name="client_type"
              defaultValue={client?.client_type ?? "b2b"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="b2b">B2B</option>
              <option value="b2c">B2C</option>
            </select>
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
              {pending ? "Saving…" : mode === "create" ? "Create client" : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
