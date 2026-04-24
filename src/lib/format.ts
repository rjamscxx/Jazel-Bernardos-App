export const peso = (n: number | string) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const peso0 = (n: number | string) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 });

export const today = () => new Date().toISOString().split("T")[0];

export const uid = () => Date.now() + Math.floor(Math.random() * 9999);

export const dateLabel = (d: Date = new Date()) =>
  d.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const shortDate = (s: string) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
};

export type DateFilter = "all" | "today" | "week" | "month";

export function filterByDate<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T,
  f: DateFilter,
): T[] {
  if (f === "all") return items;
  const now = new Date();
  const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return items.filter((x) => {
    const v = x[key];
    const d = new Date(v as string).getTime();
    if (Number.isNaN(d)) return false;
    if (f === "today") return d >= sod;
    if (f === "week") return d >= sod - 6 * 86400000;
    if (f === "month") {
      const dt = new Date(v as string);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }
    return true;
  });
}
