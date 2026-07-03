import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import NotificationPermissionButton from "@/components/NotificationPermissionButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">
            S
          </span>
          <span className="hidden sm:inline">SLA Tracker</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/clients"
              className="px-3 py-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            >
              Clients
            </Link>
            <Link
              href="/history"
              className="px-3 py-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            >
              History
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {user && <NotificationPermissionButton />}
          <ThemeToggle />
          {user && (
            <>
              <span className="hidden md:inline text-xs text-muted max-w-[160px] truncate">
                {user.email}
              </span>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
