"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/components/storefront/ctx";
import {
  btn,
  Empty,
  ErrorBox,
  Img,
  inputStyle,
} from "@/components/storefront/ui";
import { ApiError, api, useAsync } from "@/lib/storefront-api";
import { clearBuyNow, getBuyNow, useCart } from "@/lib/storefront-cart";
import { inr } from "@/lib/storefront-format";
import type { CartLine } from "@/lib/storefront-types";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <Checkout />
    </Suspense>
  );
}

function Checkout() {
  const { slug, store } = useStore();
  const router = useRouter();
  const now = useSearchParams().get("now") === "1";
  const cart = useCart(slug);
  const [buyNow, setBN] = useState<CartLine | null | undefined>(undefined);
  useEffect(() => {
    setBN(now ? getBuyNow(slug) : null);
  }, [now, slug]);
  const lines = now ? (buyNow ? [buyNow] : []) : cart.lines;
  const ready = buyNow !== undefined;

  const items = useMemo(
    () =>
      lines.map(({ product_id, variant, quantity }) => ({
        product_id,
        variant,
        quantity,
      })),
    [JSON.stringify(lines)],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useAsync(
    () =>
      ready && items.length ? api.quote(slug, items) : Promise.resolve(null),
    [slug, ready, JSON.stringify(items)],
  );

  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    line: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [pm, setPm] = useState<"upi" | "cod">(
    store.payments.upi ? "upi" : "cod",
  );
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const [localErr, setLocalErr] = useState<Record<string, string>>({});
  const idem = useRef<string | null>(null);
  const edit = (k: keyof typeof f, v: string) => {
    idem.current = null;
    setF((s) => ({ ...s, [k]: v }));
  };

  useEffect(() => {
    if (!/^\d{6}$/.test(f.pincode)) return;
    let live = true;
    api.pincode(f.pincode).then(
      (r) => live && setF((s) => ({ ...s, city: r.city, state: r.state })),
      () => {},
    ); // 404: buyer types city/state
    return () => {
      live = false;
    };
  }, [f.pincode]);

  const fe = (k: string, ...api_keys: string[]) => {
    const v =
      localErr[k] ??
      [k, ...api_keys].map((x) => err?.fields?.[x]).find(Boolean);
    return Array.isArray(v) ? v.join(", ") : v;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const le: Record<string, string> = {};
    if (!f.name.trim()) le.name = "Enter your name";
    if (!/^\d{10}$/.test(f.phone)) le.phone = "Enter a 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) le.email = "Enter a valid email";
    if (!f.line.trim()) le.line = "Enter your address";
    if (!/^\d{6}$/.test(f.pincode)) le.pincode = "Enter a 6-digit pincode";
    if (!f.city.trim()) le.city = "Enter your city";
    if (!f.state.trim()) le.state = "Enter your state";
    if (!consent) le.consent = "Please accept to place your order";
    setLocalErr(le);
    setErr(null);
    if (Object.keys(le).length || !q.data || q.data.issues.length) return;
    setBusy(true);
    idem.current ??= crypto.randomUUID();
    try {
      const r = await api.createOrder(
        slug,
        {
          items,
          payment_method: pm,
          consent: true,
          customer: {
            name: f.name.trim(),
            phone: f.phone,
            email: f.email.trim(),
          },
          address: {
            line: f.line.trim(),
            city: f.city.trim(),
            state: f.state.trim(),
            pincode: f.pincode,
          },
        },
        idem.current,
      );
      if (now) clearBuyNow(slug);
      else cart.clear();
      router.push(r.next.path);
    } catch (x) {
      const ae =
        x instanceof ApiError
          ? x
          : new ApiError(0, "error", "Something went wrong.");
      if (ae.status >= 400 && ae.status < 500 && ae.status !== 429)
        idem.current = null; // definitive failure: next try is a new attempt
      setErr(ae);
      setBusy(false);
      if (ae.code === "out_of_stock") q.reload();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!ready || (items.length && !q.data && !q.error))
    return (
      <div
        className="rs-wrap"
        style={{ padding: 48, color: "var(--muted)" }}
        aria-busy="true"
      >
        Loading checkout…
      </div>
    );
  if (!items.length)
    return (
      <div className="rs-wrap">
        <Empty title="Nothing to check out">
          <Link href={`/${slug}/shop`} style={{ color: "var(--btn)" }}>
            Browse products
          </Link>
        </Empty>
      </div>
    );
  if (q.error)
    return (
      <div className="rs-wrap" style={{ paddingTop: 24 }}>
        <ErrorBox error={q.error} onRetry={q.reload} />
      </div>
    );
  const quote = q.data!;

  const field = (
    k: keyof typeof f,
    label: string,
    o: {
      ph?: string;
      full?: boolean;
      mode?: "numeric" | "tel" | "email";
      max?: number;
      auto?: string;
    } = {},
  ) => (
    <label
      style={{
        display: "block",
        gridColumn: o.full ? "1 / -1" : undefined,
        font: "500 14px var(--font)",
      }}
    >
      {label}
      <input
        value={f[k]}
        onChange={(e) =>
          edit(
            k,
            o.mode === "numeric" || o.mode === "tel"
              ? e.target.value.replace(/\D/g, "").slice(0, o.max)
              : e.target.value,
          )
        }
        placeholder={o.ph}
        inputMode={o.mode}
        autoComplete={o.auto}
        aria-invalid={!!fe(k)}
        aria-describedby={fe(k) ? `e-${k}` : undefined}
        style={{ ...inputStyle, borderColor: fe(k) ? "#DC2626" : "#D1D5DB" }}
      />
      {fe(k) && (
        <span
          id={`e-${k}`}
          style={{ font: "400 13px var(--font)", color: "#B91C1C" }}
        >
          {fe(k)}
        </span>
      )}
    </label>
  );
  const h2 = { margin: "0 0 16px", font: "700 20px var(--font)" } as const;
  const opt = (v: "upi" | "cod", title: string, sub: string) => (
    <label
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        border: pm === v ? "2px solid var(--btn)" : "1px solid #D1D5DB",
        borderRadius: "var(--r)",
        padding: 16,
        minHeight: 44,
        background: "#fff",
        cursor: "pointer",
      }}
    >
      <input
        type="radio"
        name="pm"
        checked={pm === v}
        onChange={() => {
          idem.current = null;
          setPm(v);
        }}
        style={{ marginTop: 4 }}
      />
      <span>
        <b style={{ display: "block", font: "600 15px var(--font)" }}>
          {title}
        </b>
        <span style={{ font: "400 14px var(--font)", color: "var(--muted)" }}>
          {sub}
        </span>
      </span>
    </label>
  );

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rs-wrap"
      style={{ paddingTop: 24 }}
    >
      <h1 style={{ margin: "0 0 20px", font: "700 30px var(--font)" }}>
        Checkout
      </h1>
      {err && (
        <div
          role="alert"
          style={{
            border: "1px solid #FCA5A5",
            background: "#FEF2F2",
            color: "#7F1D1D",
            borderRadius: "var(--r)",
            padding: 14,
            marginBottom: 20,
            font: "500 15px var(--font)",
          }}
        >
          {err.code === "store_unavailable"
            ? "This store isn’t taking orders right now."
            : err.code === "out_of_stock"
              ? "Something in your order just went out of stock. We’ve refreshed your summary."
              : err.message}
        </div>
      )}
      <div className="rs-checkout">
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <section>
            <h2 style={h2}>Contact</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 16,
              }}
            >
              {field("name", "Full name", {
                full: true,
                ph: "Your name",
                auto: "name",
              })}
              {field("phone", "Phone", {
                ph: "10-digit mobile",
                mode: "tel",
                max: 10,
                auto: "tel-national",
              })}
              {field("email", "Email", {
                ph: "you@example.com",
                mode: "email",
                auto: "email",
              })}
            </div>
          </section>
          <section>
            <h2 style={h2}>Delivery address</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {field("line", "Address", {
                full: true,
                ph: "House no, street, area",
                auto: "street-address",
              })}
              {field("pincode", "Pincode", {
                ph: "6 digits",
                mode: "numeric",
                max: 6,
                auto: "postal-code",
              })}
              {field("city", "City", { ph: "Filled from pincode" })}
              {field("state", "State", {
                full: true,
                ph: "Filled from pincode",
              })}
            </div>
          </section>
          <section>
            <h2 style={h2}>Payment</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {store.payments.upi &&
                opt(
                  "upi",
                  "UPI",
                  "Pay by UPI QR on the next page. You have 10 minutes, then you can enter your UTR.",
                )}
              {store.payments.cod &&
                opt("cod", "Cash on delivery", "Pay when your order arrives.")}
              {!store.payments.upi && !store.payments.cod && (
                <ErrorBox
                  error={new Error("This store hasn’t set up payments yet.")}
                />
              )}
            </div>
          </section>
          <div>
            <label
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                font: "400 14px/1.5 var(--font)",
                minHeight: 44,
              }}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  idem.current = null;
                  setConsent(e.target.checked);
                }}
                aria-invalid={!!localErr.consent}
                style={{ marginTop: 3 }}
              />
              <span>
                I agree to the store’s{" "}
                <Link
                  href={`/${slug}/policies#shipping`}
                  target="_blank"
                  style={{ color: "var(--btn)" }}
                >
                  shipping policy
                </Link>{" "}
                and{" "}
                <Link
                  href={`/${slug}/policies#returns`}
                  target="_blank"
                  style={{ color: "var(--btn)" }}
                >
                  returns policy
                </Link>
                .
              </span>
            </label>
            {localErr.consent && (
              <span
                role="alert"
                style={{ font: "400 13px var(--font)", color: "#B91C1C" }}
              >
                {localErr.consent}
              </span>
            )}
          </div>
        </div>
        <aside
          style={{
            position: "sticky",
            top: 24,
            alignSelf: "start",
            border: "1px solid #E5E7EB",
            borderRadius: "var(--r)",
            padding: 24,
            background: "#F9FAFB",
          }}
        >
          <h2 style={{ margin: "0 0 8px", font: "700 18px var(--font)" }}>
            Order summary
          </h2>
          {quote.items.map((it) => (
            <div
              key={it.product_id + JSON.stringify(it.variant)}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <div style={{ width: 56, flex: "none" }}>
                <Img src={it.cover_url} alt={it.name} ratio="1" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: "500 14px var(--font)" }}>{it.name}</div>
                <div
                  style={{
                    font: "400 13px var(--font)",
                    color: "var(--muted)",
                  }}
                >
                  {[...Object.values(it.variant), `Qty ${it.quantity}`].join(
                    " · ",
                  )}
                </div>
                {!it.available && (
                  <div
                    style={{ font: "600 13px var(--font)", color: "#B91C1C" }}
                  >
                    No longer available
                  </div>
                )}
              </div>
              <div style={{ font: "600 14px var(--font)" }}>
                {it.available ? inr(it.line_total_paise) : "—"}
              </div>
            </div>
          ))}
          <div
            style={{
              paddingTop: 12,
              font: "400 14px var(--font)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span>Subtotal</span>
              <span>{inr(quote.subtotal_paise)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span>Delivery</span>
              <span>
                {quote.delivery_paise === 0
                  ? "Free"
                  : inr(quote.delivery_paise)}
              </span>
            </div>
            {quote.free_delivery_remaining_paise != null &&
              quote.free_delivery_remaining_paise > 0 && (
                <div
                  style={{
                    font: "400 13px var(--font)",
                    color: "var(--muted)",
                    paddingBottom: 8,
                  }}
                >
                  Add {inr(quote.free_delivery_remaining_paise)} more for free
                  delivery.
                </div>
              )}
            <div
              style={{
                borderTop: "1px solid #D1D5DB",
                marginTop: 6,
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                font: "700 15px var(--font)",
              }}
            >
              <span>Total</span>
              <span>{inr(quote.total_paise)}</span>
            </div>
          </div>
          {quote.issues.length > 0 && (
            <p
              role="alert"
              style={{ color: "#B91C1C", font: "500 14px var(--font)" }}
            >
              Some items are unavailable.{" "}
              <Link href={`/${slug}/cart`} style={{ color: "inherit" }}>
                Update your cart
              </Link>
              .
            </p>
          )}
          <button
            type="submit"
            disabled={
              busy ||
              quote.issues.length > 0 ||
              (!store.payments.upi && !store.payments.cod)
            }
            style={{
              ...btn(store),
              width: "100%",
              minHeight: 52,
              marginTop: 16,
              opacity: busy || quote.issues.length ? 0.6 : 1,
            }}
          >
            {busy ? "Placing order…" : "Place order"}
          </button>
          <p
            style={{
              margin: "12px 0 0",
              font: "400 13px/1.5 var(--font)",
              color: "var(--muted)",
            }}
          >
            {pm === "upi"
              ? "You’ll see a UPI QR with a 10-minute timer on the next page."
              : "Cash on delivery orders go straight to order tracking."}
          </p>
        </aside>
      </div>
    </form>
  );
}
