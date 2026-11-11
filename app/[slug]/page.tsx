"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useStore } from "@/components/storefront/ctx";
import {
  btn,
  Empty,
  ErrorBox,
  Img,
  Price,
  ProductCard,
  SectionHead,
  SkeletonGrid,
} from "@/components/storefront/ui";
import { api, useAsync } from "@/lib/storefront-api";
import { useCart } from "@/lib/storefront-cart";
import { inr } from "@/lib/storefront-format";
import type { Highlight, ProductRow } from "@/lib/storefront-types";

export default function Home() {
  const { insta } = useStore();
  return insta ? <InstaHome /> : <ClassicHome />;
}

function Row({ title, highlight }: { title: string; highlight: Highlight }) {
  const { slug } = useStore();
  const r = useAsync(
    () => api.products(slug, { highlight, per_page: 4 }),
    [slug, highlight],
  );
  if (r.data && r.data.products.length === 0) return null;
  return (
    <section style={{ padding: "48px 0 0" }}>
      <SectionHead
        title={title}
        href={`/${slug}/shop?highlight=${highlight}`}
      />
      {r.error ? (
        <ErrorBox error={r.error} onRetry={r.reload} />
      ) : !r.data ? (
        <SkeletonGrid n={4} />
      ) : (
        <div className="rs-grid">
          {r.data.products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}

const CTA = {
  shop: "",
  new: "?highlight=new",
  sale: "?highlight=sale",
  bestsellers: "?highlight=bestsellers",
} as const;
const BANNER_H = { small: 240, medium: 380, large: 520 } as const;

function ClassicHome() {
  const { slug, store, cats } = useStore();
  const s = store.theme.settings;
  const align = s.text_alignment === "center" ? "center" : "left";
  const hero = (
    <div
      key="hero"
      style={{
        margin: "24px 0 0",
        minHeight: BANNER_H[s.banner_height ?? "medium"],
        borderRadius: "var(--r)",
        background: store.banner_url
          ? `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)), url(${store.banner_url}) center/cover`
          : "var(--tile)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        padding: "32px clamp(20px,5vw,64px)",
        color: store.banner_url ? "#fff" : "var(--ink)",
      }}
    >
      <h1
        style={{
          margin: "0 0 8px",
          font: "700 clamp(28px,4vw,44px)/1.1 var(--font)",
          maxWidth: 560,
        }}
      >
        {s.hero_title || store.name}
      </h1>
      {s.hero_subtitle && (
        <p
          style={{
            margin: "0 0 20px",
            font: "400 17px/1.5 var(--font)",
            maxWidth: 520,
          }}
        >
          {s.hero_subtitle}
        </p>
      )}
      <Link
        href={`/${slug}/shop${CTA[s.hero_cta_target ?? "shop"]}`}
        style={{
          ...btn(store),
          width: "max-content",
          marginTop: s.hero_subtitle ? 0 : 12,
        }}
      >
        {s.hero_cta_label || "Shop now"}
      </Link>
    </div>
  );
  const trust = (
    <div key="trust" className="rs-grid3" style={{ paddingTop: 32 }}>
      {[
        store.payments.cod && ["Cash on delivery", "Pay when it arrives"],
        store.return_note && ["Easy returns", store.return_note],
        ["Order tracking", "Track with your order ID"],
      ]
        .filter(Boolean)
        .map((x) => {
          const [a, b] = x as string[];
          return (
            <div
              key={a}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: "var(--r)",
                padding: 16,
                background: "#fff",
              }}
            >
              <div style={{ font: "600 15px var(--font)" }}>{a}</div>
              <div
                style={{
                  font: "400 14px var(--font)",
                  color: "var(--muted)",
                  marginTop: 4,
                }}
              >
                {b}
              </div>
            </div>
          );
        })}
    </div>
  );
  const categories = cats && cats.categories.length > 0 && (
    <section key="categories" style={{ padding: "48px 0 0" }}>
      <SectionHead title="Shop by category" href={`/${slug}/shop`} />
      <div className="rs-grid">
        {cats.categories.map((c) => (
          <Link
            key={c.id}
            href={`/${slug}/shop?category=${c.slug}`}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Img src={c.cover_url} alt={c.name} ratio="4 / 3" />
            <div style={{ font: "600 16px var(--font)", marginTop: 10 }}>
              {c.name}{" "}
              <span
                style={{ font: "400 13px var(--font)", color: "var(--muted)" }}
              >
                ({c.product_count})
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
  const about = (store.about || store.bio) && (
    <section
      key="about"
      id="about"
      style={{
        margin: "48px 0 0",
        padding: 32,
        background: "#F9FAFB",
        borderRadius: "var(--r)",
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--tile)",
          flex: "none",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {store.logo_url && (
          <img
            src={store.logo_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ font: "600 18px var(--font)" }}>About the seller</div>
        <p
          style={{
            margin: "6px 0 0",
            font: "400 15px/1.6 var(--font)",
            color: "var(--muted)",
            maxWidth: 720,
            whiteSpace: "pre-line",
          }}
        >
          {store.about || store.bio}
        </p>
      </div>
    </section>
  );
  // store.layout lists section names in order; names unverified, so match loosely and fall back to the design order.
  const blocks: Record<string, ReactNode> = {
    hero,
    trust,
    categories,
    bestsellers: <Row key="b" title="Bestsellers" highlight="bestsellers" />,
    new: <Row key="n" title="New arrivals" highlight="new" />,
    about,
  };
  const match = (name: string) =>
    Object.keys(blocks).find((k) => name.toLowerCase().includes(k.slice(0, 4)));
  const order = Array.from(
    new Set(store.layout.map(match).filter(Boolean)),
  ) as string[];
  const final = order.length
    ? order
    : ["hero", "trust", "categories", "bestsellers", "new", "about"];
  return (
    <div className="rs-wrap" style={{ paddingBottom: 8 }}>
      {final.map((k) => blocks[k])}
    </div>
  );
}

function InstaHome() {
  const { slug, store, cats } = useStore();
  const r = useAsync(() => api.products(slug, { per_page: 24 }), [slug]);
  const [quick, setQuick] = useState<ProductRow | null>(null);
  const circles = [
    cats &&
      cats.totals.new > 0 && {
        label: "New",
        href: `/${slug}/shop?highlight=new`,
        src: null as string | null,
      },
    ...(cats?.categories ?? []).map((c) => ({
      label: c.name,
      href: `/${slug}/shop?category=${c.slug}`,
      src: c.cover_url,
    })),
    cats &&
      cats.totals.sale > 0 && {
        label: "Sale",
        href: `/${slug}/shop?highlight=sale`,
        src: null,
      },
  ].filter(Boolean) as { label: string; href: string; src: string | null }[];
  return (
    <div className="rs-wrap" style={{ maxWidth: 960, padding: "0 24px" }}>
      {circles.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 24,
            padding: "24px 0 8px",
            overflowX: "auto",
          }}
        >
          {circles.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              style={{
                textAlign: "center",
                width: 84,
                flex: "none",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  margin: "0 auto",
                  borderRadius: "50%",
                  background: c.src
                    ? `url(${c.src}) center/cover`
                    : "var(--tile)",
                  border: "3px solid #fff",
                  outline: "2px solid var(--accent)",
                }}
              />
              <div style={{ font: "500 13px var(--font)", marginTop: 8 }}>
                {c.label}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ height: 12 }} />
      {r.error ? (
        <ErrorBox error={r.error} onRetry={r.reload} />
      ) : !r.data ? (
        <SkeletonGrid n={8} />
      ) : r.data.products.length === 0 ? (
        <Empty title="No products yet">
          New pieces are on the way. Follow along on Instagram.
        </Empty>
      ) : (
        <div className="rs-grid">
          {r.data.products.map((p) => (
            <ProductCard key={p.id} p={p} onQuick={setQuick} />
          ))}
        </div>
      )}
      {r.data && r.data.meta.total > r.data.products.length && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href={`/${slug}/shop`} style={btn(store)}>
            See all {r.data.meta.total} products
          </Link>
        </div>
      )}
      {(store.about || store.bio) && (
        <p
          id="about"
          style={{
            marginTop: 40,
            font: "400 15px/1.6 var(--font)",
            color: "var(--muted)",
            whiteSpace: "pre-line",
          }}
        >
          {store.about || store.bio}
        </p>
      )}
      {quick && <QuickView p={quick} onClose={() => setQuick(null)} />}
    </div>
  );
}

function QuickView({ p, onClose }: { p: ProductRow; onClose: () => void }) {
  const { slug, store } = useStore();
  const { add } = useCart(slug);
  const d = useAsync(() => api.product(slug, p.slug), [slug, p.slug]);
  const prod = d.data?.product ?? p;
  const needsOptions = prod.variants.length > 0;
  const dispatch = d.data?.dispatch_note ?? store.dispatch_note;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        zIndex: 30,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: 560,
          borderRadius: "24px 24px 0 0",
          padding: 20,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 110, flex: "none" }}>
          <Img src={p.card_url ?? p.cover_url} alt={p.name} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ font: "600 18px var(--font)" }}>{p.name}</div>
          <div style={{ marginTop: 4 }}>
            <Price p={prod} size={16} />
          </div>
          {needsOptions && (
            <div
              style={{
                font: "400 14px var(--font)",
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              {prod.variants
                .map((v) => `${v.name}: ${v.options.join(", ")}`)
                .join(" · ")}
            </div>
          )}
          {dispatch && (
            <div
              style={{
                font: "400 14px var(--font)",
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              {dispatch}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {!p.in_stock ? (
            <span
              style={{
                font: "600 15px var(--font)",
                color: "var(--muted)",
                padding: 12,
              }}
            >
              Sold out
            </span>
          ) : needsOptions ? (
            <Link
              href={`/${slug}/p/${p.slug}`}
              style={{ ...btn(store), flex: 1, borderRadius: 999 }}
            >
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                add(
                  { product_id: p.id, slug: p.slug, variant: {}, quantity: 1 },
                  p.max_quantity,
                );
                onClose();
              }}
              style={{ ...btn(store), flex: 1, borderRadius: 999 }}
            >
              Add to cart · {inr(p.price_paise)}
            </button>
          )}
          <Link
            href={`/${slug}/p/${p.slug}`}
            style={{ ...btn(store, "secondary"), borderRadius: 999 }}
          >
            Details
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              ...btn(store, "secondary"),
              borderRadius: 999,
              minWidth: 48,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
