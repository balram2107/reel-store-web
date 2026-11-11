"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { rupees, variantText } from "@/lib/format";
import type { SellerOrder } from "@/lib/types";
import { Badge, Field } from "@/components/ui";
import {
  ApiAlert,
  ConfirmDialog,
  SubmitButton,
  useToast,
} from "@/components/feedback";

const dot = (s: string) =>
  s === "done"
    ? { background: "var(--gr)" }
    : s === "now"
      ? { border: "3px solid var(--blue)" }
      : { border: "2px solid var(--ln2)" };

// What the seller sees after each action succeeds
const DONE: Record<string, string> = {
  confirm_payment: "Payment confirmed. The order is now paid.",
  pack: "Order marked as packed.",
  ship: "Order marked as shipped.",
  deliver: "Order marked as delivered.",
  cancel: "Order cancelled.",
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [o, setO] = useState<SellerOrder | null>(null);
  const [err, setErr] = useState<unknown>(null); // load failure only
  const [busy, setBusy] = useState(false);
  const [courier, setCourier] = useState("");
  const [ref, setRef] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState<"pay" | "cancel" | null>(null);

  useEffect(() => {
    api<{ order: SellerOrder }>(`/seller/orders/${id}`, { auth: true })
      .then((x) => setO(x.order))
      .catch(setErr);
  }, [id]);

  // Action buttons are far down the page, so results show as toasts.
  async function act(path: string, body?: unknown): Promise<boolean> {
    setBusy(true);
    try {
      const x = await api<{ order: SellerOrder }>(
        `/seller/orders/${id}/${path}`,
        { method: "POST", body, auth: true },
      );
      setO(x.order);
      toast.success(DONE[path] ?? "Order updated.");
      setBusy(false);
      return true;
    } catch (e) {
      toast.fromError(e, { title: "Order not updated" });
      setBusy(false);
      return false;
    }
  }

  if (!o)
    return (
      <>
        {err ? (
          <ApiAlert error={err} title="Couldn't load this order" />
        ) : (
          <p className="mut">Loading…</p>
        )}
      </>
    );

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
                onClick={() => setConfirm("pay")}
              >
                Confirm payment received
              </button>
            )}
            {canPack && (
              <SubmitButton
                type="button"
                busy={busy}
                busyLabel="Updating…"
                style={{ marginBottom: 8 }}
                onClick={() => act("pack")}
              >
                Mark as packed
              </SubmitButton>
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
                <SubmitButton busy={busy} busyLabel="Updating…">
                  Mark as shipped
                </SubmitButton>
              </form>
            )}
            {o.status === "shipped" && (
              <SubmitButton
                type="button"
                busy={busy}
                busyLabel="Updating…"
                onClick={() => act("deliver")}
              >
                Mark as delivered
              </SubmitButton>
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
                  setConfirm("cancel");
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

      <ConfirmDialog
        open={confirm === "pay"}
        title="Confirm payment received?"
        confirmLabel="Yes, payment received"
        cancelLabel="Not yet"
        destructive={false}
        busy={busy}
        onConfirm={async () => {
          await act("confirm_payment");
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      >
        Check that {rupees(o.total_paise)} has reached your UPI account before
        you confirm. This marks the order as paid.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm === "cancel"}
        title="Cancel this order?"
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        busy={busy}
        onConfirm={async () => {
          await act("cancel", { reason });
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      >
        This can’t be undone.
      </ConfirmDialog>
    </>
  );
}
