"use client";

import { useTransition } from "react";
import { updateClientType } from "@/lib/actions";
import type { ClientType } from "@/lib/types";

export default function ClientTypeSelect({
  clientId,
  type,
}: {
  clientId: string;
  type: ClientType;
}) {
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const fd = new FormData();
    fd.set("client_id", clientId);
    fd.set("client_type", e.target.value);
    startTransition(() => {
      updateClientType(fd);
    });
  }

  return (
    <select
      value={type}
      onChange={handleChange}
      aria-label="Client type"
      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="b2b">B2B</option>
      <option value="b2c">B2C</option>
    </select>
  );
}
