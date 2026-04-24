import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useHub } from "@/store/hub";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const dataLoaded = useHub((s) => s.loaded);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="label-mono animate-pulse-soft">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!dataLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="label-mono animate-pulse-soft">Syncing your data…</div>
      </div>
    );
  }

  return <>{children}</>;
}
