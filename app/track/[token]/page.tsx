"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errText } from "@/lib/api";
import { rupees } from "@/lib/format";
import type { TimelineEvent } from "@/lib/types";
import { Alert, Badge } from "@/components/ui";
type Track = {
  order: {
    public_id: string;
    status: string;
    payment_method: "upi" | "cod";
    timeline: TimelineEvent[];
    shipping: { courier: string | null; tracking_ref: string | null };
    items: { name: string; quantity: number; line_total_paise: number }[];
    delivery_paise: number;
    total_paise: number;
  };
  store: { name: string; whatsapp_url: string | null };
};
const dot = (s: string) =>
  s === "done"
    ? { background: "var(--gr)" }
    : s === "now"
      ? { border: "3px solid var(--blue)" }
      : { border: "2px solid var(--ln2)" };
export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const [d, setD] = useState<Track | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api<Track>(`/public/orders/${token}`)
      .then(setD)
      .catch((e) => setErr(errText(e)));
  }, [token]);
  if (err)
    return (
      <div className="mob plain" style={{ padding: 16 }}>
        <Alert>{err}</Alert>
      </div>
    );
  if (!d)
    return (
      <div className="mob plain" style={{ padding: 16 }}>
        <p className="mut">Loading…</p>
      </div>
    );
  const o = d.order;
  const sh = o.shipping;
  const wa = d.store.whatsapp_url || null;
  const label: Record<string, string> = {
    done: "Done",
    now: "Now",
    next: "Next",
  };
  return (
    <div className="mob plain" style={{ padding: 16 }}>
      <p className="mut">{d.store.name}</p>
      <h1 className="h1s" style={{ margin: "4px 0 8px" }}>
        Order {o.public_id}
      </h1>
      <p style={{ marginBottom: 16 }}>
        <Badge status={o.status} />
      </p>
      {(o.status === "awaiting_payment" || o.status === "expired") &&
        o.payment_method === "upi" && (
          <Link
            className="btn"
            style={{ marginBottom: 16 }}
            href={`/pay/${token}`}
          >
            Pay now
          </Link>
        )}
      <div className="card" style={{ marginBottom: 16 }}>
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
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="h2">Shipping</h2>
        {sh.courier || sh.tracking_ref ? (
          <p>
            {sh.courier}
            {sh.courier && sh.tracking_ref ? " · " : ""}
            <span className="t">{sh.tracking_ref}</span>
          </p>
        ) : (
          <p className="mut">
            Courier and tracking details appear here once the seller ships.
          </p>
        )}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="h2" style={{ marginBottom: 4 }}>
          Summary
        </h2>
        {o.items.map((it, i) => (
          <div className={"row" + (i === 0 ? " first" : "")} key={i}>
            <span>
              {it.name} × {it.quantity}
            </span>
            <span className="t">{rupees(it.line_total_paise)}</span>
          </div>
        ))}
        <div className="row">
          <span>Delivery</span>
          <span className="t">{rupees(o.delivery_paise)}</span>
        </div>
        <div className="row" style={{ fontWeight: 600 }}>
          <span>Total</span>
          <span className="t">{rupees(o.total_paise)}</span>
        </div>
      </div>
      {wa && (
        <a className="btn s" href={wa}>
          Message the seller on WhatsApp
        </a>
      )}
    </div>
  );
}
