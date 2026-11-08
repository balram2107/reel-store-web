"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, errText } from "@/lib/api";
import { rupees } from "@/lib/format";
import { Alert, Badge, Field } from "@/components/ui";
type Pay = {
  order: { public_id: string; status: string; total_paise: number };
  store: { name: string };
  payment: null | {
    upi_id: string;
    payee_name: string;
    upi_uri: string;
    qr_svg: string;
    seconds_remaining: number;
  };
};
export default function PayPage() {
  const { token } = useParams<{ token: string }>();
  const r = useRouter();
  const [d, setD] = useState<Pay | null>(null);
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState("");
  const [dead, setDead] = useState(false);
  const [utr, setUtr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const apply = (x: Pay) => {
    setD(x);
    setSecs(x.payment?.seconds_remaining || 0);
    setDead(false);
    setErr("");
  };
  const load = useCallback(() => {
    api<Pay>(`/public/orders/${token}/payment`)
      .then(apply)
      .catch((e) => {
        setDead(true);
        setErr(errText(e));
      });
  }, [token]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(secs - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const renew = () => {
    setBusy(true);
    api<Pay>(`/public/orders/${token}/payment/renew`, { method: "POST" })
      .then(apply)
      .catch((e) => setErr(errText(e)))
      .finally(() => setBusy(false));
  };
  async function paid() {
    if (utr && !/^\d{12}$/.test(utr))
      return setErr("The UTR is 12 digits. Check it or leave it empty.");
    setBusy(true);
    setErr("");
    try {
      await api(`/public/orders/${token}/payment/submit`, {
        method: "POST",
        body: utr ? { utr } : {},
      });
      r.push(`/track/${token}`);
    } catch (e) {
      setErr(errText(e));
      setBusy(false);
    }
  }
  const p = d?.payment;
  const expired = !!p && secs <= 0;
  const mm =
    String(Math.floor(secs / 60)).padStart(2, "0") +
    ":" +
    String(secs % 60).padStart(2, "0");
  return (
    <div className="mob plain" style={{ padding: 16 }}>
      {err && <Alert>{err}</Alert>}
      {dead && (
        <div className="card">
          <p className="mut" style={{ marginBottom: 12 }}>
            We couldn’t load the payment details.
          </p>
          <button className="btn" disabled={busy} onClick={renew}>
            Get a new payment window
          </button>
          <p style={{ marginTop: 12 }}>
            <Link href={`/track/${token}`}>View your order</Link>
          </p>
        </div>
      )}
      {d && (
        <>
          <p className="mut">
            {d.store.name} · Order {d.order.public_id}
          </p>
          <h1
            className="t"
            style={{
              fontSize: 28,
              lineHeight: "36px",
              fontWeight: 600,
              margin: "4px 0 8px",
            }}
          >
            Pay {rupees(d.order.total_paise)}
          </h1>
          <p
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Badge status={expired ? "expired" : d.order.status} />
            {p && !expired && <span className="mut t">Expires in {mm}</span>}
          </p>
          {!p && (
            <div className="card">
              <p className="mut" style={{ marginBottom: 12 }}>
                No payment is needed right now.
              </p>
              <Link className="btn" href={`/track/${token}`}>
                View your order
              </Link>
            </div>
          )}
          {p && expired && (
            <div className="card">
              <p className="mut" style={{ marginBottom: 12 }}>
                This payment window has ended. Get a new one to pay.
              </p>
              <button className="btn" disabled={busy} onClick={renew}>
                Get a new payment window
              </button>
            </div>
          )}
          {p && !expired && (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <a className="btn" href={p.upi_uri}>
                  Open UPI app
                </a>
                <p className="mut" style={{ margin: "12px 0 4px" }}>
                  Or scan on another device
                </p>
                <img
                  alt="UPI QR code"
                  width={160}
                  height={160}
                  style={{
                    border: "1px solid var(--ln)",
                    borderRadius: 8,
                    background: "#fff",
                  }}
                  src={
                    "data:image/svg+xml;utf8," + encodeURIComponent(p.qr_svg)
                  }
                />
                <div className="row" style={{ marginTop: 12 }}>
                  <span>
                    UPI ID <b className="t">{p.upi_id}</b>
                  </span>
                  <button
                    className="btn s auto"
                    onClick={() =>
                      navigator.clipboard.writeText(p.upi_id).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      })
                    }
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="card">
                <h2 className="h2">Already paid?</h2>
                <Field
                  label="UTR, 12 digits (optional)"
                  inputMode="numeric"
                  maxLength={12}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                />
                <button className="btn" disabled={busy} onClick={paid}>
                  I’ve paid
                </button>
                <p className="mut" style={{ marginTop: 12 }}>
                  The seller will confirm your payment. You’ll get an email once
                  they do.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
