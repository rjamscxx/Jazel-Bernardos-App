import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Truck, UtensilsCrossed, Printer, Moon, Sun, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useHub } from "@/store/hub";
import { dateLabel } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Landing,
});

const businesses = [
  {
    slug: "express",
    to: "/express",
    name: "Get Dat Express",
    sub: "L300 Van · Lalamove & Rental",
    desc: "Trip logging, earnings tracker, fuel & expense management, maintenance schedule.",
    Icon: Truck,
    accent: "oklch(0.7 0.13 240)",
  },
  {
    slug: "dupart",
    to: "/dupart",
    name: "Dupart",
    sub: "Hotdog Business",
    desc: "Point of sale, daily sales, inventory management, costing & profit analysis.",
    Icon: UtensilsCrossed,
    accent: "oklch(0.72 0.18 35)",
  },
  {
    slug: "ghetto",
    to: "/ghetto",
    name: "Ghetto Print",
    sub: "DTF & Silkscreen Printing",
    desc: "Order tracking, job board, price calculator, materials inventory.",
    Icon: Printer,
    accent: "oklch(0.7 0.16 152)",
  },
] as const;

function Landing() {
  const theme = useHub((s) => s.theme);
  const setTheme = useHub((s) => s.setTheme);
  const sales = useHub((s) => s.dupart.sales);
  const orders = useHub((s) => s.ghetto.orders);
  const trips = useHub((s) => s.express.trips);
  const { user, profile, signOut } = useAuth();

  const [now, setNow] = useState<string>("");
  useEffect(() => {
    setNow(dateLabel());
  }, []);

  const todayRevenue =
    sales
      .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.total, 0) +
    trips
      .filter((t) => t.date === new Date().toISOString().split("T")[0])
      .reduce((sum, t) => sum + t.earnings, 0);

  const activeOrders = orders.filter((o) => o.status !== "Done").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* ambient grid */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, var(--color-foreground) 8%, transparent), transparent 60%)",
        }}
      />

      {/* tiny top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          JBH · v3
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-md border border-hairline bg-secondary/40 px-3 py-1.5">
                <UserIcon className="size-3 text-muted-foreground" />
                <span className="text-[11px] font-mono text-foreground">
                  {profile?.display_name || user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="ring-focus flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground hover:border-border-strong"
              >
                <LogOut className="size-3" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="ring-focus flex items-center gap-1.5 rounded-md border border-border bg-foreground px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-90"
            >
              <LogIn className="size-3" />
              Sign in
            </Link>
          )}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ring-focus rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>

      {/* hero */}
      <section className="relative z-10 px-5 sm:px-8 pt-12 sm:pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 text-[10px] font-mono uppercase text-muted-foreground"
        >
          Jazel Bernardo
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[56px] sm:text-[88px] md:text-[112px] leading-[0.95] text-foreground"
        >
          Business Hub
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 h-px w-40 origin-left bg-gradient-to-r from-transparent via-border-strong to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-7 max-w-xl text-balance text-[14px] leading-relaxed text-muted-foreground"
        >
          Three businesses, one operating system. Built to capture every trip, sale and order
          across the workshop, the kitchen, and the road.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
        >
          {now}
        </motion.div>
      </section>

      {/* live snapshot */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto mb-12 max-w-3xl px-5 sm:px-8"
      >
        <div className="grid grid-cols-3 divide-x divide-hairline rounded-xl border border-border bg-card/60 backdrop-blur">
          <SnapshotCell label="Today's Revenue" value={`₱${todayRevenue.toLocaleString("en-PH")}`} />
          <SnapshotCell label="Active Orders" value={String(activeOrders)} />
          <SnapshotCell label="Businesses" value="3" />
        </div>
      </motion.section>

      {/* business cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="label-mono">Choose a business</h2>
          <span className="label-mono">{businesses.length} modules</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {businesses.map((b, i) => (
            <motion.div
              key={b.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.95 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={b.to}
                className="group relative block h-full overflow-hidden rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elegant"
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${b.accent}, transparent)` }}
                />
                <div className="mb-6 flex items-center justify-between">
                  <div
                    className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary transition-colors group-hover:border-border-strong"
                    style={{ color: b.accent }}
                  >
                    <b.Icon className="size-5" strokeWidth={1.6} />
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </div>
                <div className="font-display text-3xl leading-none">{b.name}</div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  {b.sub}
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{b.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
                  <span>Open module</span>
                  <span className="h-px w-6 bg-border-strong transition-all group-hover:w-10" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-hairline px-5 sm:px-8 py-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
        © {new Date().getFullYear()} Jazel Bernardo · Operations
      </footer>
    </div>
  );
}

function SnapshotCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 text-center">
      <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl leading-none">{value}</div>
    </div>
  );
}
