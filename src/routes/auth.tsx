import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Jazel Bernardo Hub" },
      {
        name: "description",
        content: "Sign in to manage your Get Dat Express, Dupart and Ghetto Print operations.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  if (!loading && user) return <Navigate to="/" />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate({ to: "/" });
    } else {
      const { error } = await signUp(email, password, displayName || email.split("@")[0]);
      if (error) setError(error);
      else {
        setInfo("Account created. You can sign in now.");
        setMode("signin");
      }
    }
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">
      {/* Background flourish */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, color-mix(in oklab, var(--color-primary) 14%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, color-mix(in oklab, var(--color-info) 10%, transparent) 0%, transparent 55%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49.7%,color-mix(in_oklab,var(--color-border)_80%,transparent)_50%,transparent_50.3%)] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="label-mono">Jazel Bernardo</div>
          <h1 className="font-display mt-2 text-4xl leading-none">Business Hub</h1>
          <p className="mt-3 text-[12px] text-muted-foreground">
            One operating system for three businesses.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 shadow-elegant">
          <div className="mb-6 flex items-center gap-1 rounded-lg border border-hairline bg-secondary/40 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setInfo(null);
                }}
                className={`ring-focus relative flex-1 rounded-md px-3 py-2 text-[11px] font-mono uppercase tracking-[0.16em] transition-colors ${
                  mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-md bg-background border border-border"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{m === "signin" ? "Sign In" : "Sign Up"}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <FormField
                    icon={<UserIcon className="size-3.5" />}
                    label="Display name"
                    type="text"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Jazel"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <FormField
              icon={<Mail className="size-3.5" />}
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@business.com"
              autoComplete="email"
              required
            />
            <FormField
              icon={<Lock className="size-3.5" />}
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {info && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-[12px] text-success"
              >
                {info}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="ring-focus group flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12px] font-mono uppercase tracking-[0.16em] text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Each owner gets a private hub.
        </p>
      </motion.div>
    </div>
  );
}

function FormField({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="label-mono mb-1.5 block">{label}</span>
      <div className="group relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="ring-focus w-full rounded-md border border-border bg-secondary/40 py-2.5 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-border-strong focus:bg-background"
        />
      </div>
    </label>
  );
}
