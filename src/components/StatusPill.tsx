import type { Urgency } from "@/lib/sla";

const STYLES: Record<Urgency, string> = {
  green: "bg-success-bg text-success",
  yellow: "bg-warning-bg text-warning",
  red: "bg-danger-bg text-danger",
};

const LABELS: Record<Urgency, string> = {
  green: "On track",
  yellow: "At risk",
  red: "Overdue",
};

export default function StatusPill({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[urgency]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[urgency]}
    </span>
  );
}
