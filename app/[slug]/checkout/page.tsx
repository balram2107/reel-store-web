"use client";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, errText } from "@/lib/api";
import { getCart, clearCart } from "@/lib/cart";
import { rupees } from "@/lib/format";
import type { CartLine, PublicStore, Quote } from "@/lib/types";
import { Alert, Field } from "@/components/ui";
type F = {
  name: string;
  phone: string;
  email: string;
  line: string;
  pincode: string;
  city: string;
  state: string;
};
type Placed = { tracking_token: string; next: { type: "pay" | "track" } };
export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const r = useRouter();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [q, setQ] = useState<Quote | null>(null);
  const [f, setF] = useState<F>({
    name: "",
    phone: "",
    email: "",
    line: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [pm, setPm] = useState<"upi" | "cod">("upi");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<ApiError | string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pinMsg, setPinMsg] = useState("");
  const key = useRef("");
  useEffect(() => {
    const c = getCart(slug);
    setLines(c);
    key.current = crypto.randomUUID();
    api<{ store: PublicStore }>(`/public/stores/${slug}`)
      .then((x) => {
        setStore(x.store);
        setPm(x.store.payments.upi ? "upi" : "cod");
      })
      .catch((e) => setErr(errText(e)));
    if (c.length)
      api<Quote>(`/public/stores/${slug}/cart/quote`, {
        method: "POST",
        body: { items: c },
      })
        .then(setQ)
        .catch((e) => setErr(errText(e)));
  }, [slug]);
  useEffect(() => {
    if (!/^\d{6}$/.test(f.pincode)) return;
    api<{ city: string; state: string }>(`/public/pincodes/${f.pincode}`)
      .then((p) => {
        setF((x) => ({ ...x, city: p.city, state: p.state }));
        setPinMsg("");
      })
      .catch((e) =>
        setPinMsg(
          e instanceof ApiError && e.status === 404
            ? "We couldn’t find this pincode. Enter your city and state."
            : "",
        ),
      );
  }, [f.pincode]);
  const set = (k: keyof F) => (e: ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });
  async function place(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^\d{10}$/.test(f.phone))
      return setErr("Enter a 10-digit phone number.");
    if (!/^\d{6}$/.test(f.pincode)) return setErr("Enter a 6-digit pincode.");
    if (!consent)
      return setErr("Agree to share your details to place the order.");
    setBusy(true);
    try {
      const x = await api<Placed>(`/public/stores/${slug}/orders`, {
        method: "POST",
        headers: { "Idempotency-Key": key.current },
        body: {
          items: lines,
          customer: { name: f.name, phone: f.phone, email: f.email },
          address: {
            line: f.line,
            city: f.city,
            state: f.state,
            pincode: f.pincode,
          },
          payment_method: pm,
          consent: true,
        },
      });
      clearCart(slug);
      r.push(
        x.next.type === "pay"
          ? `/pay/${x.tracking_token}`
          : `/track/${x.tracking_token}`,
      );
    } catch (e) {
      if (e instanceof ApiError && e.status < 500)
        key.current = crypto.randomUUID();
      setErr(e instanceof ApiError ? e : errText(e));
      setBusy(false);
    }
  }
  if (!lines.length && !busy)
    return (
      <div className="mob plain" style={{ padding: 16 }}>
        <div className="card">
          <p className="mut">Your cart is empty.</p>
          <Link href={`/${slug}`}>Back to the store</Link>
        </div>
      </div>
    );
  return (
    <div className="mob plain" style={{ padding: 16 }}>
      <h1 className="h1s" style={{ marginBottom: 16 }}>
        Checkout
      </h1>
      {err && (
        <Alert>
          {typeof err === "string" ? err : err.message}
          {typeof err !== "string" &&
            Object.entries(err.fields).map(([k, v]) => (
              <span key={k} style={{ display: "block" }}>
                {k}: {v.join(", ")}
              </span>
            ))}
        </Alert>
      )}
      {q && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="h2" style={{ marginBottom: 4 }}>
            Your order
          </h2>
          {q.items.map((it, i) => (
            <div className={"row" + (i === 0 ? " first" : "")} key={i}>
              <span>
                {it.name} × {it.quantity}
              </span>
              <span className="t">{rupees(it.line_total_paise)}</span>
            </div>
          ))}
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
      <form onSubmit={place}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="h2">Your details</h2>
          <Field
            label="Full name"
            autoComplete="name"
            required
            value={f.name}
            onChange={set("name")}
          />
          <Field
            label="Phone number"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
            required
            value={f.phone}
            onChange={set("phone")}
          />
          <Field
            label="Email (for your order confirmation)"
            type="email"
            autoComplete="email"
            required
            value={f.email}
            onChange={set("email")}
          />
          <Field
            label="Pincode"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            required
            value={f.pincode}
            onChange={set("pincode")}
          />
          {pinMsg && (
            <p className="mut" style={{ margin: "-4px 0 12px" }}>
              {pinMsg}
            </p>
          )}
          <Field
            label="City"
            autoComplete="address-level2"
            required
            value={f.city}
            onChange={set("city")}
          />
          <Field
            label="State"
            autoComplete="address-level1"
            required
            value={f.state}
            onChange={set("state")}
          />
          <Field
            label="Full address"
            autoComplete="street-address"
            required
            value={f.line}
            onChange={set("line")}
          />
        </div>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="h2">Payment</h2>
          {store?.payments.upi && (
            <label className="check" style={{ alignItems: "center" }}>
              <input
                type="radio"
                name="pm"
                checked={pm === "upi"}
                onChange={() => setPm("upi")}
              />
              Pay by UPI
            </label>
          )}
          {store?.payments.cod && (
            <label className="check" style={{ alignItems: "center" }}>
              <input
                type="radio"
                name="pm"
                checked={pm === "cod"}
                onChange={() => setPm("cod")}
              />
              Cash on delivery
            </label>
          )}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I agree to share my details with this shop. See the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>
        <button className="btn" disabled={busy || !q}>
          {busy
            ? "Placing order…"
            : `Place order${q ? " · " + rupees(q.total_paise) : ""}`}
        </button>
      </form>
    </div>
  );
}
