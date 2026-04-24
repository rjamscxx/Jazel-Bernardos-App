import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bell, Moon, Sun, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHub } from "@/store/hub";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  title: string;
  subtitle: string;
  alerts?: { id: string | number; level: "danger" | "warn" | "info"; text: string }[];
  rightSlot?: ReactNode;
};

export function HubHeader({ title, subtitle, alerts = [] }: Props) {
  const router = useRouter();
  const theme = useHub((s) => s.theme);
  const setTheme = useHub((s) => s.setTheme);
  const { profile, user, signOut } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const canGoBack = router.history.length > 1;

  return (
    <header className="glass sticky top-0 z-50 border-b border-hairline">
      <div className="flex items-center px-5 sm:px-6 py-3">
        <button
          onClick={() => (canGoBack ? router.history.back() : router.navigate({ to: "/" }))}
          className="ring-focus group flex min-w-[64px] items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex flex-1 flex-col items-center">
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl leading-none text-foreground transition-opacity hover:opacity-70"
          >
            {title}
          </Link>
          <span className="mt-1 text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            {subtitle}
          </span>
        </div>

        <div className="flex min-w-[64px] items-center justify-end gap-1">
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="ring-focus relative rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {alerts.length > 0 && (
                <span className="absolute right-1 top-1 flex size-1.5 rounded-full bg-destructive animate-pulse-soft" />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setNotifOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-border bg-popover shadow-elegant"
                  >
                    <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                      <span className="label-mono">Alerts</span>
                      <span className="label-mono">{alerts.length}</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                          No new alerts
                        </div>
                      ) : (
                        alerts.map((a) => (
                          <div
                            key={a.id}
                            className="flex gap-2 border-b border-hairline px-4 py-3 text-[12px] leading-relaxed text-muted-foreground last:border-0"
                          >
                            <span
                              className="mt-1 size-1.5 shrink-0 rounded-full"
                              style={{
                                background:
                                  a.level === "danger"
                                    ? "var(--color-destructive)"
                                    : a.level === "warn"
                                      ? "var(--color-warning)"
                                      : "var(--color-info)",
                              }}
                            />
                            <span>{a.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ring-focus rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {user && (
            <button
              onClick={() => signOut()}
              className="ring-focus rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Sign out ${profile?.display_name ?? user.email ?? ""}`}
              title={profile?.display_name ?? user.email ?? "Sign out"}
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
