import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingCart, X, Receipt, TrendingUp } from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import {
  Card,
  Stat,
  Tabs,
  Empty,
  Field,
  Input,
  Btn,
  Badge,
} from "@/components/ui-kit";
import { useHub, type DupartProduct, type DupartSale, type DupartSaleItem } from "@/store/hub";
import { peso } from "@/lib/format";

export const Route = createFileRoute("/dupart")({
  head: () => ({
    meta: [
      { title: "Dupart — Hotdog POS · Jazel Bernardo Hub" },
      {
        name: "description",
        content: "Point of sale, daily sales tracking, inventory and profit analysis for Dupart.",
      },
      { property: "og:title", content: "Dupart — Hotdog POS" },
      { property: "og:description", content: "Run the kitchen. Watch the margins." },
    ],
  }),
  component: DupartPage,
});

const TABS = [
  { value: "pos", label: "POS" },
  { value: "products", label: "Products" },
  { value: "sales", label: "Sales" },
  { value: "report", label: "Report" },
];

function DupartPage() {
  const [tab, setTab] = useState("pos");
  const products = useHub((s) => s.dupart.products);

  const lowStock = products.filter((p) => p.stock <= 5);
  const alerts = lowStock.map((p) => ({
    id: p.id,
    level: p.stock === 0 ? ("danger" as const) : ("warn" as const),
    text: `${p.name}: ${p.stock} left`,
  }));

  return (
    <div className="min-h-screen">
      <HubHeader title="Dupart" subtitle="Hotdog Business" alerts={alerts} />
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
            {tab === "pos" && <POS />}
            {tab === "products" && <Products />}
            {tab === "sales" && <Sales />}
            {tab === "report" && <Report />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function POS() {
  const products = useHub((s) => s.dupart.products);
  const recordSale = useHub((s) => s.recordSale);
  const [cart, setCart] = useState<DupartSaleItem[]>([]);
  const [cash, setCash] = useState("");
  const [receipt, setReceipt] = useState<DupartSale | null>(null);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const change = Number(cash || 0) - total;

  const addToCart = (p: DupartProduct) => {
    if (p.stock <= 0) return;
    setCart((c) => {
      const idx = c.findIndex((x) => x.productId === p.id);
      if (idx >= 0) {
        const next = [...c];
        if (next[idx].qty < p.stock) next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...c, { productId: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) =>
    setCart((c) =>
      c
        .map((i) => (i.productId === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    );

  const checkout = async () => {
    if (cart.length === 0 || change < 0) return;
    const sale = await recordSale({ items: cart, total, cash: Number(cash), change });
    if (sale) setReceipt(sale);
    setCart([]);
    setCash("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card title="Menu">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const out = p.stock <= 0;
            return (
              <button
                key={p.id}
                disabled={out}
                onClick={() => addToCart(p)}
                className="ring-focus group relative flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-border-strong hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <div className="text-[11px] font-medium text-muted-foreground line-clamp-2">{p.name}</div>
                <div className="mt-2 font-display text-2xl">{peso(p.price)}</div>
                <div
                  className="mt-2 text-[9px] font-mono uppercase tracking-wider"
                  style={{
                    color:
                      p.stock === 0
                        ? "var(--color-destructive)"
                        : p.stock <= 5
                          ? "var(--color-warning)"
                          : "var(--color-muted-foreground)",
                  }}
                >
                  {out ? "OUT" : `${p.stock} left`}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-5">
        <Card title={`Cart (${cart.length})`} action={cart.length > 0 ? <Btn variant="ghost" size="sm" onClick={() => setCart([])}><X className="size-3" /></Btn> : null}>
          {cart.length === 0 ? (
            <Empty>Tap a product to start</Empty>
          ) : (
            <div className="-my-2">
              {cart.map((i) => (
                <div key={i.productId} className="flex items-center justify-between gap-2 border-b border-hairline py-2.5 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px]">{i.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{peso(i.price)} ea</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(i.productId, -1)} className="ring-focus size-7 rounded border border-border bg-secondary text-foreground transition-colors hover:border-border-strong">
                      <Minus className="mx-auto size-3" />
                    </button>
                    <span className="min-w-[22px] text-center font-mono text-[13px]">{i.qty}</span>
                    <button onClick={() => updateQty(i.productId, 1)} className="ring-focus size-7 rounded border border-border bg-secondary text-foreground transition-colors hover:border-border-strong">
                      <Plus className="mx-auto size-3" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-mono text-[13px]">{peso(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-hairline pt-4">
              <div className="flex items-center justify-between">
                <span className="label-mono">Total</span>
                <span className="font-display text-3xl">{peso(total)}</span>
              </div>
              <Field label="Cash Received">
                <Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0" />
              </Field>
              {cash !== "" && (
                <div className={`flex items-center justify-between rounded-md border p-3 text-[13px] ${change < 0 ? "border-destructive/40 text-destructive" : "border-success/40 text-success"}`}>
                  <span>{change < 0 ? "Short" : "Change"}</span>
                  <span className="font-mono">{peso(Math.abs(change))}</span>
                </div>
              )}
              <Btn className="w-full" onClick={checkout} disabled={change < 0 || cart.length === 0}>
                <Receipt className="size-3.5" /> Complete Sale
              </Btn>
            </div>
          )}
        </Card>

        <AnimatePresence>
          {receipt && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Card title="Latest Receipt" action={<Btn variant="ghost" size="sm" onClick={() => setReceipt(null)}><X className="size-3" /></Btn>}>
                <div className="space-y-1.5 text-[12px]">
                  {receipt.items.map((i) => (
                    <div key={i.productId} className="flex justify-between">
                      <span className="text-muted-foreground">{i.qty}× {i.name}</span>
                      <span className="font-mono">{peso(i.price * i.qty)}</span>
                    </div>
                  ))}
                  <div className="mt-3 flex justify-between border-t border-hairline pt-3 text-[14px]">
                    <span>Total</span>
                    <span className="font-mono">{peso(receipt.total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash</span><span className="font-mono">{peso(receipt.cash)}</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Change</span><span className="font-mono">{peso(receipt.change)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Products() {
  const products = useHub((s) => s.dupart.products);
  const upsertProduct = useHub((s) => s.upsertProduct);
  const removeProduct = useHub((s) => s.removeProduct);
  const [form, setForm] = useState({ name: "", price: "", cost: "", stock: "" });

  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr]">
      <Card title="Add Product">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name) return;
            upsertProduct({
              name: form.name,
              price: Number(form.price) || 0,
              cost: Number(form.cost) || 0,
              stock: Number(form.stock) || 0,
            });
            setForm({ name: "", price: "", cost: "", stock: "" });
          }}
          className="grid gap-3"
        >
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price">
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Cost">
              <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </Field>
          </div>
          <Field label="Stock">
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </Field>
          <Btn type="submit" className="mt-1 w-full">
            <Plus className="size-3.5" /> Add Product
          </Btn>
        </form>
      </Card>

      <Card title={`Inventory (${products.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                <th className="px-3 py-2 text-left label-mono">Item</th>
                <th className="px-3 py-2 text-right label-mono">Price</th>
                <th className="px-3 py-2 text-right label-mono">Cost</th>
                <th className="px-3 py-2 text-right label-mono">Margin</th>
                <th className="px-3 py-2 text-right label-mono">Stock</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
                return (
                  <tr key={p.id} className="border-b border-hairline last:border-0">
                    <td className="px-3 py-3 text-foreground">{p.name}</td>
                    <td className="px-3 py-3 text-right font-mono">{peso(p.price)}</td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground">{peso(p.cost)}</td>
                    <td className="px-3 py-3 text-right font-mono">{margin}%</td>
                    <td className="px-3 py-3 text-right">
                      <Badge tone={p.stock === 0 ? "danger" : p.stock <= 5 ? "warn" : "muted"}>
                        {p.stock}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Btn variant="danger" size="sm" onClick={() => removeProduct(p.id)}>
                        <Trash2 className="size-3" />
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Sales() {
  const sales = useHub((s) => s.dupart.sales);
  if (sales.length === 0) {
    return (
      <Card title="Sales History">
        <Empty>
          <ShoppingCart className="mx-auto mb-3 size-8 opacity-40" />
          No sales yet. Make your first sale in the POS tab.
        </Empty>
      </Card>
    );
  }

  return (
    <Card title={`Sales History (${sales.length})`} action={<span className="label-mono">{peso(sales.reduce((s, x) => s + x.total, 0))}</span>}>
      <div className="-my-3">
        {sales.map((s) => (
          <div key={s.id} className="border-b border-hairline py-4 last:border-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-muted-foreground">
                {new Date(s.date).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="font-mono text-[14px]">{peso(s.total)}</span>
            </div>
            <div className="mt-1.5 text-[12px] text-muted-foreground">
              {s.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Report() {
  const sales = useHub((s) => s.dupart.sales);
  const products = useHub((s) => s.dupart.products);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today);
    const revenue = todaySales.reduce((s, x) => s + x.total, 0);
    const allRevenue = sales.reduce((s, x) => s + x.total, 0);
    const itemsSold = todaySales.flatMap((s) => s.items).reduce((s, i) => s + i.qty, 0);

    // Estimated cost from products
    const productMap = new Map(products.map((p) => [p.id, p]));
    const cogs = todaySales
      .flatMap((s) => s.items)
      .reduce((sum, i) => sum + (productMap.get(i.productId)?.cost || 0) * i.qty, 0);
    return { todaySales, revenue, itemsSold, cogs, profit: revenue - cogs, allRevenue };
  }, [sales, products]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today's Revenue" value={peso(stats.revenue)} sub={`${stats.todaySales.length} sales`} accent="var(--color-success)" />
        <Stat label="Items Sold" value={String(stats.itemsSold)} delay={0.05} />
        <Stat label="Est. COGS" value={peso(stats.cogs)} delay={0.1} accent="var(--color-warning)" />
        <Stat label="Est. Profit" value={peso(stats.profit)} delay={0.15} accent="var(--color-success)" />
      </div>

      <Card title="All-time Revenue">
        <div className="flex items-end justify-between">
          <div className="font-display text-5xl">{peso(stats.allRevenue)}</div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <TrendingUp className="size-4" /> {sales.length} total sales
          </div>
        </div>
      </Card>

      <Card title="Today's Sales">
        {stats.todaySales.length === 0 ? (
          <Empty>No sales today yet</Empty>
        ) : (
          <div className="-my-3">
            {stats.todaySales.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-hairline py-3 last:border-0">
                <span className="text-[12px] text-muted-foreground">
                  {new Date(s.date).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {s.items.reduce((sum, i) => sum + i.qty, 0)} items
                </span>
                <span className="font-mono text-[14px]">{peso(s.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
