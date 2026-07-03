import type { ClientType } from "@/lib/types";

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  b2b: "B2B",
  b2c: "B2C",
};

const BADGE_STYLES: Record<ClientType, string> = {
  b2b: "bg-b2b-bg text-b2b",
  b2c: "bg-b2c-bg text-b2c",
};

export const CLIENT_TYPE_CONTAINER_STYLES: Record<ClientType, string> = {
  b2b: "border-b2b-border bg-b2b-bg/40",
  b2c: "border-b2c-border bg-b2c-bg/40",
};

export function ClientTypeBadge({ type }: { type: ClientType }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${BADGE_STYLES[type]}`}
    >
      {CLIENT_TYPE_LABEL[type]}
    </span>
  );
}
