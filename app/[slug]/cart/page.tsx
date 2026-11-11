"use client";
import Link from "next/link";
import { useStore } from "@/components/storefront/ctx";
import { btn, Empty, ErrorBox, Img } from "@/components/storefront/ui";
import { api, useAsync } from "@/lib/storefront-api";
import { useCart } from "@/lib/storefront-cart";
import { inr } from "@/lib/storefront-format";

export default function CartPage() {
  const { slug, store } = useStore();
  const { lines, setQty, remove } = useCart(slug);
  const key = JSON.stringify(lines);
  const q = useAsync(
    () =>
      lines.length
        ? api.quote(
            slug,
            lines.map(({ product_id, variant, quantity }) => ({
              product_id,
              variant,
              quantity,
            })),
          )
        : Promise.resolve(null),
    [slug, key],
  );

  return (
    <div className="rs-wrap" style={{ paddingTop: 24, maxWidth: 860 }}>
      <h1 style={{ margin: "0 0 20px", font: "700 30px var(--font)" }}>
        Your cart
      </h1>
      {lines.length === 0 ? (
        <Empty title="Your cart is empty">
          <Link href={`/${slug}/shop`} style={{ color: "var(--btn)" }}>
            Browse products
          </Link>
        </Empty>
      ) : q.error ? (
        <ErrorBox error={q.error} onRetry={q.reload} />
      ) : !q.data ? (
        <div aria-busy="true" style={{ color: "var(--muted)" }}>
          Checking prices and stock…
        </div>
      ) : (
        <>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              opacity: q.loading ? 0.6 : 1,
            }}
          >
            {q.data.items.map((it) => {
              const line =
                lines.find(
                  (l) =>
                    l.product_id === it.product_id &&
                    JSON.stringify(l.variant) === JSON.stringify(it.variant),
                ) ?? lines.find((l) => l.product_id === it.product_id);
              const issue = q.data!.issues.find(
                (i) => i.product_id === it.product_id,
              );
              const label = Object.values(it.variant).join(" · ");
              return (
                <li
                  key={it.product_id + label}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid #E5E7EB",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ width: 56, flex: "none" }}>
                    <Img src={it.cover_url} alt={it.name} ratio="1" />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <Link
                      href={`/${slug}/p/${it.slug}`}
                      style={{ font: "500 15px var(--font)", color: "inherit" }}
                    >
                      {it.name}
                    </Link>
                    {label && (
                      <div
                        style={{
                          font: "400 13px var(--font)",
                          color: "var(--muted)",
                        }}
                      >
                        {label}
                      </div>
                    )}
                    {(!it.available || issue) && (
                      <div
                        role="alert"
                        style={{
                          font: "600 13px var(--font)",
                          color: "#B91C1C",
                          marginTop: 2,
                        }}
                      >
                        {issue?.code === "out_of_stock"
                          ? "Out of stock"
                          : issue?.code === "invalid_variant"
                            ? "This option is no longer available"
                            : "No longer available"}
                      </div>
                    )}
                  </div>
                  {it.available && line && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #D1D5DB",
                        borderRadius: "var(--r)",
                        background: "#fff",
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease ${it.name}`}
                        disabled={line.quantity <= 1}
                        onClick={() => setQty(line, line.quantity - 1)}
                        style={{
                          all: "unset",
                          width: 44,
                          height: 44,
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center" }}>
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${it.name}`}
                        disabled={
                          it.max_quantity != null &&
                          it.quantity >= it.max_quantity
                        }
                        onClick={() => setQty(line, line.quantity + 1)}
                        style={{
                          all: "unset",
                          width: 44,
                          height: 44,
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      width: 80,
                      textAlign: "right",
                      font: "600 15px var(--font)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {it.available ? inr(it.line_total_paise) : "—"}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      remove({ product_id: it.product_id, variant: it.variant })
                    }
                    style={{
                      minHeight: 44,
                      padding: "0 8px",
                      background: "none",
                      border: 0,
                      color: "var(--muted)",
                      textDecoration: "underline",
                      cursor: "pointer",
                      font: "400 14px var(--font)",
                    }}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            style={{
              marginTop: 20,
              marginLeft: "auto",
              maxWidth: 360,
              font: "400 15px var(--font)",
            }}
          >
            <Row a="Subtotal" b={inr(q.data.subtotal_paise)} />
            <Row
              a="Delivery"
              b={
                q.data.delivery_paise === 0
                  ? "Free"
                  : inr(q.data.delivery_paise)
              }
            />
            {q.data.free_delivery_remaining_paise != null &&
              q.data.free_delivery_remaining_paise > 0 && (
                <div
                  style={{
                    font: "400 13px var(--font)",
                    color: "var(--muted)",
                    padding: "0 0 6px",
                  }}
                >
                  Add {inr(q.data.free_delivery_remaining_paise)} more for free
                  delivery.
                </div>
              )}
            <div style={{ borderTop: "1px solid #D1D5DB", marginTop: 6 }}>
              <Row a={<b>Total</b>} b={<b>{inr(q.data.total_paise)}</b>} />
            </div>
            {q.data.issues.length > 0 && (
              <p
                role="alert"
                style={{ color: "#B91C1C", font: "500 14px var(--font)" }}
              >
                Remove unavailable items to continue.
              </p>
            )}
            {q.data.issues.length > 0 || q.data.items.length === 0 ? (
              <button
                type="button"
                disabled
                style={{ ...btn(store), width: "100%", opacity: 0.5 }}
              >
                Checkout
              </button>
            ) : (
              <Link
                href={`/${slug}/checkout`}
                style={{ ...btn(store), width: "100%" }}
              >
                Checkout
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
function Row({ a, b }: { a: React.ReactNode; b: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>{a}</span>
      <span>{b}</span>
    </div>
  );
}
