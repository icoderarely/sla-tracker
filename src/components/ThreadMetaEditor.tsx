"use client";

import { useTransition } from "react";
import { updateThreadMeta } from "@/lib/actions";
import type { IssueTag, Severity } from "@/lib/types";

export default function ThreadMetaEditor({
  threadId,
  severity,
  tag,
}: {
  threadId: string;
  severity: Severity | null;
  tag: IssueTag | null;
}) {
  const [, startTransition] = useTransition();

  function submit(fd: FormData) {
    startTransition(() => {
      updateThreadMeta(fd);
    });
  }

  function update(field: "severity" | "tag", value: string) {
    const fd = new FormData();
    fd.set("thread_id", threadId);
    fd.set("severity", field === "severity" ? value : severity ?? "");
    fd.set("tag", field === "tag" ? value : tag ?? "");
    submit(fd);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={severity ?? ""}
        onChange={(e) => update("severity", e.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">No severity</option>
        <option value="P0">P0 — Critical</option>
        <option value="P1">P1 — High</option>
        <option value="P2">P2 — Medium</option>
        <option value="P3">P3 — Low</option>
      </select>
      <select
        value={tag ?? ""}
        onChange={(e) => update("tag", e.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">No type</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature request</option>
        <option value="question">Question</option>
      </select>
    </div>
  );
}
