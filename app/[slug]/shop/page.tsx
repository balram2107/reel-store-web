"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "@/components/storefront/ctx";
import {
  btn,
  Empty,
  ErrorBox,
  inputStyle,
  Pager,
  ProductCard,
  SkeletonGrid,
} from "@/components/storefront/ui";
import { api, useAsync } from "@/lib/storefront-api";
import type { Highlight, ProductQuery } from "@/lib/storefront-types";

const PER = 12;
const SORTS = [
  ["newest", "Newest"],
  ["popular", "Popular"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
] as const;
const TITLES: Record<string, string> = {
  new: "New arrivals",
  bestsellers: "Bestsellers",
  sale: "Sale",
  gifts: "Gifts",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="rs-wrap" style={{ padding: 48 }}>
          <SkeletonGrid n={6} />
        </div>
      }
    >
      <Shop />
    </Suspense>
  );
}

function Shop() {
  const { slug, store, cats } = useStore();
  const sp = useSearchParams();
  const router = useRouter();
  const get = (k: string) => sp.get(k) ?? "";
  const page = Math.max(1, Number(get("page")) || 1);
  const query: ProductQuery = {
    page,
    per_page: PER,
    q: get("q"),
    category: get("category"),
    highlight: (get("highlight") || undefined) as Highlight | undefined,
    sort: (get("sort") || "newest") as ProductQuery["sort"],
    in_stock: get("in_stock") === "true",
    min_price_paise: get("min")
      ? Math.round(Number(get("min")) * 100)
      : undefined,
    max_price_paise: get("max")
      ? Math.round(Number(get("max")) * 100)
      : undefined,
  };
  const r = useAsync(() => api.products(slug, query), [slug, sp.toString()]);
  const [min, setMin] = useState(get("min"));
  const [max, setMax] = useState(get("max"));

  const url = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    if (!("page" in patch)) n.delete("page");
    const s = n.toString();
    return `/${slug}/shop${s ? `?${s}` : ""}`;
  };
  const catName = cats?.categories.find(
    (c) => c.slug === get("category"),
  )?.name;
  const title = get("q")
    ? `Results for “${get("q")}”`
    : (catName ?? TITLES[get("highlight")] ?? "All products");
  const row = (
    label: string,
    count: number | undefined,
    on: boolean,
    href: string,
  ) => (
    <Link
      key={label}
      href={href}
      aria-current={on ? "true" : undefined}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "9px 0",
        font: `${on ? 600 : 400} 14px var(--font)`,
        color: on ? "var(--ink)" : "var(--muted)",
        textDecoration: "none",
      }}
    >
      <span>{label}</span>
      {count != null && <span>{count}</span>}
    </Link>
  );
  const noFilter = !get("category") && !get("highlight") && !get("q");
  const filtered = !!(
    get("min") ||
    get("max") ||
    get("in_stock") ||
    get("q") ||
    get("category") ||
    get("highlight")
  );

  return (
    <div className="rs-wrap" style={{ paddingTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0, font: "700 30px var(--font)" }}>
          {title}{" "}
          {r.data && (
            <span
              style={{ font: "400 16px var(--font)", color: "var(--muted)" }}
            >
              {r.data.meta.total} items
            </span>
          )}
        </h1>
        <select
          aria-label="Sort"
          value={get("sort") || "newest"}
          onChange={(e) =>
            router.push(
              url({
                sort: e.target.value === "newest" ? null : e.target.value,
              }),
            )
          }
          style={{
            height: 44,
            border: "1px solid #D1D5DB",
            borderRadius: "var(--r)",
            padding: "0 12px",
            font: "500 14px var(--font)",
            background: "#fff",
          }}
        >
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>
              Sort: {l}
            </option>
          ))}
        </select>
      </div>
      <div className="rs-side" style={{ paddingTop: 28 }}>
        <aside>
          <div style={{ font: "600 14px var(--font)", marginBottom: 8 }}>
            Category
          </div>
          {row(
            "All",
            cats?.totals.all,
            noFilter,
            url({ category: null, highlight: null, q: null }),
          )}
          {cats?.categories.map((c) =>
            row(
              c.name,
              c.product_count,
              get("category") === c.slug,
              url({ category: c.slug, highlight: null }),
            ),
          )}
          {cats &&
            cats.totals.new > 0 &&
            row(
              "New",
              cats.totals.new,
              get("highlight") === "new",
              url({ highlight: "new", category: null }),
            )}
          {cats &&
            cats.totals.bestsellers > 0 &&
            row(
              "Bestsellers",
              cats.totals.bestsellers,
              get("highlight") === "bestsellers",
              url({ highlight: "bestsellers", category: null }),
            )}
          {cats &&
            cats.totals.sale > 0 &&
            row(
              "Sale",
              cats.totals.sale,
              get("highlight") === "sale",
              url({ highlight: "sale", category: null }),
            )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(url({ min: min || null, max: max || null }));
            }}
          >
            <div
              style={{ font: "600 14px var(--font)", margin: "28px 0 12px" }}
            >
              Price
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                aria-label="Min price"
                inputMode="numeric"
                placeholder="Min ₹"
                value={min}
                onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
                style={{
                  ...inputStyle,
                  marginTop: 0,
                  height: 44,
                  width: "50%",
                }}
              />
              <input
                aria-label="Max price"
                inputMode="numeric"
                placeholder="Max ₹"
                value={max}
                onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
                style={{
                  ...inputStyle,
                  marginTop: 0,
                  height: 44,
                  width: "50%",
                }}
              />
            </div>
            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                font: "400 14px var(--font)",
                color: "var(--muted)",
                minHeight: 44,
                marginTop: 16,
              }}
            >
              <input
                type="checkbox"
                checked={get("in_stock") === "true"}
                onChange={(e) =>
                  router.push(
                    url({
                      in_stock: e.target.checked ? "true" : null,
                      min: min || null,
                      max: max || null,
                    }),
                  )
                }
              />{" "}
              In stock only
            </label>
            <button
              type="submit"
              style={{ ...btn(store), width: "100%", minHeight: 44 }}
            >
              Apply filters
            </button>
          </form>
        </aside>
        <div>
          {r.error ? (
            <ErrorBox error={r.error} onRetry={r.reload} />
          ) : !r.data ? (
            <SkeletonGrid n={6} />
          ) : r.data.products.length === 0 ? (
            <Empty title={filtered ? "Nothing matches" : "No products yet"}>
              {filtered ? (
                <Link href={`/${slug}/shop`} style={{ color: "var(--btn)" }}>
                  Clear filters
                </Link>
              ) : (
                "Check back soon."
              )}
            </Empty>
          ) : (
            <>
              <div
                className="rs-grid3"
                style={{ opacity: r.loading ? 0.6 : 1 }}
              >
                {r.data.products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
              <Pager
                page={r.data.meta.page}
                total={r.data.meta.total}
                perPage={r.data.meta.per_page}
                href={(n) => url({ page: String(n) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
