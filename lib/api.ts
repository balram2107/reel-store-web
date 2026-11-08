export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string[]>;
  constructor(
    status: number,
    code: string,
    message: string,
    fields: Record<string, string[]> = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
const ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");
const BASE = ORIGIN + "/api/v1";
const ls = (k: string) =>
  typeof window === "undefined" ? null : window.localStorage.getItem(k);
export const getToken = () => ls("rs_token");
export const setToken = (t: string) =>
  window.localStorage.setItem("rs_token", t);
export const clearToken = () => {
  window.localStorage.removeItem("rs_token");
  window.localStorage.removeItem("rs_store_id");
  window.sessionStorage.removeItem("rs_impersonating");
};
export const getStoreId = () => ls("rs_store_id");
export const setStoreId = (id: number | null) =>
  id == null
    ? window.localStorage.removeItem("rs_store_id")
    : window.localStorage.setItem("rs_store_id", String(id));
export const abs = (u: string) => (u.startsWith("/") ? ORIGIN + u : u);
export const errText = (e: unknown) =>
  e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
type Opts = {
  method?: string;
  body?: unknown;
  form?: FormData;
  auth?: boolean;
  store?: boolean;
  headers?: Record<string, string>;
  revalidate?: number;
};
export async function api<T>(path: string, o: Opts = {}): Promise<T> {
  const h: Record<string, string> = {
    Accept: "application/json",
    ...o.headers,
  };
  if (o.body !== undefined) h["Content-Type"] = "application/json";
  if (o.auth) {
    const t = getToken();
    if (t) h.Authorization = "Bearer " + t;
    if (o.store !== false) {
      const s = getStoreId();
      if (s) h["X-Store-ID"] = s;
    }
  }
  const init: RequestInit & { next?: { revalidate: number } } = {
    method: o.method || "GET",
    headers: h,
    body: o.form ?? (o.body !== undefined ? JSON.stringify(o.body) : undefined),
  };
  if (o.revalidate !== undefined) init.next = { revalidate: o.revalidate };
  else init.cache = "no-store";
  const res = await fetch(BASE + path, init);
  if (!res.ok) {
    let e: {
      error?: {
        code?: string;
        message?: string;
        fields?: Record<string, string[]>;
      };
    } = {};
    try {
      e = await res.json();
    } catch {}
    if (res.status === 401 && o.auth && typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }
    throw new ApiError(
      res.status,
      e.error?.code || "error",
      e.error?.message || "Something went wrong. Please try again.",
      e.error?.fields || {},
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
