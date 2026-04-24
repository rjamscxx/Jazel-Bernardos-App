import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="label-mono">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  delay = 0,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  delay?: number;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-[112px] flex-col rounded-xl border border-border bg-card p-5 overflow-hidden"
    >
      {accent && (
        <span
          className="absolute left-0 top-0 h-full w-[2px]"
          style={{ background: accent }}
        />
      )}
      <span className="label-mono leading-none">{label}</span>
      <div className="mt-auto">
        <div className="font-display text-[28px] leading-none whitespace-nowrap">{value}</div>
        {sub && (
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground/80">{sub}</div>
        )}
      </div>
    </motion.div>
  );
}

export function Pills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.1em] transition-all",
              on
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-hairline">
      {tabs.map((t) => {
        const on = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative whitespace-nowrap px-4 py-2.5 text-[13px] font-medium transition-colors",
              on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {on && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-muted-foreground">{children}</div>
  );
}

export function Field({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: ReactNode;
  span?: 1 | 2 | 3;
}) {
  const cls = span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-3" : "";
  return (
    <label className={cn("flex flex-col gap-2", cls)}>
      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputBase =
  "h-11 w-full rounded-md border border-border bg-input px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-border-strong";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  const { children, className, ...rest } = props;
  return (
    <div className="relative">
      <select
        {...rest}
        className={cn(
          inputBase,
          "appearance-none pr-9 cursor-pointer",
          className,
        )}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 12 8"
        fill="none"
      >
        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[88px] w-full rounded-md border border-border bg-input px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-border-strong resize-y",
        props.className,
      )}
    />
  );
}

export function Btn({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md";
}) {
  const variants = {
    primary: "bg-foreground text-background hover:opacity-90",
    secondary: "bg-secondary text-foreground border border-border hover:border-border-strong",
    ghost: "text-muted-foreground hover:text-foreground",
    danger:
      "border border-border bg-transparent text-muted-foreground hover:border-destructive hover:text-destructive",
    success: "bg-success text-success-foreground hover:opacity-90",
  } as const;
  const sizes = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-4 py-2.5 text-[13px]",
  } as const;
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warn" | "info" | "danger" | "muted";
}) {
  const tones: Record<string, string> = {
    default: "bg-secondary border-border text-muted-foreground",
    success:
      "bg-[color-mix(in_oklab,var(--color-success)_18%,transparent)] border-[color-mix(in_oklab,var(--color-success)_45%,transparent)] text-[color-mix(in_oklab,var(--color-success)_85%,white)]",
    warn: "bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] border-[color-mix(in_oklab,var(--color-warning)_45%,transparent)] text-[color-mix(in_oklab,var(--color-warning)_85%,white)]",
    info: "bg-[color-mix(in_oklab,var(--color-info)_18%,transparent)] border-[color-mix(in_oklab,var(--color-info)_45%,transparent)] text-[color-mix(in_oklab,var(--color-info)_85%,white)]",
    danger:
      "bg-[color-mix(in_oklab,var(--color-destructive)_18%,transparent)] border-[color-mix(in_oklab,var(--color-destructive)_45%,transparent)] text-[color-mix(in_oklab,var(--color-destructive)_88%,white)]",
    muted: "bg-muted border-hairline text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.08em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
