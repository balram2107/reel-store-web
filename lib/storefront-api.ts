import { useEffect, useState } from "react";
import type {
  Categories,
  OrderCreated,
  OrderRequest,
  ProductDetail,
  ProductList,
  ProductQuery,
  ProductRow,
  Quote,
  Store,
} from "./storefront-types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string | string[]>;
  constructor(
    status: number,
    code: string,
    message: string,
    fields: Record<string, string | string[]> = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function req<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;
  let res: Response;
  try {
    res = await fetch(API_BASE + path, { ...init, headers });
  } catch {
    throw new ApiError(
      0,
      "network",
      "Can't reach the server. Check your connection and try again.",
    );
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429)
      throw new ApiError(
        429,
        "rate_limited",
        "Too many attempts. Please wait a bit and try again.",
      );
    throw new ApiError(
      res.status,
      body?.code ?? "error",
      body?.message ?? "Something went wrong.",
      body?.fields ?? {},
    );
  }
  return body as T;
}

const sp = (slug: string) => `/public/stores/${encodeURIComponent(slug)}`;

export const api = {
  store: (slug: string) => req<{ store: Store }>(sp(slug)).then((r) => r.store),
  categories: (slug: string) => req<Categories>(`${sp(slug)}/categories`),
  products: (slug: string, q: ProductQuery = {}) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== false) p.set(k, String(v));
    });
    const s = p.toString();
    return req<ProductList>(`${sp(slug)}/products${s ? `?${s}` : ""}`);
  },
  product: (slug: string, idOrSlug: string) =>
    req<{
      product: ProductDetail;
      related: ProductRow[];
      dispatch_note: string | null;
      return_note: string | null;
    }>(`${sp(slug)}/products/${encodeURIComponent(idOrSlug)}`),
  quote: (
    slug: string,
    items: {
      product_id: number;
      variant: Record<string, string>;
      quantity: number;
    }[],
  ) =>
    req<Quote>(`${sp(slug)}/cart/quote`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  pincode: (pin: string) =>
    req<{ pincode: string; city: string; state: string }>(
      `/public/pincodes/${pin}`,
    ),
  createOrder: (slug: string, body: OrderRequest, idempotencyKey: string) =>
    req<OrderCreated>(`${sp(slug)}/orders`, {
      method: "POST",
      body: JSON.stringify(body),
      idempotencyKey,
    }),
  lookup: (slug: string, body: {slug: string; public_id: string; phone: string }) =>
    req<{ tracking_token: string; next: { path: string } }>(
      `${sp(slug)}/orders/lookup`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
};

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{
    data?: T;
    error?: ApiError;
    loading: boolean;
  }>({ loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    set((s) => ({ data: s.data, loading: true }));
    fn().then(
      (data) => live && set({ data, loading: false }),
      (e) =>
        live &&
        set({
          error:
            e instanceof ApiError
              ? e
              : new ApiError(0, "error", String(e?.message ?? e)),
          loading: false,
        }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}
