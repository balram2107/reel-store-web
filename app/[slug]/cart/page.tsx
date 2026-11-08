"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errText } from "@/lib/api";
import { getCart, setCart } from "@/lib/cart";
import { rupees, variantText } from "@/lib/format";
import type { CartLine, Quote } from "@/lib/types";
import { Alert } from "@/components/ui";
export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [q, setQ] = useState<Quote | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    setLines(getCart(slug));
  }, [slug]);
  useEffect(() => {
    if (!lines) return;
    if (!lines.length) {
      setQ(null);
      return;
    }
    setErr("");
    api<Quote>(`/public/stores/${slug}/cart/quote`, {
      method: "POST",
      body: { items: lines },
    })
      .then(setQ)
      .catch((e) => setErr(errText(e)));
  }, [lines, slug]);
  const save = (n: CartLine[]) => {
    setCart(slug, n);
    setLines(n);
  };
  const bad = (i: number) => {
    const it = q?.items[i];
    return (
      !!it &&
      (!it.available || q!.issues.some((x) => x.product_id === it.product_id))
    );
  };
  const blocked =
    !q ||
    !lines?.length ||
    !!q.issues.length ||
    q.items.some((x) => !x.available);
  return (
    <div className="mob plain" style={{ padding: 16 }}>
      <Link href={`/${slug}`} style={{ fontSize: 14 }}>
        ← Back to the store
      </Link>
      <h1 className="h1s" style={{ margin: "8px 0 16px" }}>
        Your cart
      </h1>
      {err && <Alert>{err}</Alert>}
      {lines && !lines.length && (
        <div className="card">
          <p className="mut">Your cart is empty.</p>
        </div>
      )}
      {lines && lines.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          {lines.map((l, i) => {
            const it = q?.items[i];
            return (
              <div
                className={"row" + (i === 0 ? " first" : "")}
                style={{ alignItems: "flex-start" }}
                key={i}
              >
                <span>
                  <b>{it?.name || "Product #" + l.product_id}</b>
                  <br />
                  <span className="mut">{variantText(l.variant)}</span>
                  {bad(i) ? (
                    <span
                      style={{
                        display: "block",
                        color: "var(--red)",
                        fontWeight: 500,
                      }}
                    >
                      No longer available
                    </span>
                  ) : (
                    <span className="qty" style={{ marginTop: 4 }}>
                      <button
                        className="btn s"
                        aria-label="Fewer"
                        onClick={() =>
                          save(
                            lines.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    quantity: Math.max(1, x.quantity - 1),
                                  }
                                : x,
                            ),
                          )
                        }
                      >
                        −
                      </button>
                      <span className="t">{l.quantity}</span>
                      <button
                        className="btn s"
                        aria-label="More"
                        onClick={() =>
                          save(
                            lines.map((x, j) =>
                              j === i ? { ...x, quantity: x.quantity + 1 } : x,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </span>
                  )}
                </span>
                <span style={{ textAlign: "right" }}>
                  <span className="t">
                    {it ? rupees(it.line_total_paise) : ""}
                  </span>
                  <br />
                  <button
                    className="btn s auto"
                    style={{ minHeight: 44, marginTop: 4 }}
                    onClick={() => save(lines.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
      {q && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="row first">
            <span>Subtotal</span>
            <span className="t">{rupees(q.subtotal_paise)}</span>
          </div>
          <div className="row">
            <span>Delivery</span>
            <span className="t">{rupees(q.delivery_paise)}</span>
          </div>
          <div className="row" style={{ fontWeight: 600 }}>
            <span>Total</span>
            <span className="t">{rupees(q.total_paise)}</span>
          </div>
        </div>
      )}
      {q && blocked && (
        <p className="mut" style={{ marginBottom: 12 }}>
          Remove unavailable items to continue.
        </p>
      )}
      {blocked ? (
        <button className="btn" disabled>
          Continue to checkout
        </button>
      ) : (
        <Link className="btn" href={`/${slug}/checkout`}>
          Continue to checkout
        </Link>
      )}
    </div>
  );
}
