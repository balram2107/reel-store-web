"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import { fromPaise, toPaise, UPI_RE } from "@/lib/forms";
import type { Category, SellerStore, Theme } from "@/lib/types";
import { ErrBox, Field } from "@/components/ui";
import ThemePicker from "@/components/ThemePicker";
type F = {
  name: string;
  slug: string;
  insta: string;
  bio: string;
  cat: string;
  delivery: string;
  freeAbove: string;
  pickup: boolean;
  upi: string;
  cod: boolean;
  waOn: boolean;
  waNum: string;
  status: "open" | "closed";
  closing: string;
  theme: Theme;
};
const init = (s: SellerStore): F => ({
  name: s.name,
  slug: s.slug,
  insta: s.instagram_handle || "",
  bio: s.bio || "",
  cat: s.category_id ? String(s.category_id) : "",
  delivery: fromPaise(s.delivery_charge_paise),
  freeAbove: fromPaise(s.free_delivery_above_paise),
  pickup: !!s.pickup_enabled,
  upi: s.upi_id || "",
  cod: !!s.cod_enabled,
  waOn: !!s.whatsapp_enabled,
  waNum: s.whatsapp_number || "",
  status: s.status,
  closing: s.closing_date || "",
  theme: s.theme,
});
export default function Settings() {
  const [s, setS] = useState<SellerStore | null>(null);
  const [f, setF] = useState<F | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [err, setErr] = useState<unknown>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ store: SellerStore }>("/seller/store", { auth: true })
      .then((x) => {
        setS(x.store);
        setF(init(x.store));
      })
      .catch(setErr);
    api<{ categories: Category[] }>("/categories?kind=store")
      .then((x) => setCats(x.categories))
      .catch(() => {});
  }, []);
  if (!f || !s)
    return <>{err ? <ErrBox e={err} /> : <p className="mut">Loading…</p>}</>;
  const up = <K extends keyof F>(k: K, v: F[K]) =>
    setF((x) => x && { ...x, [k]: v });
  async function upload(kind: "logo" | "banner", file: File) {
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const x = await api<{
        logo_url?: string | null;
        banner_url?: string | null;
      }>(`/seller/store/${kind}`, { method: "POST", form: fd, auth: true });
      setS((c) => c && { ...c, ...x });
    } catch (e) {
      setErr(e);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    const dc = toPaise(f!.delivery),
      fa = toPaise(f!.freeAbove);
    if ([dc, fa].some((v) => v !== undefined && Number.isNaN(v)))
      return setErr("Enter valid delivery amounts.");
    if (f!.upi && !UPI_RE.test(f!.upi))
      return setErr("Enter a valid UPI ID, like name@bank.");
    const body = {
      name: f!.name,
      slug: f!.slug,
      instagram_handle: f!.insta || undefined,
      bio: f!.bio || undefined,
      category_id: f!.cat ? Number(f!.cat) : undefined,
      delivery_charge_paise: dc,
      free_delivery_above_paise: fa,
      pickup_enabled: f!.pickup,
      upi_id: f!.upi || undefined,
      cod_enabled: f!.cod,
      whatsapp_enabled: f!.waOn,
      whatsapp_number: f!.waNum || undefined,
      status: f!.status,
      closing_date: f!.closing || undefined,
      theme: f!.theme,
    };
    setBusy(true);
    try {
      const x = await api<{ store: SellerStore }>("/seller/store", {
        method: "PATCH",
        body,
        auth: true,
      });
      setS(x.store);
      setF(init(x.store));
      setOk(true);
    } catch (x) {
      setErr(x);
    }
    setBusy(false);
  }
  const wa = s.features?.whatsapp_available;
  return (
    <form onSubmit={save} style={{ maxWidth: 720 }}>
      <h1
        style={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Store settings
      </h1>
      <ErrBox e={err} />
      {ok && (
        <div className="alert i" role="status">
          Settings saved.
        </div>
      )}
      <div style={{ display: "grid", gap: 16 }}>
        <div className="card">
          <h2 className="h2">Store details</h2>
          <Field
            label="Store name"
            required
            value={f.name}
            onChange={(e) => up("name", e.target.value)}
          />
          <Field
            label="Store link"
            required
            value={f.slug}
            onChange={(e) => up("slug", e.target.value.toLowerCase())}
          />
          <p className="mut" style={{ margin: "-4px 0 12px" }}>
            reel-store.in/{f.slug}. Changing it breaks links you’ve already
            shared.
          </p>
          <Field
            label="Instagram handle"
            placeholder="@yourshop"
            value={f.insta}
            onChange={(e) => up("insta", e.target.value)}
          />
          <label className="f">
            Bio
            <textarea
              className="in"
              value={f.bio}
              onChange={(e) => up("bio", e.target.value)}
            />
          </label>
          <label className="f">
            Store category
            <select
              className="in"
              value={f.cat}
              onChange={(e) => up("cat", e.target.value)}
            >
              <option value="">No category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="f">
            Logo
            {s.logo_url && (
              <>
                <br />
                <img
                  src={s.logo_url}
                  alt="Current logo"
                  width={64}
                  height={64}
                  style={{ borderRadius: 8, objectFit: "cover" }}
                />
              </>
            )}
            <input
              className="in"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const x = e.target.files?.[0];
                if (x) upload("logo", x);
              }}
            />
          </label>
          <label className="f" style={{ marginBottom: 0 }}>
            Banner
            {s.banner_url && (
              <>
                <br />
                <img
                  src={s.banner_url}
                  alt="Current banner"
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    height: 80,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </>
            )}
            <input
              className="in"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const x = e.target.files?.[0];
                if (x) upload("banner", x);
              }}
            />
          </label>
        </div>
        <div className="card">
          <h2 className="h2">Delivery</h2>
          <Field
            label="Delivery charge (₹)"
            inputMode="decimal"
            value={f.delivery}
            onChange={(e) => up("delivery", e.target.value)}
          />
          <Field
            label="Free delivery above (₹), optional"
            inputMode="decimal"
            value={f.freeAbove}
            onChange={(e) => up("freeAbove", e.target.value)}
          />
          <label className="check" style={{ alignItems: "center" }}>
            <input
              type="checkbox"
              checked={f.pickup}
              onChange={(e) => up("pickup", e.target.checked)}
            />
            Offer pickup
          </label>
        </div>
        <div className="card">
          <h2 className="h2">Payments</h2>
          <Field
            label="UPI ID"
            placeholder="yourname@bank"
            value={f.upi}
            onChange={(e) => up("upi", e.target.value)}
          />
          <label className="check" style={{ alignItems: "center" }}>
            <input
              type="checkbox"
              checked={f.cod}
              onChange={(e) => up("cod", e.target.checked)}
            />
            Cash on delivery
          </label>
          <p className="mut">
            Buyers pay your UPI ID directly. You confirm each payment.
          </p>
        </div>
        <div className="card">
          <h2 className="h2">WhatsApp</h2>
          <label className="check" style={{ alignItems: "center" }}>
            <input
              type="checkbox"
              disabled={!wa}
              checked={f.waOn}
              onChange={(e) => up("waOn", e.target.checked)}
            />
            Show a WhatsApp order button
          </label>
          <Field
            label="WhatsApp number"
            type="tel"
            disabled={!wa}
            value={f.waNum}
            onChange={(e) => up("waNum", e.target.value)}
          />
          {!wa && <p className="mut">Not enabled for your store yet.</p>}
        </div>
        <div className="card">
          <h2 className="h2">Store status</h2>
          {(["open", "closed"] as const).map((v) => (
            <label className="check" style={{ alignItems: "center" }} key={v}>
              <input
                type="radio"
                name="status"
                checked={f.status === v}
                onChange={() => up("status", v)}
              />
              {v === "open" ? "Open" : "Closed"}
            </label>
          ))}
          <Field
            label="Closing date, optional"
            type="date"
            value={f.closing}
            onChange={(e) => up("closing", e.target.value)}
          />
          {s.ends_on && (
            <p className="mut">Your store is set to end on {s.ends_on}.</p>
          )}
        </div>
        <div className="card">
          <h2 className="h2">Store look</h2>
          <ThemePicker v={f.theme} set={(t) => up("theme", t)} />
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
