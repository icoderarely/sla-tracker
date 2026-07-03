import type { Message, Thread } from "@/lib/types";

export const SLA_MINUTES = 120;
export const SLA_MS = SLA_MINUTES * 60 * 1000;

export const URGENCY_YELLOW_AT_MS = 60 * 60 * 1000; // 1hr
export const URGENCY_RED_AT_MS = 105 * 60 * 1000; // 1.75hr

export type Urgency = "green" | "yellow" | "red";

/**
 * The SLA clock resets on the most recent message flagged `is_update`.
 * Before any update has been logged, the clock runs from thread creation.
 */
export function getLastUpdateAt(thread: Thread, messages: Message[]): Date {
  const updates = messages
    .filter((m) => m.is_update)
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

  if (updates.length > 0) {
    return new Date(updates[0].sent_at);
  }
  return new Date(thread.created_at);
}

export function getDeadline(thread: Thread, messages: Message[]): Date {
  return new Date(getLastUpdateAt(thread, messages).getTime() + SLA_MS);
}

export function getRemainingMs(
  thread: Thread,
  messages: Message[],
  now: Date = new Date()
): number {
  return getDeadline(thread, messages).getTime() - now.getTime();
}

export function getElapsedMs(
  thread: Thread,
  messages: Message[],
  now: Date = new Date()
): number {
  return now.getTime() - getLastUpdateAt(thread, messages).getTime();
}

export function getUrgency(elapsedMs: number): Urgency {
  if (elapsedMs >= URGENCY_RED_AT_MS) return "red";
  if (elapsedMs >= URGENCY_YELLOW_AT_MS) return "yellow";
  return "green";
}

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const totalMinutes = Math.floor(abs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const sign = ms < 0 ? "-" : "";
  if (hours === 0) return `${sign}${minutes}m`;
  return `${sign}${hours}h ${minutes}m`;
}

/** e.g. "1h 12m left" or "23m overdue" */
export function formatRemaining(remainingMs: number): string {
  if (remainingMs < 0) {
    return `${formatDuration(remainingMs).replace("-", "")} overdue`;
  }
  return `${formatDuration(remainingMs)} left`;
}
