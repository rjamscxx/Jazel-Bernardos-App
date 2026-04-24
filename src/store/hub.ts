import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/format";

// ─────────── Types ───────────
export type ExpressTrip = {
  id: number;
  date: string;
  type: string;
  route: string;
  earnings: number;
  fuel: number;
  notes: string;
};
export type ExpressExpense = {
  id: number;
  date: string;
  category: string;
  desc: string;
  amount: number;
};
export type ExpressBooking = {
  id: number;
  date: string;
  client: string;
  type: string;
  rate: number;
  notes: string;
};
export type ExpressClient = {
  id: number;
  name: string;
  phone: string;
  address: string;
  type: string;
  notes: string;
};
export type Maintenance = {
  id: number;
  label: string;
  note: string;
  status: "good" | "warn" | "alert";
  msg: string;
};

export type DupartProduct = {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
};
export type DupartSaleItem = { productId: number; name: string; price: number; qty: number };
export type DupartSale = {
  id: number;
  date: string;
  items: DupartSaleItem[];
  total: number;
  cash: number;
  change: number;
};

export type GhettoOrder = {
  id: number;
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
  id: number;
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

// ─────────── Defaults ───────────
const DEFAULTS = {
  express: {
    trips: [
      { id: 1, date: "2025-04-20", type: "Lalamove", route: "Laguna → Pasay", earnings: 850, fuel: 200, notes: "" },
      { id: 2, date: "2025-04-21", type: "Rental – Full Day", route: "Biñan → Tagaytay", earnings: 3500, fuel: 600, notes: "Client: Mark" },
      { id: 3, date: "2025-04-22", type: "Lalamove", route: "San Pedro → Parañaque", earnings: 620, fuel: 150, notes: "" },
    ] as ExpressTrip[],
    expenses: [
      { id: 1, date: "2025-04-15", category: "Maintenance", desc: "Oil change", amount: 800 },
      { id: 2, date: "2025-04-18", category: "Repair", desc: "Brake pads", amount: 1200 },
    ] as ExpressExpense[],
    bookings: [
      { id: 1, date: "2025-04-28", client: "Mark Santos", type: "Rental – Full Day", rate: 3500, notes: "Tagaytay trip" },
      { id: 2, date: "2025-05-02", client: "Anna Reyes", type: "Rental – Half Day", rate: 2000, notes: "Airport pickup" },
    ] as ExpressBooking[],
    clients: [
      { id: 1, name: "Mark Santos", phone: "09171234567", address: "Biñan, Laguna", type: "Rental", notes: "Regular client" },
      { id: 2, name: "Anna Reyes", phone: "09281234567", address: "Parañaque", type: "Rental", notes: "Airport runs" },
    ] as ExpressClient[],
    maintenance: [
      { id: 1, label: "Oil Change", note: "Every 5,000 km / 3 months", status: "good", msg: "Up to date" },
      { id: 2, label: "Tire Rotation", note: "Due in: 2 weeks", status: "warn", msg: "Schedule soon" },
      { id: 3, label: "LTO Registration", note: "Expires: June 2025", status: "alert", msg: "Renewal required" },
      { id: 4, label: "Air Filter", note: "Replaced: March 2025", status: "good", msg: "Good condition" },
      { id: 5, label: "Battery Check", note: "Last checked: Feb 2025", status: "warn", msg: "Check soon" },
      { id: 6, label: "Brake Fluid", note: "Next: 20,000 km", status: "good", msg: "Up to date" },
    ] as Maintenance[],
  },
  dupart: {
    products: [
      { id: 1, name: "Classic Hotdog", price: 25, cost: 12, stock: 50 },
      { id: 2, name: "Jumbo Hotdog", price: 35, cost: 18, stock: 40 },
      { id: 3, name: "Cheesy Dog", price: 40, cost: 20, stock: 30 },
      { id: 4, name: "Spicy Dog", price: 35, cost: 17, stock: 35 },
      { id: 5, name: "Corn Dog", price: 30, cost: 14, stock: 25 },
      { id: 6, name: "Double Dog", price: 50, cost: 26, stock: 20 },
      { id: 7, name: "Softdrink (330ml)", price: 20, cost: 10, stock: 60 },
      { id: 8, name: "Bottled Water", price: 10, cost: 5, stock: 80 },
    ] as DupartProduct[],
    sales: [] as DupartSale[],
  },
  ghetto: {
    orders: [
      { id: 1, client: "Juan dela Cruz", type: "DTF Print", item: "T-shirt", qty: 12, size: "A4", price: 840, status: "In Progress", date: "2025-04-20", notes: "White shirt, full color", dp: 420 },
      { id: 2, client: "Maria Santos", type: "Silkscreen", item: "Polo", qty: 24, size: "A3", price: 2400, status: "Pending", date: "2025-04-21", notes: "2-color, black ink", dp: 1200 },
      { id: 3, client: "Pedro Garcia", type: "DTF Print", item: "Hoodie", qty: 6, size: "A4", price: 900, status: "For Pickup", date: "2025-04-19", notes: "", dp: 0 },
    ] as GhettoOrder[],
    materials: [
      { id: 1, name: "DTF Film Roll (30cm)", unit: "meters", stock: 45, reorder: 10 },
      { id: 2, name: "DTF Ink Set (CMYK+W)", unit: "sets", stock: 3, reorder: 2 },
      { id: 3, name: "Hot Melt Adhesive Powder", unit: "kg", stock: 2.5, reorder: 1 },
      { id: 4, name: "Silkscreen Ink – Black", unit: "liters", stock: 1.2, reorder: 0.5 },
      { id: 5, name: "Silkscreen Ink – Colors", unit: "liters", stock: 0.8, reorder: 0.5 },
      { id: 6, name: "Silk Mesh Frames (A3)", unit: "pcs", stock: 8, reorder: 3 },
      { id: 7, name: "Plain T-shirts (White)", unit: "pcs", stock: 24, reorder: 12 },
      { id: 8, name: "Emulsion (for silkscreen)", unit: "liters", stock: 0.6, reorder: 0.3 },
    ] as GhettoMaterial[],
  },
};

type State = typeof DEFAULTS & {
  theme: "dark" | "light";
};

type Actions = {
  // express
  addTrip: (t: Omit<ExpressTrip, "id">) => void;
  removeTrip: (id: number) => void;
  addExpense: (e: Omit<ExpressExpense, "id">) => void;
  removeExpense: (id: number) => void;
  addBooking: (b: Omit<ExpressBooking, "id">) => void;
  removeBooking: (id: number) => void;
  addClient: (c: Omit<ExpressClient, "id">) => void;
  removeClient: (id: number) => void;
  cycleMaintenance: (id: number) => void;
  // dupart
  upsertProduct: (p: Omit<DupartProduct, "id"> & { id?: number }) => void;
  removeProduct: (id: number) => void;
  recordSale: (sale: Omit<DupartSale, "id" | "date">) => DupartSale;
  // ghetto
  upsertOrder: (o: Omit<GhettoOrder, "id"> & { id?: number }) => void;
  removeOrder: (id: number) => void;
  setOrderStatus: (id: number, status: GhettoOrder["status"]) => void;
  upsertMaterial: (m: Omit<GhettoMaterial, "id"> & { id?: number }) => void;
  removeMaterial: (id: number) => void;
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

export const useHub = create<State & Actions>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      theme: "dark",

      addTrip: (t) =>
        set((s) => ({ express: { ...s.express, trips: [{ id: uid(), ...t }, ...s.express.trips] } })),
      removeTrip: (id) =>
        set((s) => ({ express: { ...s.express, trips: s.express.trips.filter((x) => x.id !== id) } })),
      addExpense: (e) =>
        set((s) => ({ express: { ...s.express, expenses: [{ id: uid(), ...e }, ...s.express.expenses] } })),
      removeExpense: (id) =>
        set((s) => ({ express: { ...s.express, expenses: s.express.expenses.filter((x) => x.id !== id) } })),
      addBooking: (b) =>
        set((s) => ({ express: { ...s.express, bookings: [{ id: uid(), ...b }, ...s.express.bookings] } })),
      removeBooking: (id) =>
        set((s) => ({ express: { ...s.express, bookings: s.express.bookings.filter((x) => x.id !== id) } })),
      addClient: (c) =>
        set((s) => ({ express: { ...s.express, clients: [{ id: uid(), ...c }, ...s.express.clients] } })),
      removeClient: (id) =>
        set((s) => ({ express: { ...s.express, clients: s.express.clients.filter((x) => x.id !== id) } })),
      cycleMaintenance: (id) =>
        set((s) => ({
          express: {
            ...s.express,
            maintenance: s.express.maintenance.map((m) => {
              if (m.id !== id) return m;
              const ns = nextStatus[m.status];
              return { ...m, status: ns, msg: statusMsg[ns] };
            }),
          },
        })),

      upsertProduct: (p) =>
        set((s) => {
          const products = [...s.dupart.products];
          if (p.id) {
            const i = products.findIndex((x) => x.id === p.id);
            if (i >= 0) products[i] = { ...products[i], ...p } as DupartProduct;
          } else {
            products.unshift({ id: uid(), ...p } as DupartProduct);
          }
          return { dupart: { ...s.dupart, products } };
        }),
      removeProduct: (id) =>
        set((s) => ({ dupart: { ...s.dupart, products: s.dupart.products.filter((x) => x.id !== id) } })),
      recordSale: (sale) => {
        const newSale: DupartSale = { id: uid(), date: new Date().toISOString(), ...sale };
        set((s) => {
          // decrement stock
          const products = s.dupart.products.map((p) => {
            const item = sale.items.find((i) => i.productId === p.id);
            return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
          });
          return { dupart: { ...s.dupart, products, sales: [newSale, ...s.dupart.sales] } };
        });
        return newSale;
      },

      upsertOrder: (o) =>
        set((s) => {
          const orders = [...s.ghetto.orders];
          if (o.id) {
            const i = orders.findIndex((x) => x.id === o.id);
            if (i >= 0) orders[i] = { ...orders[i], ...o } as GhettoOrder;
          } else {
            orders.unshift({ id: uid(), ...o } as GhettoOrder);
          }
          return { ghetto: { ...s.ghetto, orders } };
        }),
      removeOrder: (id) =>
        set((s) => ({ ghetto: { ...s.ghetto, orders: s.ghetto.orders.filter((x) => x.id !== id) } })),
      setOrderStatus: (id, status) =>
        set((s) => ({
          ghetto: {
            ...s.ghetto,
            orders: s.ghetto.orders.map((o) => (o.id === id ? { ...o, status } : o)),
          },
        })),
      upsertMaterial: (m) =>
        set((s) => {
          const materials = [...s.ghetto.materials];
          if (m.id) {
            const i = materials.findIndex((x) => x.id === m.id);
            if (i >= 0) materials[i] = { ...materials[i], ...m } as GhettoMaterial;
          } else {
            materials.unshift({ id: uid(), ...m } as GhettoMaterial);
          }
          return { ghetto: { ...s.ghetto, materials } };
        }),
      removeMaterial: (id) =>
        set((s) => ({ ghetto: { ...s.ghetto, materials: s.ghetto.materials.filter((x) => x.id !== id) } })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "jbh_v3",
      version: 1,
    },
  ),
);
