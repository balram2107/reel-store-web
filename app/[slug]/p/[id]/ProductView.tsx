"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/storefront/ctx";
import {
  btn,
  ErrorBox,
  Img,
  Price,
  ProductCard,
  SectionHead,
} from "@/components/storefront/ui";
import { api, useAsync } from "@/lib/storefront-api";
import { setBuyNow, useCart } from "@/lib/storefront-cart";
import type { CartLine } from "@/lib/storefront-types";

export default function ProductView() {
  const { slug, store, insta } = useStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { add } = useCart(slug);
  const r = useAsync(() => api.product(slug, id), [slug, id]);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  if (r.error)
    return (
      <div className="rs-wrap" style={{ padding: "48px" }}>
        {r.error.status === 404 ? (
          <ErrorBox error={new Error("This product isn’t available.")} />
        ) : (
          <ErrorBox error={r.error} onRetry={r.reload} />
        )}
      </div>
    );
  if (!r.data)
    return (
      <div
        className="rs-wrap rs-two"
        style={{ padding: "32px 48px" }}
        aria-busy="true"
      >
        <div
          style={{
            aspectRatio: "1",
            background: "var(--tile)",
            borderRadius: "var(--r)",
            opacity: 0.6,
          }}
        />
        <div>
          <div
            style={{
              height: 32,
              width: "60%",
              background: "var(--tile)",
              borderRadius: 6,
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    );

  const { product: p, related } = r.data;
  const dispatch = r.data.dispatch_note ?? store.dispatch_note;
  const ret = r.data.return_note ?? store.return_note;
  const missing = p.variants.find((v) => !sel[v.name]);
  const max = p.max_quantity ?? 99;
  const images = p.images.length
    ? p.images
    : p.cover_url
      ? [
          {
            id: 0,
            url: p.cover_url,
            thumb_url: p.cover_url,
            position: 0,
            cover: true,
          },
        ]
      : [];
  const line = (): CartLine => ({
    product_id: p.id,
    slug: p.slug,
    variant: sel,
    quantity: qty,
  });
  const guard = () => {
    if (missing) {
      setMsg(`Please choose a ${missing.name.toLowerCase()}.`);
      return false;
    }
    setMsg(null);
    return true;
  };
  const pill = (on: boolean) =>
    ({
      minHeight: 44,
      minWidth: 44,
      padding: "0 16px",
      borderRadius: insta ? 999 : "var(--r)",
      border: on ? "2px solid var(--btn)" : "1px solid #D1D5DB",
      background: on ? "color-mix(in srgb, var(--btn) 10%, white)" : "#fff",
      color: "var(--ink)",
      font: "500 14px var(--font)",
      cursor: "pointer",
    }) as const;
  const rad = insta ? 999 : undefined;

  return (
    <div
      className="rs-wrap"
      style={{ maxWidth: insta ? 960 : 1200, paddingTop: 20 }}
    >
      <nav
        aria-label="Breadcrumb"
        style={{
          font: "400 14px var(--font)",
          color: "var(--muted)",
          marginBottom: 20,
        }}
      >
        <Link href={`/${slug}`} style={{ color: "inherit" }}>
          Home
        </Link>{" "}
        /{" "}
        {p.category && (
          <>
            <Link
              href={`/${slug}/shop?category=${p.category.slug}`}
              style={{ color: "inherit" }}
            >
              {p.category.name}
            </Link>{" "}
            /{" "}
          </>
        )}
        {p.name}
      </nav>
      <div className="rs-two">
        <div>
          <Img
            src={images[img]?.url ?? null}
            alt={p.name}
            radius={insta ? "24px" : undefined}
          />
          {images.length > 1 && (
            <>
              <div
                style={{
                  textAlign: "right",
                  font: "400 13px var(--font)",
                  color: "var(--muted)",
                  marginTop: 6,
                }}
              >
                {img + 1} / {images.length}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 12,
                  marginTop: 6,
                }}
              >
                {images.map((im, i) => (
                  <button
                    key={im.id}
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    aria-pressed={i === img}
                    onClick={() => setImg(i)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      outline: i === img ? "2px solid var(--btn)" : "none",
                      borderRadius: "var(--r)",
                    }}
                  >
                    <Img src={im.thumb_url} alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ position: "sticky", top: 24, alignSelf: "start" }}>
          {p.category && (
            <div
              style={{ font: "400 14px var(--font)", color: "var(--muted)" }}
            >
              {p.category.name}
            </div>
          )}
          <h1 style={{ margin: "6px 0 8px", font: "700 30px/1.2 var(--font)" }}>
            {p.name}
          </h1>
          <div style={{ font: "700 26px var(--font)" }}>
            <Price p={p} size={26} />
          </div>
          {p.stock_label && (
            <div
              style={{
                font: "500 14px var(--font)",
                color: p.in_stock ? "#15803D" : "#B91C1C",
                marginTop: 6,
              }}
            >
              {p.stock_label}
            </div>
          )}
          {p.description && (
            <p
              style={{
                font: "400 15px/1.6 var(--font)",
                color: "var(--muted)",
                margin: "16px 0 0",
                whiteSpace: "pre-line",
              }}
            >
              {p.description}
            </p>
          )}
          {p.variants.map((v) => (
            <div
              key={v.name}
              role="radiogroup"
              aria-label={v.name}
              style={{ marginTop: 20 }}
            >
              <div style={{ font: "600 14px var(--font)", marginBottom: 10 }}>
                {v.name}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {v.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={sel[v.name] === o}
                    onClick={() => {
                      setSel({ ...sel, [v.name]: o });
                      setMsg(null);
                    }}
                    style={pill(sel[v.name] === o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #D1D5DB",
                borderRadius: rad ?? "var(--r)",
                background: "#fff",
              }}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty(qty - 1)}
                style={{
                  all: "unset",
                  width: 44,
                  height: 52,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                −
              </button>
              <span
                aria-live="polite"
                style={{
                  minWidth: 28,
                  textAlign: "center",
                  font: "500 16px var(--font)",
                }}
              >
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={qty >= max}
                onClick={() => setQty(qty + 1)}
                style={{
                  all: "unset",
                  width: 44,
                  height: 52,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!p.in_stock}
              onClick={() => {
                if (guard()) {
                  add(line(), p.max_quantity);
                  router.push(`/${slug}/cart`);
                }
              }}
              style={{
                ...btn(store),
                flex: 1,
                minHeight: 52,
                borderRadius: rad,
                opacity: p.in_stock ? 1 : 0.5,
              }}
            >
              {p.in_stock ? "Add to cart" : "Sold out"}
            </button>
          </div>
          <button
            type="button"
            disabled={!p.in_stock}
            onClick={() => {
              if (guard()) {
                setBuyNow(slug, line());
                router.push(`/${slug}/checkout?now=1`);
              }
            }}
            style={{
              ...btn(store, "secondary"),
              width: "100%",
              minHeight: 52,
              marginTop: 12,
              borderRadius: rad,
              opacity: p.in_stock ? 1 : 0.5,
            }}
          >
            Order now
          </button>
          {msg && (
            <div
              role="alert"
              style={{
                marginTop: 10,
                font: "500 14px var(--font)",
                color: "#B91C1C",
              }}
            >
              {msg}
            </div>
          )}
          <div
            style={{
              marginTop: 24,
              borderTop: "1px solid #E5E7EB",
              paddingTop: 16,
              font: "400 14px/1.8 var(--font)",
              color: "var(--muted)",
            }}
          >
            {dispatch && <div>{dispatch}</div>}
            {store.payments.upi && (
              <div>
                Pay by UPI: your QR appears right after you order (10-minute
                window)
              </div>
            )}
            {store.payments.cod && <div>Cash on delivery available</div>}
            {ret && <div>{ret}</div>}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section style={{ paddingTop: 48 }}>
          <SectionHead
            title={insta ? "More from this store" : "You may also like"}
            href={`/${slug}/shop`}
          />
          <div className="rs-grid">
            {related.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
