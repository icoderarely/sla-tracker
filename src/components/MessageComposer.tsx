"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addMessage } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50"
    >
      {pending ? "Logging…" : "Log message"}
    </button>
  );
}

export default function MessageComposer({ threadId }: { threadId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isUpdate, setIsUpdate] = useState(true);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addMessage(formData);
        formRef.current?.reset();
        setIsUpdate(true);
      }}
      className="rounded-xl border border-border bg-surface p-4 space-y-3"
    >
      <input type="hidden" name="thread_id" value={threadId} />
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Log what you told the client… (⌘/Ctrl + Enter to submit)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            name="is_update"
            checked={isUpdate}
            onChange={(e) => setIsUpdate(e.target.checked)}
            className="rounded border-border accent-[var(--primary-600)]"
          />
          Mark as update (resets the 2-hour SLA clock)
        </label>
        <SubmitButton />
      </div>
    </form>
  );
}
