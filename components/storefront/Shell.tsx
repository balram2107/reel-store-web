"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import { api, useAsync } from "@/lib/storefront-api";
import { useCart } from "@/lib/storefront-cart";
import { inr } from "@/lib/storefront-format";
import type { Store } from "@/lib/storefront-types";
import { StoreCtx, useStore } from "./ctx";
import { ErrorBox } from "./ui";

const FONTS = {
  modern: "Inter, system-ui, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
  elegant: "'Playfair Display', Georgia, serif",
} as const;

const CSS = `
.rs-wrap{max-width:1200px;margin:0 auto;padding:0 48px}
.rs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.rs-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.rs-two{display:grid;grid-template-columns:1.15fr 1fr;gap:56px}
.rs-side{display:grid;grid-template-columns:240px 1fr;gap:48px}
.rs-checkout{display:grid;grid-template-columns:1.4fr 1fr;gap:48px}
.rs-foot{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px}
.rs-tabbar{display:none}
.rs-nav a:focus-visible,a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--btn);outline-offset:2px}
@media(max-width:900px){.rs-grid{grid-template-columns:repeat(3,1fr)}.rs-two,.rs-side,.rs-checkout,.rs-foot{grid-template-columns:1fr;gap:24px}.rs-grid3{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.rs-wrap{padding:0 16px}.rs-grid,.rs-grid3{grid-template-columns:repeat(var(--pc,2),1fr);gap:12px}.rs-hide-m{display:none!important}.rs-tabbar{display:flex}.rs-pad-tab{padding-bottom:72px}}
`;

export function StoreShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const s = useAsync(() => api.store(slug), [slug]);
  const c = useAsync(() => api.categories(slug), [slug]);
  const bare: CSSProperties = {
    fontFamily: FONTS.modern,
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  };

  if (s.loading && !s.data)
    return (
      <div style={bare} aria-busy="true">
        Loading store…
      </div>
    );
  if (s.error?.status === 404)
    return (
      <div style={bare}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ font: "700 28px Inter" }}>Store not found</h1>
          <p>Check the link and try again.</p>
        </div>
      </div>
    );
  if (!s.data)
    return (
      <div style={bare}>
        <div style={{ maxWidth: 480 }}>
          <ErrorBox error={s.error!} onRetry={s.reload} />
        </div>
      </div>
    );

  const store = s.data;
  const t = store.theme;
  const insta = t.template === "insta_aesthetic";
  const set = t.settings;
  const r = { soft: "8px", rounded: "16px", square: "0px" }[
    set.corner_style ?? (insta ? "rounded" : "soft")
  ];
  const vars = {
    "--btn": t.button,
    "--accent": t.accent,
    "--bg": t.background,
    "--r": r,
    "--font": FONTS[set.font_style ?? "modern"],
    "--ink": insta ? "#1F1235" : "#111827",
    "--muted": insta ? "#4B3B6B" : "#4B5563",
    "--tile": insta
      ? "color-mix(in srgb, var(--accent) 22%, white)"
      : "#E5E7EB",
    "--pc": set.phone_columns ?? "2",
  } as CSSProperties;

  return (
    <StoreCtx.Provider value={{ slug, store, cats: c.data ?? null, insta }}>
      <style>{CSS}</style>
      <div
        style={{
          ...vars,
          background: "var(--bg)",
          color: "var(--ink)",
          fontFamily: "var(--font)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {store.status !== "open" ? (
          <Unavailable store={store} />
        ) : (
          <>
            <Header />
            <main className="rs-pad-tab" style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
            {insta && <TabBar />}
          </>
        )}
      </div>
    </StoreCtx.Provider>
  );
}

function Unavailable({ store }: { store: Store }) {
  const title = {
    closed: "We’re closed for now",
    suspended: "This store is unavailable",
    ended: "This store has closed",
    open: "",
  }[store.status];
  return (
    <main
      style={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        {store.logo_url && (
          /* eslint-disable-next-line @next/next/no-img-element */ <img
            src={store.logo_url}
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <h1 style={{ font: "700 28px var(--font)", margin: "12px 0 8px" }}>
          {store.name}
        </h1>
        <h2 style={{ font: "600 18px var(--font)", margin: 0 }}>{title}</h2>
        <p style={{ font: "400 16px/1.6 var(--font)", color: "var(--muted)" }}>
          {store.unavailable_message ?? "Please check back later."}
        </p>
        {store.instagram_url && (
          <a
            href={store.instagram_url}
            style={{ color: "var(--btn)", font: "600 15px var(--font)" }}
          >
            Follow us on Instagram
          </a>
        )}
      </div>
    </main>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function Announcement() {
  const { store } = useStore();
  const d = store.delivery;
  const built = [
    d.free_above_paise
      ? `Free shipping above ${inr(d.free_above_paise)}`
      : null,
    store.payments.cod ? "Cash on delivery available" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const text = store.announcement?.text ?? built;
  if (!text) return null;
  const bg =
    store.announcement && HEX.test(store.announcement.color)
      ? store.announcement.color
      : "#111827";
  return (
    <div
      style={{
        background: bg,
        color: "#fff",
        textAlign: "center",
        font: "500 13px var(--font)",
        padding: 9,
      }}
    >
      {text}
    </div>
  );
}

function Header() {
  const { slug, store, cats, insta } = useStore();
  const { count } = useCart(slug);
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState("");
  const home = path === `/${slug}`;
  const link: CSSProperties = {
    font: "500 14px var(--font)",
    color: "var(--ink)",
    textDecoration: "none",
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/${slug}/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`,
    );
  };
  const cartLink = (
    <Link href={`/${slug}/cart`} style={{ ...link, fontWeight: 600 }}>
      Cart ({count})
    </Link>
  );
  const trackLink = (
    <Link href={`/${slug}/track`} style={link}>
      Track order
    </Link>
  );

  if (insta) {
    const set = store.theme.settings;
    const tab = (href: string, label: string, on: boolean) => (
      <Link
        key={label}
        href={href}
        aria-current={on ? "page" : undefined}
        style={{
          padding: "12px 4px",
          font: "600 14px var(--font)",
          color: on ? "var(--btn)" : "var(--muted)",
          borderBottom: `2px solid ${on ? "var(--btn)" : "transparent"}`,
          textDecoration: "none",
        }}
      >
        {label}
      </Link>
    );
    return (
      <header
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, white)",
          borderBottom:
            "1px solid color-mix(in srgb, var(--accent) 35%, white)",
        }}
      >
        <div
          className="rs-wrap"
          style={{ maxWidth: 960, paddingTop: home ? 24 : 12 }}
        >
          <div
            className="rs-hide-m"
            style={{ display: "flex", justifyContent: "flex-end", gap: 20 }}
          >
            {trackLink}
            {cartLink}
          </div>
          {home ? (
            <div
              style={{
                display: "flex",
                gap: 32,
                alignItems: "center",
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius:
                    store.theme.settings.logo_shape === "square"
                      ? 12
                      : store.theme.settings.logo_shape === "rounded"
                        ? 28
                        : "50%",
                  background: "var(--tile)",
                  border: "4px solid #fff",
                  outline: "3px solid var(--accent)",
                  overflow: "hidden",
                  flex: "none",
                  display: "grid",
                  placeItems: "center",
                  font: "700 40px var(--font)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  store.name.charAt(0)
                )}
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <h1 style={{ margin: 0, font: "700 26px var(--font)" }}>
                    {store.name}
                  </h1>
                  {store.instagram_url && (
                    <a
                      href={store.instagram_url}
                      style={{
                        background: "var(--btn)",
                        color: "#fff",
                        font: "600 14px var(--font)",
                        padding: "12px 20px",
                        borderRadius: 999,
                        textDecoration: "none",
                      }}
                    >
                      Follow on Instagram
                    </a>
                  )}
                </div>
                {store.instagram_handle && (
                  <div
                    style={{
                      font: "500 15px var(--font)",
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    @{store.instagram_handle.replace(/^@/, "")}
                  </div>
                )}
                {set.show_stats !== false && (
                  <div
                    style={{
                      display: "flex",
                      gap: 24,
                      margin: "12px 0",
                      font: "400 15px var(--font)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      <b>{store.counts.products}</b> products
                    </span>
                    <span>
                      <b>{store.counts.categories}</b> categories
                    </span>
                    {store.counts.orders != null && (
                      <span>
                        <b>{store.counts.orders}</b> orders
                      </span>
                    )}
                  </div>
                )}
                {store.bio && (
                  <p
                    style={{
                      margin: 0,
                      font: "400 15px/1.55 var(--font)",
                      color: "var(--muted)",
                      maxWidth: 520,
                    }}
                  >
                    {store.bio}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link
                href={`/${slug}`}
                style={{
                  font: "700 18px var(--font)",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                {store.name}
              </Link>
              <div style={{ flex: 1 }} />
              <span className="rs-hide-m" />
            </div>
          )}
          <div
            className="rs-nav"
            style={{
              display: "flex",
              gap: 28,
              marginTop: 16,
              overflowX: "auto",
            }}
          >
            {tab(`/${slug}`, "Home", home)}
            {tab(
              `/${slug}/shop`,
              "Shop",
              path.startsWith(`/${slug}/shop`) ||
                path.startsWith(`/${slug}/p/`),
            )}
            {tab(`/${slug}/policies`, "Policies", path.endsWith("/policies"))}
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    cats && cats.totals.new > 0
      ? { label: "New Arrivals", href: `/${slug}/shop?highlight=new` }
      : null,
    ...(cats?.categories ?? []).map((c) => ({
      label: c.name,
      href: `/${slug}/shop?category=${c.slug}`,
    })),
    cats && cats.totals.sale > 0
      ? { label: "Sale", href: `/${slug}/shop?highlight=sale` }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];
  return (
    <header style={{ background: "var(--bg)" }}>
      <Announcement />
      <div
        className="rs-wrap"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "18px 48px",
          borderBottom: "1px solid #E5E7EB",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={`/${slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            font: "700 22px var(--font)",
            color: "var(--btn)",
            textDecoration: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {store.logo_url && (
            <img
              src={store.logo_url}
              alt=""
              width={36}
              height={36}
              style={{
                borderRadius:
                  store.theme.settings.logo_shape === "circle" ? "50%" : 8,
                objectFit: "cover",
              }}
            />
          )}
          {store.name}
        </Link>
        <form
          onSubmit={submit}
          role="search"
          style={{ flex: 1, maxWidth: 520, minWidth: 180 }}
        >
          <input
            aria-label="Search products"
            placeholder="Search products"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 44,
              border: "1px solid #D1D5DB",
              borderRadius: "var(--r)",
              padding: "0 14px",
              font: "400 16px var(--font)",
            }}
          />
        </form>
        <div style={{ flex: 1 }} />
        {trackLink}
        {cartLink}
      </div>
      {navLinks.length > 0 && (
        <nav
          className="rs-nav"
          aria-label="Categories"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div
            className="rs-wrap"
            style={{
              display: "flex",
              gap: 32,
              padding: "14px 48px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{ ...link, color: "#374151" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { slug, store, insta } = useStore();
  const l: CSSProperties = {
    display: "block",
    font: "400 14px var(--font)",
    color: "var(--muted)",
    marginBottom: 8,
    textDecoration: "none",
  };
  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, "")}`
    : null;
  if (insta) {
    return (
      <footer
        className="rs-wrap"
        style={{
          maxWidth: 960,
          padding: "28px 24px 40px",
          borderTop: "1px solid color-mix(in srgb, var(--accent) 35%, white)",
          marginTop: 48,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          font: "400 14px var(--font)",
          color: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {store.instagram_url && (
            <a href={store.instagram_url} style={{ color: "inherit" }}>
              Instagram
            </a>
          )}
          {wa && (
            <a href={wa} style={{ color: "inherit" }}>
              WhatsApp
            </a>
          )}
          {store.contact.email && (
            <a
              href={`mailto:${store.contact.email}`}
              style={{ color: "inherit" }}
            >
              {store.contact.email}
            </a>
          )}
        </div>
        <div>
          <Link href={`/${slug}/policies`} style={{ color: "inherit" }}>
            Shipping &amp; returns
          </Link>{" "}
          · Powered by Reel Store
        </div>
      </footer>
    );
  }
  return (
    <footer
      style={{
        background: "#F9FAFB",
        borderTop: "1px solid #E5E7EB",
        marginTop: 56,
      }}
    >
      <div className="rs-wrap rs-foot" style={{ padding: "48px" }}>
        <div>
          <div style={{ font: "700 20px var(--font)", color: "var(--btn)" }}>
            {store.name}
          </div>
          {store.bio && (
            <p
              style={{
                font: "400 14px/1.6 var(--font)",
                color: "var(--muted)",
                maxWidth: 300,
              }}
            >
              {store.bio}
            </p>
          )}
        </div>
        <div>
          <div style={{ font: "600 14px var(--font)", marginBottom: 12 }}>
            Shop
          </div>
          <Link href={`/${slug}/shop`} style={l}>
            All products
          </Link>
          <Link href={`/${slug}/shop?highlight=new`} style={l}>
            New arrivals
          </Link>
          <Link href={`/${slug}/shop?highlight=sale`} style={l}>
            Sale
          </Link>
        </div>
        <div>
          <div style={{ font: "600 14px var(--font)", marginBottom: 12 }}>
            Help
          </div>
          <Link href={`/${slug}/policies#shipping`} style={l}>
            Shipping policy
          </Link>
          <Link href={`/${slug}/policies#returns`} style={l}>
            Returns policy
          </Link>
          <Link href={`/${slug}/track`} style={l}>
            Track order
          </Link>
        </div>
        <div>
          <div style={{ font: "600 14px var(--font)", marginBottom: 12 }}>
            Connect
          </div>
          {store.instagram_url && (
            <a href={store.instagram_url} style={l}>
              Instagram
            </a>
          )}
          {wa && (
            <a href={wa} style={l}>
              WhatsApp
            </a>
          )}
          {store.contact.email && (
            <a href={`mailto:${store.contact.email}`} style={l}>
              {store.contact.email}
            </a>
          )}
          {store.contact.phone && (
            <a href={`tel:${store.contact.phone}`} style={l}>
              {store.contact.phone}
            </a>
          )}
          {store.links.map((x) => (
            <a key={x.url} href={x.url} style={l} rel="noopener noreferrer">
              {x.label}
            </a>
          ))}
        </div>
      </div>
      <div
        className="rs-wrap"
        style={{
          padding: "0 48px 24px",
          font: "400 12px var(--font)",
          color: "var(--muted)",
        }}
      >
        Powered by Reel Store
      </div>
    </footer>
  );
}

// Insta theme, phones only: Home / Shop / Cart / Profile
function TabBar() {
  const { slug } = useStore();
  const { count } = useCart(slug);
  const path = usePathname();
  const tabs = [
    { label: "Home", href: `/${slug}`, on: path === `/${slug}` },
    {
      label: "Shop",
      href: `/${slug}/shop`,
      on: path.startsWith(`/${slug}/shop`),
    },
    {
      label: `Cart${count ? ` (${count})` : ""}`,
      href: `/${slug}/cart`,
      on: path.endsWith("/cart"),
    },
    {
      label: "Profile",
      href: `/${slug}/policies`,
      on: path.endsWith("/policies"),
    },
  ];
  return (
    <nav
      className="rs-tabbar"
      aria-label="Main"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#fff",
        borderTop: "1px solid #E5E7EB",
        zIndex: 20,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          aria-current={t.on ? "page" : undefined}
          style={{
            flex: 1,
            minHeight: 56,
            display: "grid",
            placeItems: "center",
            font: `${t.on ? 700 : 500} 13px var(--font)`,
            color: t.on ? "var(--btn)" : "var(--muted)",
            textDecoration: "none",
          }}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
