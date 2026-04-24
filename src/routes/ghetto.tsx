import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calculator, Package, AlertTriangle } from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import { AuthGate } from "@/components/AuthGate";
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
  PTYPES,
  OSTATUS,
  STATUS_COLORS,
  DTF_PRICE,
  PRINT_ITEMS,
  type GhettoOrder,
} from "@/store/hub";
import { peso, today, shortDate } from "@/lib/format";

export const Route = createFileRoute("/ghetto")({
  head: () => ({
    meta: [
      { title: "Ghetto Print — DTF & Silkscreen · Jazel Bernardo Hub" },
      {
        name: "description",
        content: "Print order tracking, price calculator and materials inventory for Ghetto Print.",
      },
      { property: "og:title", content: "Ghetto Print — Operations" },
      { property: "og:description", content: "Every order, every roll, every screen." },
    ],
  }),
  component: () => (
    <AuthGate>
      <GhettoPage />
    </AuthGate>
  ),
});

const TABS = [
  { value: "orders", label: "Orders" },
  { value: "calculator", label: "Calculator" },
  { value: "materials", label: "Materials" },
  { value: "overview", label: "Overview" },
];

function GhettoPage() {
  const [tab, setTab] = useState("orders");
  const orders = useHub((s) => s.ghetto.orders);
  const materials = useHub((s) => s.ghetto.materials);

  const alerts = useMemo(() => {
    const a: { id: string; level: "danger" | "warn" | "info"; text: string }[] = [];
    materials.forEach((m) => {
      if (m.stock <= m.reorder)
        a.push({
          id: `m${m.id}`,
          level: m.stock === 0 ? "danger" : "warn",
          text: `Low stock: ${m.name} (${m.stock} ${m.unit})`,
        });
    });
    orders
      .filter((o) => o.status === "Pending" || o.status === "For Pickup")
      .slice(0, 3)
      .forEach((o) =>
        a.push({ id: `o${o.id}`, level: "info", text: `${o.status}: ${o.client} · ${o.item}` }),
      );
    return a;
  }, [materials, orders]);

  return (
    <div className="min-h-screen">
      <HubHeader title="Ghetto Print" subtitle="DTF & Silkscreen" alerts={alerts} />
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
            {tab === "orders" && <Orders />}
            {tab === "calculator" && <CalculatorTab />}
            {tab === "materials" && <Materials />}
            {tab === "overview" && <Overview />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Orders() {
  const orders = useHub((s) => s.ghetto.orders);
  const upsertOrder = useHub((s) => s.upsertOrder);
  const removeOrder = useHub((s) => s.removeOrder);
  const setOrderStatus = useHub((s) => s.setOrderStatus);
  const [filter, setFilter] = useState<string>("All");

  const [form, setForm] = useState({
    client: "",
    type: PTYPES[0],
    item: PRINT_ITEMS[0],
    qty: "",
    size: "A4",
    price: "",
    notes: "",
    dp: "",
    date: today(),
  });

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <Card title="New Order">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.client) return;
            upsertOrder({
              client: form.client,
              type: form.type,
              item: form.item,
              qty: Number(form.qty) || 0,
              size: form.size,
              price: Number(form.price) || 0,
              status: "Pending",
              date: form.date,
              notes: form.notes,
              dp: Number(form.dp) || 0,
            });
            setForm({ ...form, client: "", qty: "", price: "", notes: "", dp: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Client">
            <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {PTYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Item">
              <Select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
                {PRINT_ITEMS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Qty">
              <Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            </Field>
            <Field label="Size">
              <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                {Object.keys(DTF_PRICE).map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Price">
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Down Payment">
              <Input type="number" value={form.dp} onChange={(e) => setForm({ ...form, dp: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Color, design notes…" />
          </Field>
          <Btn type="submit" className="mt-1 w-full">
            <Plus className="size-3.5" /> Create Order
          </Btn>
        </form>
      </Card>

      <Card title={`Orders (${filtered.length})`}>
        <Pills
          options={[
            { value: "All", label: "All" },
            ...OSTATUS.map((s) => ({ value: s, label: s })),
          ]}
          value={filter}
          onChange={setFilter}
        />
        {filtered.length === 0 ? (
          <Empty>No orders</Empty>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => <OrderCard key={o.id} o={o} onStatus={setOrderStatus} onDelete={() => removeOrder(o.id)} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

function OrderCard({ o, onStatus, onDelete }: { o: GhettoOrder; onStatus: (id: string, s: GhettoOrder["status"]) => void; onDelete: () => void }) {
  const balance = o.price - o.dp;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-medium">{o.client}</span>
            <Badge tone="muted">{o.type}</Badge>
            <span className="text-[10px] font-mono text-muted-foreground">{shortDate(o.date)}</span>
          </div>
          <div className="mt-1.5 text-[12px] text-muted-foreground">
            {o.qty}× {o.item} · {o.size}
          </div>
          {o.notes && <div className="mt-1 text-[11px] text-muted-foreground/80">{o.notes}</div>}
        </div>
        <div className="text-right">
          <div className="font-mono text-[14px]">{peso(o.price)}</div>
          {o.dp > 0 && (
            <div className="font-mono text-[10px] text-muted-foreground">
              DP: {peso(o.dp)} · Bal: {peso(balance)}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-foreground"
          style={{ background: `color-mix(in oklab, ${STATUS_COLORS[o.status]} 25%, transparent)`, border: `1px solid color-mix(in oklab, ${STATUS_COLORS[o.status]} 50%, transparent)` }}
        >
          {o.status}
        </span>
        <div className="ml-auto flex gap-1">
          {OSTATUS.filter((s) => s !== o.status).map((s) => (
            <Btn key={s} variant="secondary" size="sm" onClick={() => onStatus(o.id, s)}>
              → {s}
            </Btn>
          ))}
          <Btn variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

function CalculatorTab() {
  const [type, setType] = useState(PTYPES[0]);
  const [size, setSize] = useState<string>("A4");
  const [qty, setQty] = useState(10);

  const unit = DTF_PRICE[size] || 0;
  const total = unit * qty;
  const suggested = type === "Silkscreen" ? Math.round(total * 1.2) : total;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card title="Price Calculator">
        <div className="grid gap-4">
          <Field label="Print Type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {PTYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Size">
            <Select value={size} onChange={(e) => setSize(e.target.value)}>
              {Object.keys(DTF_PRICE).map((s) => <option key={s}>{s} · {peso(DTF_PRICE[s])}/pc</option>)}
            </Select>
          </Field>
          <Field label="Quantity">
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </Field>
        </div>
      </Card>

      <Card title="Estimate">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calculator className="mb-4 size-8 text-muted-foreground" />
          <div className="label-mono">Suggested Price</div>
          <div className="mt-2 font-display text-6xl">{peso(suggested)}</div>
          <div className="mt-3 text-[12px] text-muted-foreground">
            {qty} × {peso(unit)} = {peso(total)}
            {type === "Silkscreen" && " · +20% silkscreen setup"}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Materials() {
  const materials = useHub((s) => s.ghetto.materials);
  const upsertMaterial = useHub((s) => s.upsertMaterial);
  const removeMaterial = useHub((s) => s.removeMaterial);
  const [form, setForm] = useState({ name: "", unit: "pcs", stock: "", reorder: "" });

  return (
    <div className="grid gap-5 md:grid-cols-[320px_1fr]">
      <Card title="Add Material">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name) return;
            upsertMaterial({
              name: form.name,
              unit: form.unit,
              stock: Number(form.stock) || 0,
              reorder: Number(form.reorder) || 0,
            });
            setForm({ name: "", unit: "pcs", stock: "", reorder: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Unit">
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs, kg, liters…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock">
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
            <Field label="Reorder At">
              <Input type="number" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} />
            </Field>
          </div>
          <Btn type="submit" className="mt-1 w-full">
            <Plus className="size-3.5" /> Add Material
          </Btn>
        </form>
      </Card>

      <Card title={`Materials (${materials.length})`}>
        {materials.length === 0 ? (
          <Empty>No materials yet</Empty>
        ) : (
          <div className="space-y-2">
            {materials.map((m) => {
              const low = m.stock <= m.reorder;
              const ratio = m.reorder > 0 ? Math.min(1, m.stock / (m.reorder * 3)) : 1;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
                  style={{ borderLeft: low ? "3px solid var(--color-destructive)" : undefined }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="size-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-medium">{m.name}</span>
                      {low && (
                        <Badge tone="danger">
                          <AlertTriangle className="mr-1 inline size-2.5" /> low
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${ratio * 100}%`,
                          background: low ? "var(--color-destructive)" : "var(--color-success)",
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] font-mono text-muted-foreground">
                      reorder at {m.reorder} {m.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl leading-none">{m.stock}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{m.unit}</div>
                  </div>
                  <Btn variant="danger" size="sm" onClick={() => removeMaterial(m.id)}>
                    <Trash2 className="size-3" />
                  </Btn>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Overview() {
  const orders = useHub((s) => s.ghetto.orders);
  const materials = useHub((s) => s.ghetto.materials);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.price, 0);
    const collected = orders.reduce((s, o) => s + o.dp, 0);
    const balance = orders.filter((o) => o.status !== "Done").reduce((s, o) => s + (o.price - o.dp), 0);
    const lowMats = materials.filter((m) => m.stock <= m.reorder).length;
    return { revenue, collected, balance, lowMats };
  }, [orders, materials]);

  const byStatus = OSTATUS.map((s) => ({ s, count: orders.filter((o) => o.status === s).length }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Revenue" value={peso(stats.revenue)} sub={`${orders.length} orders`} accent="var(--color-success)" />
        <Stat label="Collected" value={peso(stats.collected)} delay={0.05} accent="var(--color-info)" />
        <Stat label="Outstanding" value={peso(stats.balance)} delay={0.1} accent="var(--color-warning)" />
        <Stat label="Low Materials" value={String(stats.lowMats)} delay={0.15} accent="var(--color-destructive)" />
      </div>

      <Card title="Orders by Status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {byStatus.map((b) => (
            <div key={b.s} className="rounded-lg border border-border bg-card p-4">
              <div
                className="size-2 rounded-full mb-2"
                style={{ background: STATUS_COLORS[b.s] }}
              />
              <div className="font-display text-3xl leading-none">{b.count}</div>
              <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{b.s}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
