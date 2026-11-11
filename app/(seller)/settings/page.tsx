"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { fromPaise, toPaise, UPI_RE } from "@/lib/forms";
import type { Category, SellerStore, Theme } from "@/lib/types";
import { Field } from "@/components/ui";
import ThemePicker from "@/components/ThemePicker";
import {
  ApiAlert,
  FieldError,
  FormStatus,
  UnsavedBar,
  useToast,
  useUnsavedChanges,
} from "@/components/feedback";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type F = {
  name: string;
  slug: string;
  insta: string;
  bio: string;
  cat: string;
  about: string;
  shipPolicy: string;
  returnPolicy: string;
  email: string;
  phone: string;
  dispatchNote: string;
  returnNote: string;
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

// Fields that can show an error message, and the backend names that map to them.
type FKey =
  | "name"
  | "slug"
  | "insta"
  | "email"
  | "phone"
  | "delivery"
  | "freeAbove"
  | "upi"
  | "waNum";
type FErr = Partial<Record<FKey, string>>;
const BACKEND_KEYS: Record<string, FKey> = {
  name: "name",
  slug: "slug",
  instagram_handle: "insta",
  contact_email: "email",
  contact_phone: "phone",
  delivery_charge_paise: "delivery",
  free_delivery_above_paise: "freeAbove",
  upi_id: "upi",
  whatsapp_number: "waNum",
};
const FIX_MSG = "Some fields need fixing. Check the messages below.";

function backendFieldErrors(x: unknown): FErr {
  const out: FErr = {};
  if (!(x instanceof ApiError)) return out;
  for (const [k, msgs] of Object.entries(x.fields ?? {})) {
    const key = BACKEND_KEYS[k];
    if (key && msgs?.length) out[key] = msgs[0];
  }
  return out;
}

const init = (s: SellerStore): F => ({
  name: s.name,
  slug: s.slug,
  insta: s.instagram_handle || "",
  bio: s.bio || "",
  cat: s.category_id ? String(s.category_id) : "",
  about: s.about_text || "",
  shipPolicy: s.shipping_policy || "",
  returnPolicy: s.return_policy || "",
  email: s.contact_email || "",
  phone: s.contact_phone || "",
  dispatchNote: s.dispatch_note || "",
  returnNote: s.return_note || "",
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
  const toast = useToast();
  const [s, setS] = useState<SellerStore | null>(null);
  const [f, setF] = useState<F | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [err, setErr] = useState<unknown>(null);
  const [fe, setFe] = useState<FErr>({});
  const [busy, setBusy] = useState(false);

  // Warn before the tab closes with unsaved edits (hooks stay above the early return)
  const dirty = !!f && !!s && JSON.stringify(f) !== JSON.stringify(init(s));
  useUnsavedChanges(dirty);

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
    return (
      <>
        {err ? (
          <ApiAlert error={err} title="Couldn't load settings" />
        ) : (
          <p className="mut">Loading…</p>
        )}
      </>
    );

  const up = <K extends keyof F>(k: K, v: F[K]) => {
    setF((x) => x && { ...x, [k]: v });
    setFe((e) => (e[k as FKey] ? { ...e, [k]: undefined } : e));
  };
  const errProps = (k: FKey) => ({
    "aria-invalid": !!fe[k] || undefined,
    "aria-describedby": fe[k] ? `st-${k}-err` : undefined,
  });

  // Logo and banner upload straight away, so they report with toasts.
  async function upload(kind: "logo" | "banner", file: File) {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const x = await api<{
        logo_url?: string | null;
        banner_url?: string | null;
      }>(`/seller/store/${kind}`, { method: "POST", form: fd, auth: true });
      setS((c) => c && { ...c, ...x });
      toast.success(kind === "logo" ? "Logo updated." : "Banner updated.");
    } catch (e) {
      toast.fromError(e, {
        title: kind === "logo" ? "Logo not updated" : "Banner not updated",
      });
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const g = f!;
    const dc = toPaise(g.delivery),
      fa = toPaise(g.freeAbove);
    const phone = g.phone.replace(/\D/g, "");

    const errs: FErr = {};
    if (!g.name.trim()) errs.name = "Enter a store name.";
    if (!g.slug.trim()) errs.slug = "Enter a store link.";
    if (dc !== undefined && Number.isNaN(dc))
      errs.delivery = "Enter a valid amount, like 50 or 49.50.";
    if (fa !== undefined && Number.isNaN(fa))
      errs.freeAbove = "Enter a valid amount, like 500.";
    if (g.upi && !UPI_RE.test(g.upi))
      errs.upi = "Enter a valid UPI ID, like name@bank.";
    if (g.email && !EMAIL_RE.test(g.email))
      errs.email = "Enter a valid contact email.";
    if (phone && (phone.length < 10 || phone.length > 15))
      errs.phone = "Enter a valid phone number with 10 to 15 digits.";
    setFe(errs);
    if (Object.keys(errs).length) {
      setErr(FIX_MSG);
      return;
    }

    const body = {
      name: g.name,
      slug: g.slug,
      instagram_handle: g.insta || null,
      bio: g.bio || null,
      category_id: g.cat ? Number(g.cat) : null,
      about_text: g.about || null,
      shipping_policy: g.shipPolicy || null,
      return_policy: g.returnPolicy || null,
      contact_email: g.email || null,
      contact_phone: phone || null,
      dispatch_note: g.dispatchNote || null,
      return_note: g.returnNote || null,
      delivery_charge_paise: dc,
      free_delivery_above_paise: fa,
      pickup_enabled: g.pickup,
      upi_id: g.upi || null,
      cod_enabled: g.cod,
      whatsapp_enabled: g.waOn,
      whatsapp_number: g.waNum || null,
      status: g.status === "closed" ? "closed" : "active",
      closing_date: g.closing || null,
      theme: g.theme,
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
      setFe({});
      toast.success("Settings saved.");
      // Saved fine, but these settings stop shoppers from ordering.
      if (g.status === "closed")
        toast.warning(
          "Your store is closed, so shoppers can't place orders until you reopen it.",
          {
            title: "Store is closed",
          },
        );
      if (!g.upi && !g.cod)
        toast.warning(
          "Add a UPI ID or turn on cash on delivery so shoppers can pay.",
          {
            title: "No way to pay",
          },
        );
    } catch (x) {
      const mapped = backendFieldErrors(x);
      if (Object.keys(mapped).length) {
        setFe(mapped);
        setErr(FIX_MSG);
      } else setErr(x);
    }
    setBusy(false);
  }

  const wa = s.features?.whatsapp_available;

  return (
    <form onSubmit={save} noValidate style={{ maxWidth: 720 }}>
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
      <FormStatus error={err} />
      <div style={{ display: "grid", gap: 16 }}>
        <div className="card">
          <h2 className="h2">Store details</h2>
          <Field
            label="Store name"
            required
            value={f.name}
            {...errProps("name")}
            onChange={(e) => up("name", e.target.value)}
          />
          <FieldError id="st-name-err">{fe.name}</FieldError>
          <Field
            label="Store link"
            required
            value={f.slug}
            {...errProps("slug")}
            onChange={(e) => up("slug", e.target.value.toLowerCase())}
          />
          <FieldError id="st-slug-err">{fe.slug}</FieldError>
          <p className="mut" style={{ margin: "-4px 0 12px" }}>
            reel-store.in/{f.slug}. Changing it breaks links you’ve already
            shared.
          </p>
          <Field
            label="Instagram handle"
            placeholder="@yourshop"
            value={f.insta}
            {...errProps("insta")}
            onChange={(e) => up("insta", e.target.value)}
          />
          <FieldError id="st-insta-err">{fe.insta}</FieldError>
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
                e.target.value = "";
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
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="card">
          <h2 className="h2">Contact</h2>
          <Field
            label="Contact email, optional"
            type="email"
            value={f.email}
            {...errProps("email")}
            onChange={(e) => up("email", e.target.value)}
          />
          <FieldError id="st-email-err">{fe.email}</FieldError>
          <Field
            label="Contact phone, optional"
            type="tel"
            inputMode="tel"
            placeholder="919876543210"
            value={f.phone}
            {...errProps("phone")}
            onChange={(e) => up("phone", e.target.value)}
          />
          <FieldError id="st-phone-err">{fe.phone}</FieldError>
          <p className="mut">Shown publicly on your store.</p>
        </div>

        <div className="card">
          <h2 className="h2">About &amp; policies</h2>
          <label className="f">
            About your store
            <textarea
              className="in"
              rows={5}
              value={f.about}
              onChange={(e) => up("about", e.target.value)}
            />
          </label>
          <label className="f">
            Shipping policy
            <textarea
              className="in"
              rows={4}
              value={f.shipPolicy}
              onChange={(e) => up("shipPolicy", e.target.value)}
            />
          </label>
          <label className="f" style={{ marginBottom: 0 }}>
            Returns policy
            <textarea
              className="in"
              rows={4}
              value={f.returnPolicy}
              onChange={(e) => up("returnPolicy", e.target.value)}
            />
          </label>
        </div>

        <div className="card">
          <h2 className="h2">Delivery</h2>
          <Field
            label="Delivery charge (₹)"
            inputMode="decimal"
            value={f.delivery}
            {...errProps("delivery")}
            onChange={(e) => up("delivery", e.target.value)}
          />
          <FieldError id="st-delivery-err">{fe.delivery}</FieldError>
          <Field
            label="Free delivery above (₹), optional"
            inputMode="decimal"
            value={f.freeAbove}
            {...errProps("freeAbove")}
            onChange={(e) => up("freeAbove", e.target.value)}
          />
          <FieldError id="st-freeAbove-err">{fe.freeAbove}</FieldError>
          <Field
            label="Dispatch note, optional"
            placeholder="Ships in 2-3 days"
            maxLength={80}
            value={f.dispatchNote}
            onChange={(e) => up("dispatchNote", e.target.value)}
          />
          <Field
            label="Returns note, optional"
            placeholder="7-day easy returns"
            maxLength={80}
            value={f.returnNote}
            onChange={(e) => up("returnNote", e.target.value)}
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
            {...errProps("upi")}
            onChange={(e) => up("upi", e.target.value)}
          />
          <FieldError id="st-upi-err">{fe.upi}</FieldError>
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
            {...errProps("waNum")}
            onChange={(e) => up("waNum", e.target.value)}
          />
          <FieldError id="st-waNum-err">{fe.waNum}</FieldError>
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

        {/* Appears only when something changed; it is the Save button. */}
        <UnsavedBar
          dirty={dirty}
          busy={busy}
          saveLabel="Save settings"
          onDiscard={() => {
            setF(init(s));
            setFe({});
            setErr(null);
            toast.info("Your changes were discarded.", { title: "Reverted" });
          }}
        />
      </div>
    </form>
  );
}
