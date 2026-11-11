import { setStoreId } from "@/lib/api";

const KEY = "rs_impersonating";
export type Impersonation = { id: number; name: string };

export const getImpersonation = (): Impersonation | null => {
  if (typeof window === "undefined") return null;
  const v = window.sessionStorage.getItem(KEY);
  return v ? JSON.parse(v) : null;
};
export function startImpersonation(s: Impersonation) {
  window.sessionStorage.setItem(KEY, JSON.stringify(s));
  setStoreId(s.id);
}
export function stopImpersonation() {
  window.sessionStorage.removeItem(KEY);
  setStoreId(null);
}
