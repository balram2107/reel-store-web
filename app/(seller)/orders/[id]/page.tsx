"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { rupees, variantText } from "@/lib/format";
import type { SellerOrder } from "@/lib/types";
import { Badge, ErrBox, Field } from "@/components/ui";
const dot = (s: string) =>
  s === "done"
    ? { background: "var(--gr)" }
    : s === "now"
      ? { border: "3px solid var(--blue)" }
      : { border: "2px solid var(--ln2)" };
export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [o, setO] = useState<SellerOrder | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [courier, setCourier] = useState("");
  const [ref, setRef] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    api<{ order: SellerOrder }>(`/seller/orders/${id}`, { auth: true })
      .then((x) => setO(x.order))
      .catch(setErr);
  }, [id]);
  async function act(path: string, body?: unknown) {
    setBusy(true);
    setErr(null);
    try {
      const x = await api<{ order: SellerOrder }>(
        `/seller/orders/${id}/${path}`,
        { method: "POST", body, auth: true },
      );
      setO(x.order);
    } catch (e) {
      setErr(e);
    }
    setBusy(false);
  }
  if (!o)
    return <>{err ? <ErrBox e={err} /> : <p className="mut">Loading…</p>}</>;
  const cod = o.payment_method === "cod";
  const canConfirm =
    !cod &&
    (o.status === "payment_submitted" || o.status === "awaiting_payment");
  const canPack = o.status === "paid" || (cod && o.status === "placed");
  const label: Record<string, string> = {
    done: "Done",
    now: "Now",
    next: "Next",
  };
  return (
    <>
      <Link href="/orders" style={{ fontSize: 14 }}>
        ← Orders
      </Link>
      <h1
        style={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 600,
          margin: "8px 0 16px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        Order {o.public_id} <Badge status={o.status} />
      </h1>
      <ErrBox e={err} />
      <div className="g" style={{ alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 4 }}>
              Items
            </h2>
            {o.items.map((it, i) => (
              <div className={"row" + (i === 0 ? " first" : "")} key={i}>
                <span>
                  {it.name} × {it.quantity}
                  {it.variant && (
                    <>
                      <br />
                      <span className="mut">{variantText(it.variant)}</span>
                    </>
                  )}
                </span>
                <span className="t">{rupees(it.line_total_paise)}</span>
              </div>
            ))}
            <div className="row">
              <span>Delivery</span>
              <span className="t">{rupees(o.delivery_paise)}</span>
            </div>
            <div className="row">
              <span>Payment</span>
              <span>{cod ? "Cash on delivery" : "UPI"}</span>
            </div>
            {!cod && (
              <div className="row">
                <span>Payment reference (UTR)</span>
                <span className="t">{o.utr || "Not provided"}</span>
              </div>
            )}
            <div className="row" style={{ fontWeight: 600 }}>
              <span>Total</span>
              <span className="t">{rupees(o.total_paise)}</span>
            </div>
          </div>
          <div className="card">
            <h2 className="h2">Customer</h2>
            <p>{o.customer.name}</p>
            <p className="mut">
              Phone: {o.customer.phone} · Email: {o.customer.email}
            </p>
            <p className="mut">
              {o.address.line}, {o.address.city}, {o.address.state}{" "}
              {o.address.pincode}
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 4 }}>
              Progress
            </h2>
            <ul>
              {o.timeline.map((t) => (
                <li
                  key={t.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      flex: "none",
                      ...dot(t.state),
                    }}
                  />
                  <span style={{ fontWeight: t.state === "now" ? 600 : 400 }}>
                    {t.label}
                  </span>
                  <span className="mut" style={{ marginLeft: "auto" }}>
                    {label[t.state]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 className="h2">Actions</h2>
            {canConfirm && (
              <button
                className="btn"
                style={{ marginBottom: 8 }}
                disabled={busy}
                onClick={() => act("confirm_payment")}
              >
                Confirm payment received
              </button>
            )}
            {canPack && (
              <button
                className="btn"
                style={{ marginBottom: 8 }}
                disabled={busy}
                onClick={() => act("pack")}
              >
                Mark as packed
              </button>
            )}
            {o.status === "packed" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  act("ship", { courier, tracking_ref: ref });
                }}
              >
                <Field
                  label="Courier"
                  required
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                />
                <Field
                  label="Tracking number or expected date"
                  required
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                />
                <button className="btn" disabled={busy}>
                  Mark as shipped
                </button>
              </form>
            )}
            {o.status === "shipped" && (
              <button
                className="btn"
                disabled={busy}
                onClick={() => act("deliver")}
              >
                Mark as delivered
              </button>
            )}
            {o.status === "shipped" && o.shipping.courier && (
              <p className="mut" style={{ marginTop: 8 }}>
                {o.shipping.courier} · {o.shipping.tracking_ref}
              </p>
            )}
            {o.can_cancel ? (
              <form
                style={{ marginTop: 12 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  act("cancel", { reason });
                }}
              >
                <Field
                  label="Reason for cancelling (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button className="btn s" disabled={busy}>
                  Cancel order
                </button>
              </form>
            ) : (
              <p className="mut" style={{ marginTop: 8 }}>
                This order can’t be cancelled.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
