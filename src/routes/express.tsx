import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Truck, Wallet, Calendar, Users, Wrench, BarChart3 } from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import {
  Card,
  Stat,
  Tabs,
  Pills,
  Empty,
  Field,
  Input,
  Select,
  Textarea,
  Btn,
  Badge,
} from "@/components/ui-kit";
import {
  useHub,
  TRIP_TYPES,
  EXP_CATS,
  type Maintenance,
} from "@/store/hub";
import { peso, today, shortDate, filterByDate, type DateFilter } from "@/lib/format";

export const Route = createFileRoute("/express")({
  head: () => ({
    meta: [
      { title: "Get Dat Express — Jazel Bernardo Hub" },
      {
        name: "description",
        content: "L300 van operations: trips, earnings, fuel, expenses, bookings and maintenance.",
      },
      { property: "og:title", content: "Get Dat Express — Operations" },
      {
        property: "og:description",
        content: "Track every trip, every peso, every kilometre.",
      },
    ],
  }),
  component: ExpressPage,
});

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "trips", label: "Trips" },
  { value: "expenses", label: "Expenses" },
  { value: "bookings", label: "Bookings" },
  { value: "clients", label: "Clients" },
  { value: "maintenance", label: "Maintenance" },
];

function ExpressPage() {
  const [tab, setTab] = useState("overview");
  const trips = useHub((s) => s.express.trips);
  const expenses = useHub((s) => s.express.expenses);
  const maintenance = useHub((s) => s.express.maintenance);
  const bookings = useHub((s) => s.express.bookings);

  const alerts = useMemo(() => {
    const items: { id: string; level: "danger" | "warn" | "info"; text: string }[] = [];
    maintenance.forEach((m) => {
      if (m.status === "alert")
        items.push({ id: `m${m.id}`, level: "danger", text: `${m.label}: ${m.note}` });
      else if (m.status === "warn")
        items.push({ id: `m${m.id}`, level: "warn", text: `${m.label}: ${m.note}` });
    });
    bookings.slice(0, 3).forEach((b) =>
      items.push({
        id: `b${b.id}`,
        level: "info",
        text: `Booking · ${b.client} · ${shortDate(b.date)}`,
      }),
    );
    return items;
  }, [maintenance, bookings]);

  return (
    <div className="min-h-screen">
      <HubHeader title="Get Dat Express" subtitle="L300 · Logistics & Rental" alerts={alerts} />
      <main className="mx-auto max-w-6xl px-5 sm:px-6 py-8">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "overview" && <Overview trips={trips} expenses={expenses} />}
            {tab === "trips" && <TripsTab />}
            {tab === "expenses" && <ExpensesTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "clients" && <ClientsTab />}
            {tab === "maintenance" && <MaintenanceTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Overview({ trips, expenses }: { trips: ReturnType<typeof useHub.getState>["express"]["trips"]; expenses: ReturnType<typeof useHub.getState>["express"]["expenses"] }) {
  const totalEarnings = trips.reduce((s, t) => s + t.earnings, 0);
  const totalFuel = trips.reduce((s, t) => s + t.fuel, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totalEarnings - totalFuel - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Earnings" value={peso(totalEarnings)} sub={`${trips.length} trips`} delay={0} accent="var(--color-success)" />
        <Stat label="Fuel Cost" value={peso(totalFuel)} delay={0.05} accent="var(--color-warning)" />
        <Stat label="Other Expenses" value={peso(totalExpenses)} sub={`${expenses.length} entries`} delay={0.1} accent="var(--color-info)" />
        <Stat
          label="Net Profit"
          value={peso(net)}
          delay={0.15}
          accent={net >= 0 ? "var(--color-success)" : "var(--color-destructive)"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Recent Trips">
          {trips.length === 0 ? (
            <Empty>No trips yet</Empty>
          ) : (
            <div className="-my-3">
              {trips.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b border-hairline py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">{t.type}</Badge>
                    </div>
                    <div className="mt-1.5 truncate text-[13px] text-foreground">{t.route}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{shortDate(t.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[14px] text-foreground">{peso(t.earnings)}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">−{peso(t.fuel)} fuel</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Quick Insights">
          <div className="space-y-3 text-[13px] text-muted-foreground">
            <Insight icon={<Truck className="size-4" />} label="Avg per trip">
              {peso(trips.length ? totalEarnings / trips.length : 0)}
            </Insight>
            <Insight icon={<Wallet className="size-4" />} label="Profit margin">
              {totalEarnings > 0 ? `${Math.round((net / totalEarnings) * 100)}%` : "—"}
            </Insight>
            <Insight icon={<BarChart3 className="size-4" />} label="Fuel ratio">
              {totalEarnings > 0 ? `${Math.round((totalFuel / totalEarnings) * 100)}%` : "—"}
            </Insight>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Insight({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <span className="text-foreground/70">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="font-mono text-foreground">{children}</span>
    </div>
  );
}

function TripsTab() {
  const trips = useHub((s) => s.express.trips);
  const addTrip = useHub((s) => s.addTrip);
  const removeTrip = useHub((s) => s.removeTrip);
  const [filter, setFilter] = useState<DateFilter>("all");

  const [form, setForm] = useState({
    date: today(),
    type: TRIP_TYPES[0],
    route: "",
    earnings: "",
    fuel: "",
    notes: "",
  });

  const filtered = filterByDate(trips, "date", filter);

  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr]">
      <Card title="Log a Trip">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.route) return;
            addTrip({
              date: form.date,
              type: form.type,
              route: form.route,
              earnings: Number(form.earnings) || 0,
              fuel: Number(form.fuel) || 0,
              notes: form.notes,
            });
            setForm({ ...form, route: "", earnings: "", fuel: "", notes: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Trip Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TRIP_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Route">
            <Input
              placeholder="e.g. Biñan → Tagaytay"
              value={form.route}
              onChange={(e) => setForm({ ...form, route: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Earnings">
              <Input
                type="number"
                placeholder="0"
                value={form.earnings}
                onChange={(e) => setForm({ ...form, earnings: e.target.value })}
              />
            </Field>
            <Field label="Fuel">
              <Input
                type="number"
                placeholder="0"
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              rows={2}
              placeholder="Client name, conditions…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <Btn type="submit" className="mt-2 w-full">
            <Plus className="size-3.5" /> Add Trip
          </Btn>
        </form>
      </Card>

      <Card
        title={`Trips (${filtered.length})`}
        action={<span className="label-mono">{peso(filtered.reduce((s, t) => s + t.earnings, 0))}</span>}
      >
        <Pills
          options={[
            { value: "all", label: "All" },
            { value: "today", label: "Today" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as DateFilter)}
        />
        {filtered.length === 0 ? (
          <Empty>No trips for this period</Empty>
        ) : (
          <div className="-my-3">
            {filtered.map((t) => (
              <RowItem
                key={t.id}
                title={t.route}
                badges={[t.type]}
                meta={t.notes}
                date={shortDate(t.date)}
                amount={peso(t.earnings)}
                amountSub={`−${peso(t.fuel)} fuel`}
                onDelete={() => removeTrip(t.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ExpensesTab() {
  const expenses = useHub((s) => s.express.expenses);
  const addExpense = useHub((s) => s.addExpense);
  const removeExpense = useHub((s) => s.removeExpense);
  const [filter, setFilter] = useState<DateFilter>("all");
  const [form, setForm] = useState({ date: today(), category: EXP_CATS[0], desc: "", amount: "" });
  const filtered = filterByDate(expenses, "date", filter);

  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr]">
      <Card title="Add Expense">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.desc) return;
            addExpense({
              date: form.date,
              category: form.category,
              desc: form.desc,
              amount: Number(form.amount) || 0,
            });
            setForm({ ...form, desc: "", amount: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {EXP_CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description">
            <Input
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="e.g. Brake pads"
            />
          </Field>
          <Field label="Amount">
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
            />
          </Field>
          <Btn type="submit" className="mt-1 w-full">
            <Plus className="size-3.5" /> Add Expense
          </Btn>
        </form>
      </Card>

      <Card
        title={`Expenses (${filtered.length})`}
        action={<span className="label-mono">{peso(filtered.reduce((s, e) => s + e.amount, 0))}</span>}
      >
        <Pills
          options={[
            { value: "all", label: "All" },
            { value: "today", label: "Today" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as DateFilter)}
        />
        {filtered.length === 0 ? (
          <Empty>No expenses</Empty>
        ) : (
          <div className="-my-3">
            {filtered.map((e) => (
              <RowItem
                key={e.id}
                title={e.desc}
                badges={[e.category]}
                date={shortDate(e.date)}
                amount={peso(e.amount)}
                onDelete={() => removeExpense(e.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function BookingsTab() {
  const bookings = useHub((s) => s.express.bookings);
  const addBooking = useHub((s) => s.addBooking);
  const removeBooking = useHub((s) => s.removeBooking);
  const [form, setForm] = useState({
    date: today(),
    client: "",
    type: TRIP_TYPES[0],
    rate: "",
    notes: "",
  });

  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr]">
      <Card title="Add Booking">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.client) return;
            addBooking({
              date: form.date,
              client: form.client,
              type: form.type,
              rate: Number(form.rate) || 0,
              notes: form.notes,
            });
            setForm({ ...form, client: "", rate: "", notes: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Client">
            <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TRIP_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Rate">
            <Input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Notes">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Pickup details…"
            />
          </Field>
          <Btn type="submit" className="mt-1 w-full">
            <Plus className="size-3.5" /> Add Booking
          </Btn>
        </form>
      </Card>

      <Card title={`Upcoming Bookings (${bookings.length})`}>
        {bookings.length === 0 ? (
          <Empty>No bookings yet</Empty>
        ) : (
          <div className="-my-3">
            {bookings.map((b) => (
              <RowItem
                key={b.id}
                title={b.client}
                badges={[b.type]}
                meta={b.notes}
                date={shortDate(b.date)}
                amount={peso(b.rate)}
                icon={<Calendar className="size-3.5" />}
                onDelete={() => removeBooking(b.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ClientsTab() {
  const clients = useHub((s) => s.express.clients);
  const addClient = useHub((s) => s.addClient);
  const removeClient = useHub((s) => s.removeClient);
  const [form, setForm] = useState({ name: "", phone: "", address: "", type: "Rental", notes: "" });

  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr]">
      <Card title="Add Client">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name) return;
            addClient(form);
            setForm({ name: "", phone: "", address: "", type: "Rental", notes: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {["Rental", "Lalamove", "Both"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <Btn type="submit" className="mt-1 w-full">
            <Plus className="size-3.5" /> Add Client
          </Btn>
        </form>
      </Card>

      <Card title={`Clients (${clients.length})`}>
        {clients.length === 0 ? (
          <Empty>No clients yet</Empty>
        ) : (
          <div className="-my-3">
            {clients.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 border-b border-hairline py-4 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="text-[14px] font-medium">{c.name}</span>
                    <Badge tone="muted">{c.type}</Badge>
                  </div>
                  <div className="mt-1.5 text-[12px] text-muted-foreground">{c.phone} · {c.address}</div>
                  {c.notes && <div className="mt-1 text-[11px] text-muted-foreground/80">{c.notes}</div>}
                </div>
                <Btn variant="danger" size="sm" onClick={() => removeClient(c.id)}>
                  <Trash2 className="size-3" />
                </Btn>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function MaintenanceTab() {
  const maintenance = useHub((s) => s.express.maintenance);
  const cycleMaintenance = useHub((s) => s.cycleMaintenance);

  const tone = (s: Maintenance["status"]) =>
    s === "good" ? "success" : s === "warn" ? "warn" : "danger";
  const accent = (s: Maintenance["status"]) =>
    s === "good"
      ? "var(--color-success)"
      : s === "warn"
        ? "var(--color-warning)"
        : "var(--color-destructive)";

  return (
    <div className="space-y-5">
      <Card title="Maintenance Schedule" action={<span className="label-mono">tap to cycle</span>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {maintenance.map((m) => (
            <button
              key={m.id}
              onClick={() => cycleMaintenance(m.id)}
              className="ring-focus relative overflow-hidden rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-border-strong"
            >
              <span className="absolute left-0 top-0 h-full w-[2px]" style={{ background: accent(m.status) }} />
              <div className="flex items-center gap-2">
                <Wrench className="size-3.5 text-muted-foreground" />
                <span className="text-[13px] font-medium">{m.label}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{m.note}</div>
              <div className="mt-3">
                <Badge tone={tone(m.status)}>{m.msg}</Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RowItem({
  title,
  badges,
  meta,
  date,
  amount,
  amountSub,
  icon,
  onDelete,
}: {
  title: string;
  badges?: string[];
  meta?: string;
  date?: string;
  amount?: string;
  amountSub?: string;
  icon?: React.ReactNode;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-hairline py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {badges?.map((b) => (
            <Badge key={b} tone="muted">
              {b}
            </Badge>
          ))}
          {date && <span className="text-[10px] font-mono text-muted-foreground">{date}</span>}
        </div>
        <div className="mt-1.5 truncate text-[14px] text-foreground">{title}</div>
        {meta && <div className="mt-0.5 text-[11px] text-muted-foreground/80">{meta}</div>}
      </div>
      <div className="flex flex-col items-end gap-2">
        {amount && (
          <div className="text-right">
            <div className="font-mono text-[14px] text-foreground">{amount}</div>
            {amountSub && <div className="font-mono text-[10px] text-muted-foreground">{amountSub}</div>}
          </div>
        )}
        {onDelete && (
          <Btn variant="danger" size="sm" onClick={onDelete} aria-label="Delete">
            <Trash2 className="size-3" />
          </Btn>
        )}
      </div>
    </div>
  );
}
