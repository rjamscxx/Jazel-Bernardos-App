import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

// ─────────── Types (ids are now uuid strings) ───────────
export type ExpressTrip = {
  id: string;
  date: string;
  type: string;
  route: string;
  earnings: number;
  fuel: number;
  notes: string;
};
export type ExpressExpense = {
  id: string;
  date: string;
  category: string;
  desc: string;
  amount: number;
};
export type ExpressBooking = {
  id: string;
  date: string;
  client: string;
  type: string;
  rate: number;
  notes: string;
};
export type ExpressClient = {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: string;
  notes: string;
};
export type Maintenance = {
  id: string;
  label: string;
  note: string;
  status: "good" | "warn" | "alert";
  msg: string;
};

export type DupartProduct = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
};
export type DupartSaleItem = { productId: string; name: string; price: number; qty: number };
export type DupartSale = {
  id: string;
  date: string;
  items: DupartSaleItem[];
  total: number;
  cash: number;
  change: number;
};

export type GhettoOrder = {
  id: string;
  client: string;
  type: string;
  item: string;
  qty: number;
  size: string;
  price: number;
  status: "Pending" | "In Progress" | "For Pickup" | "Done";
  date: string;
  notes: string;
  dp: number;
};
export type GhettoMaterial = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  reorder: number;
};

// ─────────── Constants exposed ───────────
export const TRIP_TYPES = [
  "Lalamove",
  "Rental – Half Day",
  "Rental – Full Day",
  "Rental – Custom Rate",
];
export const EXP_CATS = [
  "Fuel",
  "Maintenance",
  "Repair",
  "Toll",
  "Insurance",
  "Registration",
  "Other",
];
export const PTYPES = ["DTF Print", "Silkscreen"];
export const OSTATUS: GhettoOrder["status"][] = ["Pending", "In Progress", "For Pickup", "Done"];
export const STATUS_COLORS: Record<GhettoOrder["status"], string> = {
  Pending: "var(--color-info)",
  "In Progress": "var(--color-warning)",
  "For Pickup": "oklch(0.6 0.2 290)",
  Done: "var(--color-success)",
};
export const DTF_PRICE: Record<string, number> = {
  A5: 35,
  A4: 55,
  A3: 85,
  A2: 130,
  "Full Front": 100,
};
export const PRINT_ITEMS = ["T-shirt", "Polo", "Hoodie", "Tote Bag", "Cap", "Other"];

const EMPTY = {
  express: {
    trips: [] as ExpressTrip[],
    expenses: [] as ExpressExpense[],
    bookings: [] as ExpressBooking[],
    clients: [] as ExpressClient[],
    maintenance: [] as Maintenance[],
  },
  dupart: { products: [] as DupartProduct[], sales: [] as DupartSale[] },
  ghetto: { orders: [] as GhettoOrder[], materials: [] as GhettoMaterial[] },
};

type State = typeof EMPTY & {
  theme: "dark" | "light";
  loaded: boolean;
  userId: string | null;
};

type Actions = {
  // lifecycle
  loadAll: (userId: string) => Promise<void>;
  reset: () => void;
  // express
  addTrip: (t: Omit<ExpressTrip, "id">) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  addExpense: (e: Omit<ExpressExpense, "id">) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  addBooking: (b: Omit<ExpressBooking, "id">) => Promise<void>;
  removeBooking: (id: string) => Promise<void>;
  addClient: (c: Omit<ExpressClient, "id">) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  cycleMaintenance: (id: string) => Promise<void>;
  // dupart
  upsertProduct: (p: Omit<DupartProduct, "id"> & { id?: string }) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  recordSale: (sale: Omit<DupartSale, "id" | "date">) => Promise<DupartSale | null>;
  // ghetto
  upsertOrder: (o: Omit<GhettoOrder, "id"> & { id?: string }) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: GhettoOrder["status"]) => Promise<void>;
  upsertMaterial: (m: Omit<GhettoMaterial, "id"> & { id?: string }) => Promise<void>;
  removeMaterial: (id: string) => Promise<void>;
  // ui
  setTheme: (t: "dark" | "light") => void;
};

const nextStatus: Record<Maintenance["status"], Maintenance["status"]> = {
  good: "warn",
  warn: "alert",
  alert: "good",
};
const statusMsg: Record<Maintenance["status"], string> = {
  good: "Up to date",
  warn: "Check soon",
  alert: "Renewal required",
};

// Theme persistence (kept in localStorage, not user-scoped)
const initialTheme: "dark" | "light" =
  (typeof window !== "undefined" && (localStorage.getItem("hub_theme") as "dark" | "light")) ||
  "dark";

export const useHub = create<State & Actions>((set, get) => ({
  ...EMPTY,
  theme: initialTheme,
  loaded: false,
  userId: null,

  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem("hub_theme", theme);
    set({ theme });
  },

  reset: () => set({ ...EMPTY, loaded: false, userId: null }),

  loadAll: async (userId) => {
    set({ userId, loaded: false });
    const [trips, expenses, bookings, clients, maintenance, products, sales, orders, materials] =
      await Promise.all([
        supabase.from("express_trips").select("*").order("date", { ascending: false }),
        supabase.from("express_expenses").select("*").order("date", { ascending: false }),
        supabase.from("express_bookings").select("*").order("date", { ascending: false }),
        supabase.from("express_clients").select("*").order("created_at", { ascending: false }),
        supabase.from("express_maintenance").select("*").order("sort_order"),
        supabase.from("dupart_products").select("*").order("created_at"),
        supabase.from("dupart_sales").select("*").order("created_at", { ascending: false }),
        supabase.from("ghetto_orders").select("*").order("date", { ascending: false }),
        supabase.from("ghetto_materials").select("*").order("created_at"),
      ]);
    set({
      express: {
        trips: (trips.data || []).map((t) => ({
          id: t.id,
          date: t.date,
          type: t.type,
          route: t.route,
          earnings: Number(t.earnings),
          fuel: Number(t.fuel),
          notes: t.notes || "",
        })),
        expenses: (expenses.data || []).map((e) => ({
          id: e.id,
          date: e.date,
          category: e.category,
          desc: e.description,
          amount: Number(e.amount),
        })),
        bookings: (bookings.data || []).map((b) => ({
          id: b.id,
          date: b.date,
          client: b.client,
          type: b.type,
          rate: Number(b.rate),
          notes: b.notes || "",
        })),
        clients: (clients.data || []).map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || "",
          address: c.address || "",
          type: c.type || "",
          notes: c.notes || "",
        })),
        maintenance: (maintenance.data || []).map((m) => ({
          id: m.id,
          label: m.label,
          note: m.note || "",
          status: m.status as Maintenance["status"],
          msg: m.msg || "",
        })),
      },
      dupart: {
        products: (products.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          cost: Number(p.cost),
          stock: Number(p.stock),
        })),
        sales: (sales.data || []).map((s) => ({
          id: s.id,
          date: s.created_at,
          items: (s.items as DupartSaleItem[]) || [],
          total: Number(s.total),
          cash: Number(s.cash),
          change: Number(s.change),
        })),
      },
      ghetto: {
        orders: (orders.data || []).map((o) => ({
          id: o.id,
          client: o.client,
          type: o.type,
          item: o.item,
          qty: o.qty,
          size: o.size || "",
          price: Number(o.price),
          status: o.status as GhettoOrder["status"],
          date: o.date,
          notes: o.notes || "",
          dp: Number(o.dp),
        })),
        materials: (materials.data || []).map((m) => ({
          id: m.id,
          name: m.name,
          unit: m.unit || "",
          stock: Number(m.stock),
          reorder: Number(m.reorder),
        })),
      },
      loaded: true,
    });
  },

  // ── Express ──
  addTrip: async (t) => {
    const userId = get().userId;
    if (!userId) return;
    const { data } = await supabase
      .from("express_trips")
      .insert({ user_id: userId, ...t })
      .select()
      .single();
    if (!data) return;
    const row: ExpressTrip = {
      id: data.id,
      date: data.date,
      type: data.type,
      route: data.route,
      earnings: Number(data.earnings),
      fuel: Number(data.fuel),
      notes: data.notes || "",
    };
    set((s) => ({ express: { ...s.express, trips: [row, ...s.express.trips] } }));
  },
  removeTrip: async (id) => {
    await supabase.from("express_trips").delete().eq("id", id);
    set((s) => ({ express: { ...s.express, trips: s.express.trips.filter((x) => x.id !== id) } }));
  },

  addExpense: async (e) => {
    const userId = get().userId;
    if (!userId) return;
    const { data } = await supabase
      .from("express_expenses")
      .insert({
        user_id: userId,
        date: e.date,
        category: e.category,
        description: e.desc,
        amount: e.amount,
      })
      .select()
      .single();
    if (!data) return;
    const row: ExpressExpense = {
      id: data.id,
      date: data.date,
      category: data.category,
      desc: data.description,
      amount: Number(data.amount),
    };
    set((s) => ({ express: { ...s.express, expenses: [row, ...s.express.expenses] } }));
  },
  removeExpense: async (id) => {
    await supabase.from("express_expenses").delete().eq("id", id);
    set((s) => ({
      express: { ...s.express, expenses: s.express.expenses.filter((x) => x.id !== id) },
    }));
  },

  addBooking: async (b) => {
    const userId = get().userId;
    if (!userId) return;
    const { data } = await supabase
      .from("express_bookings")
      .insert({ user_id: userId, ...b })
      .select()
      .single();
    if (!data) return;
    const row: ExpressBooking = {
      id: data.id,
      date: data.date,
      client: data.client,
      type: data.type,
      rate: Number(data.rate),
      notes: data.notes || "",
    };
    set((s) => ({ express: { ...s.express, bookings: [row, ...s.express.bookings] } }));
  },
  removeBooking: async (id) => {
    await supabase.from("express_bookings").delete().eq("id", id);
    set((s) => ({
      express: { ...s.express, bookings: s.express.bookings.filter((x) => x.id !== id) },
    }));
  },

  addClient: async (c) => {
    const userId = get().userId;
    if (!userId) return;
    const { data } = await supabase
      .from("express_clients")
      .insert({ user_id: userId, ...c })
      .select()
      .single();
    if (!data) return;
    const row: ExpressClient = {
      id: data.id,
      name: data.name,
      phone: data.phone || "",
      address: data.address || "",
      type: data.type || "",
      notes: data.notes || "",
    };
    set((s) => ({ express: { ...s.express, clients: [row, ...s.express.clients] } }));
  },
  removeClient: async (id) => {
    await supabase.from("express_clients").delete().eq("id", id);
    set((s) => ({
      express: { ...s.express, clients: s.express.clients.filter((x) => x.id !== id) },
    }));
  },

  cycleMaintenance: async (id) => {
    const m = get().express.maintenance.find((x) => x.id === id);
    if (!m) return;
    const ns = nextStatus[m.status];
    const msg = statusMsg[ns];
    set((s) => ({
      express: {
        ...s.express,
        maintenance: s.express.maintenance.map((x) =>
          x.id === id ? { ...x, status: ns, msg } : x,
        ),
      },
    }));
    await supabase.from("express_maintenance").update({ status: ns, msg }).eq("id", id);
  },

  // ── Dupart ──
  upsertProduct: async (p) => {
    const userId = get().userId;
    if (!userId) return;
    if (p.id) {
      const { data } = await supabase
        .from("dupart_products")
        .update({ name: p.name, price: p.price, cost: p.cost, stock: p.stock })
        .eq("id", p.id)
        .select()
        .single();
      if (!data) return;
      set((s) => ({
        dupart: {
          ...s.dupart,
          products: s.dupart.products.map((x) =>
            x.id === p.id
              ? {
                  id: data.id,
                  name: data.name,
                  price: Number(data.price),
                  cost: Number(data.cost),
                  stock: Number(data.stock),
                }
              : x,
          ),
        },
      }));
    } else {
      const { data } = await supabase
        .from("dupart_products")
        .insert({ user_id: userId, name: p.name, price: p.price, cost: p.cost, stock: p.stock })
        .select()
        .single();
      if (!data) return;
      const row: DupartProduct = {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        cost: Number(data.cost),
        stock: Number(data.stock),
      };
      set((s) => ({ dupart: { ...s.dupart, products: [row, ...s.dupart.products] } }));
    }
  },
  removeProduct: async (id) => {
    await supabase.from("dupart_products").delete().eq("id", id);
    set((s) => ({
      dupart: { ...s.dupart, products: s.dupart.products.filter((x) => x.id !== id) },
    }));
  },
  recordSale: async (sale) => {
    const userId = get().userId;
    if (!userId) return null;
    const { data } = await supabase
      .from("dupart_sales")
      .insert({
        user_id: userId,
        items: sale.items,
        total: sale.total,
        cash: sale.cash,
        change: sale.change,
      })
      .select()
      .single();
    if (!data) return null;
    const newSale: DupartSale = {
      id: data.id,
      date: data.created_at,
      items: (data.items as DupartSaleItem[]) || [],
      total: Number(data.total),
      cash: Number(data.cash),
      change: Number(data.change),
    };
    // decrement local stock immediately + persist new stock per product
    const updates = sale.items.map(async (item) => {
      const prod = get().dupart.products.find((p) => p.id === item.productId);
      if (!prod) return;
      const newStock = Math.max(0, prod.stock - item.qty);
      await supabase.from("dupart_products").update({ stock: newStock }).eq("id", prod.id);
    });
    await Promise.all(updates);
    set((s) => ({
      dupart: {
        ...s.dupart,
        sales: [newSale, ...s.dupart.sales],
        products: s.dupart.products.map((p) => {
          const item = sale.items.find((i) => i.productId === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
        }),
      },
    }));
    return newSale;
  },

  // ── Ghetto ──
  upsertOrder: async (o) => {
    const userId = get().userId;
    if (!userId) return;
    const payload = {
      client: o.client,
      type: o.type,
      item: o.item,
      qty: o.qty,
      size: o.size,
      price: o.price,
      status: o.status,
      date: o.date,
      notes: o.notes,
      dp: o.dp,
    };
    if (o.id) {
      const { data } = await supabase
        .from("ghetto_orders")
        .update(payload)
        .eq("id", o.id)
        .select()
        .single();
      if (!data) return;
      set((s) => ({
        ghetto: {
          ...s.ghetto,
          orders: s.ghetto.orders.map((x) =>
            x.id === o.id
              ? {
                  id: data.id,
                  client: data.client,
                  type: data.type,
                  item: data.item,
                  qty: data.qty,
                  size: data.size || "",
                  price: Number(data.price),
                  status: data.status as GhettoOrder["status"],
                  date: data.date,
                  notes: data.notes || "",
                  dp: Number(data.dp),
                }
              : x,
          ),
        },
      }));
    } else {
      const { data } = await supabase
        .from("ghetto_orders")
        .insert({ user_id: userId, ...payload })
        .select()
        .single();
      if (!data) return;
      const row: GhettoOrder = {
        id: data.id,
        client: data.client,
        type: data.type,
        item: data.item,
        qty: data.qty,
        size: data.size || "",
        price: Number(data.price),
        status: data.status as GhettoOrder["status"],
        date: data.date,
        notes: data.notes || "",
        dp: Number(data.dp),
      };
      set((s) => ({ ghetto: { ...s.ghetto, orders: [row, ...s.ghetto.orders] } }));
    }
  },
  removeOrder: async (id) => {
    await supabase.from("ghetto_orders").delete().eq("id", id);
    set((s) => ({ ghetto: { ...s.ghetto, orders: s.ghetto.orders.filter((x) => x.id !== id) } }));
  },
  setOrderStatus: async (id, status) => {
    set((s) => ({
      ghetto: {
        ...s.ghetto,
        orders: s.ghetto.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      },
    }));
    await supabase.from("ghetto_orders").update({ status }).eq("id", id);
  },
  upsertMaterial: async (m) => {
    const userId = get().userId;
    if (!userId) return;
    const payload = { name: m.name, unit: m.unit, stock: m.stock, reorder: m.reorder };
    if (m.id) {
      const { data } = await supabase
        .from("ghetto_materials")
        .update(payload)
        .eq("id", m.id)
        .select()
        .single();
      if (!data) return;
      set((s) => ({
        ghetto: {
          ...s.ghetto,
          materials: s.ghetto.materials.map((x) =>
            x.id === m.id
              ? {
                  id: data.id,
                  name: data.name,
                  unit: data.unit || "",
                  stock: Number(data.stock),
                  reorder: Number(data.reorder),
                }
              : x,
          ),
        },
      }));
    } else {
      const { data } = await supabase
        .from("ghetto_materials")
        .insert({ user_id: userId, ...payload })
        .select()
        .single();
      if (!data) return;
      const row: GhettoMaterial = {
        id: data.id,
        name: data.name,
        unit: data.unit || "",
        stock: Number(data.stock),
        reorder: Number(data.reorder),
      };
      set((s) => ({ ghetto: { ...s.ghetto, materials: [row, ...s.ghetto.materials] } }));
    }
  },
  removeMaterial: async (id) => {
    await supabase.from("ghetto_materials").delete().eq("id", id);
    set((s) => ({
      ghetto: { ...s.ghetto, materials: s.ghetto.materials.filter((x) => x.id !== id) },
    }));
  },
}));
