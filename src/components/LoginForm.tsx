"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "magic-link";

const MAGIC_LINK_COOLDOWN_SECONDS = 60;

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /rate limit/i.test(message);
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "magic-link" && cooldownRemaining > 0) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const next = searchParams.get("next") || "/";
        router.push(next);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMagicLinkSent(true);
        setCooldownRemaining(MAGIC_LINK_COOLDOWN_SECONDS);
      }
    } catch (err) {
      if (mode === "magic-link" && isRateLimitError(err)) {
        setError("Too many magic link requests. Please wait a minute before trying again.");
        setCooldownRemaining(MAGIC_LINK_COOLDOWN_SECONDS);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm">
          Check <span className="font-medium">{email}</span> for a sign-in link.
        </p>
        {cooldownRemaining > 0 && (
          <p className="mt-2 text-xs text-muted">
            You can request another link in {cooldownRemaining}s.
          </p>
        )}
        <button
          type="button"
          onClick={() => setMagicLinkSent(false)}
          className="mt-4 text-sm text-primary-600 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-muted mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {mode === "password" && (
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-muted mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading || (mode === "magic-link" && cooldownRemaining > 0)}
        className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
      >
        {loading
          ? "Signing in…"
          : mode === "magic-link" && cooldownRemaining > 0
            ? `Try again in ${cooldownRemaining}s`
            : mode === "password"
              ? "Sign in"
              : "Send magic link"}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
        className="w-full text-center text-xs text-muted hover:text-foreground transition-colors"
      >
        {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
      </button>
    </form>
  );
}
