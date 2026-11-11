"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/storefront/ctx";
import { btn, inputStyle } from "@/components/storefront/ui";
import { ApiError, api } from "@/lib/storefront-api";

export default function TrackLookup() {
  const { slug, store } = useStore();
  const router = useRouter();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!id.trim() || phone.length !== 10)
      return setErr("Enter your order ID and 10-digit phone number.");
    setBusy(true);
    try {
      const r = await api.lookup(slug, {slug: slug, public_id: id.trim().toUpperCase(), phone: phone });
      router.push(r.next.path);
    } catch (x) {
      setErr(
        x instanceof ApiError && x.status === 404
          ? "We couldn’t find an order with those details."
          : (x as Error).message,
      );
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={go}
      className="rs-wrap"
      style={{ maxWidth: 480, paddingTop: 32 }}
    >
      <h1 style={{ margin: "0 0 8px", font: "700 28px var(--font)" }}>
        Track your order
      </h1>
      <p style={{ color: "var(--muted)", font: "400 15px var(--font)" }}>
        Enter the order ID from your confirmation and the phone number you used.
      </p>
      <label
        style={{
          display: "block",
          font: "500 14px var(--font)",
          marginTop: 16,
        }}
      >
        Order ID
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="OID12345"
          autoCapitalize="characters"
          style={inputStyle}
        />
      </label>
      <label
        style={{
          display: "block",
          font: "500 14px var(--font)",
          marginTop: 16,
        }}
      >
        Phone
        <input
          value={phone}
          inputMode="tel"
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="10-digit mobile"
          style={inputStyle}
        />
      </label>
      {err && (
        <div
          role="alert"
          style={{
            color: "#B91C1C",
            font: "500 14px var(--font)",
            marginTop: 12,
          }}
        >
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={busy}
        style={{
          ...btn(store),
          width: "100%",
          marginTop: 20,
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Looking up…" : "Track order"}
      </button>
    </form>
  );
}
