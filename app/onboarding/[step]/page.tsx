"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, abs, getToken, setStoreId } from "@/lib/api";
import { UPI_RE, slugify } from "@/lib/forms";
import type { Category, SellerStore, Theme } from "@/lib/types";
import { ErrBox, Field, Wordmark } from "@/components/ui";
import ProductForm from "@/components/ProductForm";
import ThemePicker from "@/components/ThemePicker";
const LABELS = ["Store", "UPI ID", "First product", "Look", "Share"];
const DEF: Theme = {
  template: "classic",
  button: "#1E4FD6",
  accent: "#F59E0B",
  background: "#F8FAFC",
};
type Share = { url: string; whatsapp_url: string; qr_poster_url: string };
export default function Onboarding() {
  const { step } = useParams<{ step: string }>();
  const n = Math.min(5, Math.max(1, parseInt(step, 10) || 1));
  const r = useRouter();
  const [store, setStore] = useState<SellerStore | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [msg, setMsg] = useState<{
    ok: boolean;
    text: string;
    sug?: string | null;
  } | null>(null);
  const [insta, setInsta] = useState("");
  const [cat, setCat] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [upi, setUpi] = useState("");
  const [qr, setQr] = useState<{ valid: boolean; qr_svg: string } | null>(null);
  const [theme, setTheme] = useState<Theme>(DEF);
  const [share, setShare] = useState<Share | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!getToken()) {
      r.replace("/login");
      return;
    }
    api<{ store: SellerStore }>("/seller/store", { auth: true })
      .then((x) => {
        const s = x.store;
        setStore(s);
        setName(s.name);
        setSlug(s.slug);
        setTouched(true);
        setInsta(s.instagram_handle || "");
        setCat(s.category_id ? String(s.category_id) : "");
        setUpi(s.upi_id || "");
        setTheme(s.theme);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 422) r.replace("/stores");
        else if (!(e instanceof ApiError && e.status === 404)) setErr(e);
      })
      .finally(() => setReady(true));
  }, [r]);
  useEffect(() => {
    if (n !== 1) return;
    api<{ categories: Category[] }>("/categories?kind=store")
      .then((x) => setCats(x.categories))
      .catch(() => {});
  }, [n]);
  useEffect(() => {
    if (ready && !store && n > 1) r.replace("/onboarding/1");
  }, [ready, store, n, r]);
  useEffect(() => {
    if (n === 5 && store)
      api<Share>("/seller/store/share", { auth: true })
        .then(setShare)
        .catch(setErr);
  }, [n, store]);
  const patch = async (body: unknown) => {
    const x = await api<{ store: SellerStore }>("/seller/store", {
      method: "PATCH",
      body,
      auth: true,
    });
    setStore(x.store);
    return x.store;
  };
  async function checkSlug(s: string) {
    if (store && s === store.slug) {
      setMsg(null);
      return;
    }
    if (!/^[a-z0-9-]{3,40}$/.test(s)) {
      setMsg({
        ok: false,
        text: "Use 3 to 40 lowercase letters, numbers or dashes.",
      });
      return;
    }
    try {
      const x = await api<{ available: boolean; suggestion: string | null }>(
        `/seller/store/slug_check?slug=${encodeURIComponent(s)}`,
        { auth: true, store: false },
      );
      setMsg(
        x.available
          ? { ok: true, text: "This link is available." }
          : { ok: false, text: "This link is taken.", sug: x.suggestion },
      );
    } catch {
      setMsg(null);
    }
  }
  async function go(fn: () => Promise<unknown>, next: number) {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      r.push("/onboarding/" + next);
    } catch (e) {
      setErr(e);
    }
    setBusy(false);
  }
  const saveStore = (e: FormEvent) => {
    e.preventDefault();
    go(async () => {
      const body = {
        name,
        slug,
        instagram_handle: insta || undefined,
        category_id: cat ? Number(cat) : undefined,
      };
      if (store) await patch(body);
      else {
        const x = await api<{ store: SellerStore }>("/seller/store", {
          method: "POST",
          body,
          auth: true,
          store: false,
        });
        setStore(x.store);
        setStoreId(x.store.id);
      }
    }, 2);
  };
  const saveUpi = (e: FormEvent) => {
    e.preventDefault();
    if (!UPI_RE.test(upi))
      return setErr("Enter a valid UPI ID, like name@bank.");
    go(() => patch({ upi_id: upi }), 3);
  };
  async function testQr() {
    setErr(null);
    if (!UPI_RE.test(upi))
      return setErr("Enter a valid UPI ID, like name@bank.");
    try {
      setQr(
        await api(
          `/seller/store/upi_test_qr?upi_id=${encodeURIComponent(upi)}`,
          { auth: true },
        ),
      );
    } catch (e) {
      setErr(e);
    }
  }
  async function finish() {
    setErr(null);
    setBusy(true);
    try {
      const x = await api<{ redirect: string }>("/seller/onboarding/complete", {
        method: "POST",
        auth: true,
      });
      if (x.redirect?.startsWith("/")) r.replace(x.redirect);
      else if (x.redirect) window.location.href = x.redirect;
      else r.replace("/dashboard");
    } catch (e) {
      setErr(e);
      setBusy(false);
    }
  }
  const back = n > 1 && (
    <Link className="btn s auto" href={"/onboarding/" + (n - 1)}>
      Back
    </Link>
  );
  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="hd">
        <div className="w hdr">
          <Wordmark size={20} />
        </div>
      </header>
      <main className="w" style={{ maxWidth: 640, padding: "32px 20px 48px" }}>
        <p className="mut">Step {n} of 5</p>
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 20px",
            fontSize: 14,
            margin: "8px 0 24px",
          }}
        >
          {LABELS.map((l, i) => {
            const s = i + 1 < n ? "Done" : i + 1 === n ? "Now" : "";
            return (
              <li
                key={l}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    flex: "none",
                    ...(s === "Done"
                      ? { background: "var(--gr)" }
                      : s === "Now"
                        ? { border: "3px solid var(--blue)" }
                        : { border: "2px solid var(--ln2)" }),
                  }}
                />
                <span style={{ fontWeight: s === "Now" ? 600 : 400 }}>
                  {i + 1} {l}
                </span>
                {s && <span className="mut">{s}</span>}
              </li>
            );
          })}
        </ul>
        <ErrBox e={err} />
        {ready && (
          <div className="card" style={{ padding: 24 }}>
            {n === 1 && (
              <form onSubmit={saveStore}>
                <h2 className="h2">Name your store</h2>
                <Field
                  label="Store name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!touched) setSlug(slugify(e.target.value));
                  }}
                />
                <Field
                  label="Store link"
                  required
                  value={slug}
                  onChange={(e) => {
                    setTouched(true);
                    setSlug(e.target.value.toLowerCase());
                    setMsg(null);
                  }}
                  onBlur={() => checkSlug(slug)}
                />
                <p className="mut" style={{ margin: "-4px 0 12px" }}>
                  reel-store.in/{slug || "your-shop"}
                  {msg && (
                    <>
                      {" "}
                      ·{" "}
                      <span
                        style={{ color: msg.ok ? "var(--gr)" : "var(--red)" }}
                      >
                        {msg.text}
                      </span>
                      {msg.sug && (
                        <>
                          {" "}
                          <button
                            type="button"
                            className="btn s auto"
                            style={{ display: "inline-flex" }}
                            onClick={() => {
                              setSlug(msg.sug || "");
                              setMsg(null);
                            }}
                          >
                            Use {msg.sug}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </p>
                <Field
                  label="Instagram handle, optional"
                  placeholder="@yourshop"
                  value={insta}
                  onChange={(e) => setInsta(e.target.value)}
                />
                <label className="f">
                  Store category
                  <select
                    className="in"
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                  >
                    <option value="">Choose a category</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="btn" disabled={busy}>
                  Continue
                </button>
              </form>
            )}
            {n === 2 && (
              <form onSubmit={saveUpi}>
                <h2 className="h2">Add your UPI ID</h2>
                <p className="mut" style={{ marginBottom: 12 }}>
                  Buyers pay this ID directly. Check it with the test QR.
                </p>
                <Field
                  label="UPI ID"
                  placeholder="yourname@bank"
                  required
                  value={upi}
                  onChange={(e) => {
                    setUpi(e.target.value);
                    setQr(null);
                  }}
                />
                <button
                  type="button"
                  className="btn s auto"
                  style={{ marginBottom: 12 }}
                  onClick={testQr}
                >
                  Show test QR
                </button>
                {qr &&
                  (qr.valid ? (
                    <img
                      alt="Test UPI QR code"
                      width={160}
                      height={160}
                      style={{
                        display: "block",
                        border: "1px solid var(--ln)",
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                      src={
                        "data:image/svg+xml;utf8," +
                        encodeURIComponent(qr.qr_svg)
                      }
                    />
                  ) : (
                    <p className="mut" style={{ marginBottom: 12 }}>
                      That UPI ID doesn’t look valid.
                    </p>
                  ))}
                <div className="actions">
                  {back}
                  <button className="btn auto" disabled={busy}>
                    Continue
                  </button>
                </div>
              </form>
            )}
            {n === 3 && (
              <>
                <h2 className="h2">Add your first product</h2>
                <ProductForm
                  label="Save and continue"
                  onSaved={() => r.push("/onboarding/4")}
                />
                <div style={{ marginTop: 12 }}>{back}</div>
              </>
            )}
            {n === 4 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  go(() => patch({ theme }), 5);
                }}
              >
                <h2 className="h2">Pick your store look</h2>
                <ThemePicker v={theme} set={setTheme} />
                <p className="mut" style={{ margin: "12px 0 16px" }}>
                  You can change this any time in Settings.
                </p>
                <div className="actions">
                  {back}
                  <button className="btn auto" disabled={busy}>
                    Continue
                  </button>
                </div>
              </form>
            )}
            {n === 5 && (
              <>
                <h2 className="h2">Your store is ready</h2>
                <p className="mut" style={{ marginBottom: 12 }}>
                  Put this link in your Instagram bio or send it on WhatsApp.
                </p>
                {share && (
                  <>
                    <p
                      className="t"
                      style={{ fontWeight: 500, marginBottom: 12 }}
                    >
                      {share.url}
                    </p>
                    <div style={{ display: "grid", gap: 8 }}>
                      <button
                        className="btn s"
                        onClick={() =>
                          navigator.clipboard.writeText(share.url).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          })
                        }
                      >
                        {copied ? "Copied" : "Copy link"}
                      </button>
                      <a className="btn s" href={share.whatsapp_url}>
                        Share on WhatsApp
                      </a>
                      <a className="btn s" href={abs(share.qr_poster_url)}>
                        Download QR poster
                      </a>
                      <button className="btn" disabled={busy} onClick={finish}>
                        Go to dashboard
                      </button>
                    </div>
                  </>
                )}
                <div style={{ marginTop: 12 }}>{back}</div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
