export const rupees = (p: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: p % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(p / 100);
export function onColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const L =
    0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  return L > 0.2 ? "#0F172A" : "#FFFFFF";
}
export const waUrl = (n?: string | null) => {
  if (!n) return null;
  const d = n.replace(/\D/g, "");
  return "https://wa.me/" + (d.length === 10 ? "91" + d : d);
};
export const STATUS: Record<string, [string, string]> = {
  placed: ["Placed", "n"],
  awaiting_payment: ["Awaiting payment", "a"],
  payment_submitted: ["Payment submitted", "b"],
  paid: ["Paid", "g"],
  packed: ["Packed", "b"],
  shipped: ["Shipped", "b"],
  delivered: ["Delivered", "g"],
  cancelled: ["Cancelled", "r"],
  expired: ["Expired", "r"],
};
export const variantText = (v?: Record<string, string>) =>
  v
    ? Object.entries(v)
        .map(([k, x]) => k + ": " + x)
        .join(", ")
    : "";
export const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
