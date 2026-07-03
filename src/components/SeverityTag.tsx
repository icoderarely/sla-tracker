import type { IssueTag, Severity } from "@/lib/types";

const SEVERITY_STYLES: Record<Severity, string> = {
  P0: "bg-danger-bg text-danger",
  P1: "bg-warning-bg text-warning",
  P2: "bg-primary-100 text-primary-700 dark:text-primary-800",
  P3: "bg-surface-muted text-muted",
};

const TAG_LABELS: Record<IssueTag, string> = {
  bug: "Bug",
  feature: "Feature request",
  question: "Question",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

export function TagBadge({ tag }: { tag: IssueTag }) {
  return (
    <span className="inline-flex items-center rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-muted">
      {TAG_LABELS[tag]}
    </span>
  );
}
