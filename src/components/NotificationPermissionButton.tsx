"use client";

import { useEffect, useState } from "react";

export default function NotificationPermissionButton() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    // Notification.permission isn't known during SSR; read it after mount.
    if (typeof window !== "undefined" && "Notification" in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(Notification.permission);
    }
  }, []);

  if (permission === null || permission === "granted") return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
      }}
      title="Get a browser alert when a thread breaches its SLA"
      className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
    >
      🔔 Enable alerts
    </button>
  );
}
