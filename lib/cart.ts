import type { CartLine } from "./types";
const key = (s: string) => "rs_cart_" + s;
export const getCart = (s: string): CartLine[] => {
  try {
    return JSON.parse(localStorage.getItem(key(s)) || "[]");
  } catch {
    return [];
  }
};
export const setCart = (s: string, c: CartLine[]) =>
  localStorage.setItem(key(s), JSON.stringify(c));
export const clearCart = (s: string) => localStorage.removeItem(key(s));
export function addLine(s: string, l: CartLine) {
  const c = getCart(s);
  const k = JSON.stringify(l.variant || {});
  const e = c.find(
    (x) =>
      x.product_id === l.product_id && JSON.stringify(x.variant || {}) === k,
  );
  if (e) e.quantity += l.quantity;
  else c.push(l);
  setCart(s, c);
}
