"use client";

import { useTransition } from "react";
import { deleteClientRecord } from "@/lib/actions";

export default function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !window.confirm(
        `Delete ${clientName}? This also deletes all their issues and message history.`
      )
    ) {
      return;
    }
    const fd = new FormData();
    fd.set("client_id", clientId);
    startTransition(() => {
      deleteClientRecord(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-danger hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
