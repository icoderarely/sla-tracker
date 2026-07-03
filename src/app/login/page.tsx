import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white text-lg font-bold mb-3">
            S
          </span>
          <h1 className="text-xl font-semibold">SLA Tracker</h1>
          <p className="text-sm text-muted mt-1">Sign in to track client conversations.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
