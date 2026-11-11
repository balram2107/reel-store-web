"use client";
import { useCallback, useSyncExternalStore } from "react";
import type { CartLine } from "./storefront-types";

const EMPTY: CartLine[] = [];
const EVT = "reel-cart-change";
const key = (slug: string) => `reel:cart:${slug}`;
let cache: { k: string; raw: string | null; val: CartLine[] } | null = null;

function read(slug: string): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  const k = key(slug);
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(k);
  } catch {
    return EMPTY;
  }
  if (cache && cache.k === k && cache.raw === raw) return cache.val;
  let val: CartLine[] = EMPTY;
  try {
    const p = raw ? JSON.parse(raw) : [];
    if (Array.isArray(p)) val = p;
  } catch {}
  cache = { k, raw, val };
  return val;
}
function write(slug: string, lines: CartLine[]) {
  try {
    localStorage.setItem(key(slug), JSON.stringify(lines));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
};
const sameLine = (a: CartLine, b: Pick<CartLine, "product_id" | "variant">) =>
  a.product_id === b.product_id &&
  JSON.stringify(Object.entries(a.variant).sort()) ===
    JSON.stringify(Object.entries(b.variant).sort());

export function useCart(slug: string) {
  const lines = useSyncExternalStore(
    subscribe,
    () => read(slug),
    () => EMPTY,
  );
  const add = useCallback(
    (l: CartLine, cap: number | null = null) => {
      const cur = read(slug);
      const i = cur.findIndex((x) => sameLine(x, l));
      const next = [...cur];
      if (i >= 0) {
        const q = next[i].quantity + l.quantity;
        next[i] = { ...next[i], quantity: cap ? Math.min(q, cap) : q };
      } else next.push(l);
      write(slug, next);
    },
    [slug],
  );
  const setQty = useCallback(
    (l: CartLine, quantity: number) => {
      write(
        slug,
        read(slug).map((x) =>
          sameLine(x, l) ? { ...x, quantity: Math.max(1, quantity) } : x,
        ),
      );
    },
    [slug],
  );
  const remove = useCallback(
    (l: Pick<CartLine, "product_id" | "variant">) =>
      write(
        slug,
        read(slug).filter((x) => !sameLine(x, l)),
      ),
    [slug],
  );
  const clear = useCallback(() => write(slug, []), [slug]);
  return {
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    add,
    setQty,
    remove,
    clear,
  };
}

// "Order now": one item, checked out without touching the cart.
const bnKey = (slug: string) => `reel:buynow:${slug}`;
export const setBuyNow = (slug: string, l: CartLine) => {
  try {
    sessionStorage.setItem(bnKey(slug), JSON.stringify(l));
  } catch {}
};
export const clearBuyNow = (slug: string) => {
  try {
    sessionStorage.removeItem(bnKey(slug));
  } catch {}
};
export function getBuyNow(slug: string): CartLine | null {
  try {
    const r = sessionStorage.getItem(bnKey(slug));
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
