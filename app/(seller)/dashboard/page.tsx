"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, abs, errText } from "@/lib/api";
import { rupees } from "@/lib/format";
import { Badge, Alert } from "@/components/ui";
type Dash = {
  counts: { new_orders: number; to_pack: number; awaiting_payment: number };
  checklist: {
    done: number;
    total: number;
    steps: { key: string; label: string; done: boolean }[];
  };
  share: { url: string; whatsapp_url: string; qr_poster_url: string };
  recent_orders: {
    id: number;
    public_id: string;
    customer_name: string;
    total_paise: number;
    status: string;
  }[];
};
export default function Dashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    api<Dash>("/seller/dashboard", { auth: true })
      .then(setD)
      .catch((e) => setErr(errText(e)));
  }, []);
  if (err) return <Alert>{err}</Alert>;
  if (!d) return <p className="mut">Loading…</p>;
  const copy = () => {
    navigator.clipboard.writeText(d.share.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <>
      <h1
        style={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Dashboard
      </h1>
      <div
        className="g"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          marginBottom: 16,
        }}
      >
        {(
          [
            ["New orders", d.counts.new_orders],
            ["To pack", d.counts.to_pack],
            ["Awaiting payment", d.counts.awaiting_payment],
          ] as [string, number][]
        ).map(([l, n]) => (
          <div className="card" key={l}>
            <p className="mut">{l}</p>
            <p
              className="t"
              style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600 }}
            >
              {n}
            </p>
          </div>
        ))}
      </div>
      <div className="g" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2 className="h2" style={{ marginBottom: 4 }}>
            Finish setting up
          </h2>
          <p className="mut" style={{ marginBottom: 8 }}>
            {d.checklist.done} of {d.checklist.total} steps done
          </p>
          {d.checklist.steps.map((s, i) => (
            <div className={"row" + (i === 0 ? " first" : "")} key={s.key}>
              <span>{s.label}</span>
              {s.done ? (
                <span className="b g">Done</span>
              ) : (
                <Link href="/settings">Set up</Link>
              )}
            </div>
          ))}
        </div>
        <div className="card" id="share">
          <h2 className="h2">Share your store</h2>
          <p className="t" style={{ fontSize: 14, marginBottom: 12 }}>
            {d.share.url}
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            <button className="btn s" onClick={copy}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <a className="btn s" href={d.share.whatsapp_url}>
              Share on WhatsApp
            </a>
            <a className="btn s" href={abs(d.share.qr_poster_url)}>
              Download QR poster
            </a>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="h2" style={{ marginBottom: 4 }}>
          Recent orders
        </h2>
        {d.recent_orders.length === 0 && (
          <p className="mut">
            No orders yet. Share your link to get your first one.
          </p>
        )}
        {d.recent_orders.map((o, i) => (
          <div className={"row" + (i === 0 ? " first" : "")} key={o.id}>
            <span>
              <b>{o.public_id}</b> · {o.customer_name}
            </span>
            <span className="t">{rupees(o.total_paise)}</span>
            <Badge status={o.status} />
            <Link href={"/orders/" + o.id}>Open</Link>
          </div>
        ))}
      </div>
    </>
  );
}
