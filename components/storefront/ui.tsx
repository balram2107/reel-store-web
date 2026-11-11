"use client";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { inr } from "@/lib/storefront-format";
import type { ApiError } from "@/lib/storefront-api";
import type { ProductRow } from "@/lib/storefront-types";
import { useStore } from "./ctx";

export const INK = "#111827",
  MUTED = "#4B5563",
  BORDER = "#E5E7EB";

export function btn(
  s: ReturnType<typeof useStore>["store"],
  kind: "primary" | "secondary" = "primary",
): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 24px",
    borderRadius: "var(--r)",
    font: "600 15px var(--font)",
    cursor: "pointer",
    textDecoration: "none",
    boxSizing: "border-box",
  };
  const style = s.theme.settings.button_style ?? "filled";
  if (kind === "secondary")
    return {
      ...base,
      background: "#fff",
      color: "var(--ink)",
      border: "1px solid var(--ink)",
    };
  if (style === "outline")
    return {
      ...base,
      background: "transparent",
      color: "var(--btn)",
      border: "2px solid var(--btn)",
    };
  if (style === "soft")
    return {
      ...base,
      background: "color-mix(in srgb, var(--btn) 12%, white)",
      color: "var(--btn)",
      border: 0,
    };
  return { ...base, background: "var(--btn)", color: "#fff", border: 0 };
}

export function Img({
  src,
  alt,
  ratio,
  radius,
}: {
  src: string | null;
  alt: string;
  ratio?: string;
  radius?: string;
}) {
  const { store } = useStore();
  const r =
    ratio ??
    { square: "1", portrait: "4 / 5", landscape: "4 / 3" }[
      store.theme.settings.image_ratio ?? "square"
    ];
  const box: CSSProperties = {
    aspectRatio: r,
    borderRadius: radius ?? "var(--r)",
    background: "var(--tile)",
    width: "100%",
    overflow: "hidden",
    position: "relative",
  };
  return (
    <div style={box}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            font: "600 28px var(--font)",
            color: "var(--muted)",
          }}
        >
          {alt.trim().charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function Price({
  p,
  size = 15,
}: {
  p: Pick<ProductRow, "price_paise" | "mrp_paise" | "discount_percent">;
  size?: number;
}) {
  const { store } = useStore();
  const badge =
    store.theme.settings.discount_badge !== false && p.discount_percent > 0;
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      <b style={{ font: `600 ${size}px var(--font)` }}>{inr(p.price_paise)}</b>{" "}
      {p.mrp_paise && p.mrp_paise > p.price_paise && (
        <s
          style={{
            font: `400 ${size - 2}px var(--font)`,
            color: "var(--muted)",
          }}
        >
          {inr(p.mrp_paise)}
        </s>
      )}
      {badge && (
        <span
          style={{
            marginLeft: 6,
            font: "600 12px var(--font)",
            color: "#15803D",
          }}
        >
          {p.discount_percent}% off
        </span>
      )}
    </span>
  );
}

export function ProductCard({
  p,
  onQuick,
}: {
  p: ProductRow;
  onQuick?: (p: ProductRow) => void;
}) {
  const { slug, insta } = useStore();
  const href = `/${slug}/p/${p.slug}`;
  const src = p.card_url ?? p.cover_url;
  if (insta) {
    const inner = (
      <div
        style={{
          position: "relative",
          boxShadow: "0 4px 14px rgba(0,0,0,.08)",
          borderRadius: "var(--r)",
        }}
      >
        <Img src={src} alt={p.name} />
        <span
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
            background: p.in_stock ? "var(--accent)" : "#fff",
            color: INK,
            font: "600 13px var(--font)",
            padding: "4px 10px",
            borderRadius: 999,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {p.in_stock ? inr(p.price_paise) : "Sold out"}
        </span>
      </div>
    );
    return onQuick ? (
      <button
        type="button"
        onClick={() => onQuick(p)}
        aria-label={`Quick view ${p.name}`}
        style={{ all: "unset", cursor: "pointer", display: "block" }}
      >
        {inner}
      </button>
    ) : (
      <Link href={href} aria-label={p.name} style={{ display: "block" }}>
        {inner}
        <div style={{ font: "500 14px var(--font)", marginTop: 8 }}>
          {p.name}
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      style={{ display: "block", color: "inherit", textDecoration: "none" }}
    >
      <Img src={src} alt={p.name} />
      <div style={{ padding: "10px 2px 0", font: "500 15px var(--font)" }}>
        {p.name}
      </div>
      <div style={{ padding: "2px 2px 0" }}>
        {p.in_stock ? (
          <Price p={p} />
        ) : (
          <span style={{ font: "600 14px var(--font)", color: "var(--muted)" }}>
            Sold out
          </span>
        )}
      </div>
    </Link>
  );
}

export function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        margin: "0 0 20px",
      }}
    >
      <h2 style={{ margin: 0, font: "700 24px var(--font)" }}>{title}</h2>
      {href && (
        <Link
          href={href}
          style={{ font: "500 14px var(--font)", color: "var(--btn)" }}
        >
          View all
        </Link>
      )}
    </div>
  );
}

export function SkeletonGrid({ n = 8 }: { n?: number }) {
  return (
    <div className="rs-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: n }, (_, i) => (
        <div key={i}>
          <div
            style={{
              aspectRatio: "1",
              background: "var(--tile)",
              borderRadius: "var(--r)",
              opacity: 0.6,
            }}
          />
          <div
            style={{
              height: 14,
              width: "70%",
              background: "var(--tile)",
              borderRadius: 4,
              marginTop: 12,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              height: 14,
              width: "30%",
              background: "var(--tile)",
              borderRadius: 4,
              marginTop: 8,
              opacity: 0.6,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({
  error,
  onRetry,
}: {
  error: ApiError | Error;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        border: "1px solid #FCA5A5",
        background: "#FEF2F2",
        color: "#7F1D1D",
        borderRadius: "var(--r)",
        padding: 16,
        font: "400 15px var(--font)",
      }}
    >
      <b>Couldn’t load this.</b> {error.message}
      {onRetry && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              minHeight: 44,
              padding: "0 18px",
              borderRadius: "var(--r)",
              border: "1px solid #7F1D1D",
              background: "#fff",
              color: "#7F1D1D",
              font: "600 14px var(--font)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "56px 16px",
        color: "var(--muted)",
      }}
    >
      <div
        style={{
          font: "600 18px var(--font)",
          color: "var(--ink)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ font: "400 15px var(--font)" }}>{children}</div>
    </div>
  );
}

export function Pager({
  page,
  total,
  perPage,
  href,
}: {
  page: number;
  total: number;
  perPage: number;
  href: (p: number) => string;
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const cell = (on: boolean): CSSProperties => ({
    minWidth: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${on ? "var(--ink)" : "#D1D5DB"}`,
    background: on ? "var(--ink)" : "#fff",
    color: on ? "#fff" : "var(--ink)",
    borderRadius: "var(--r)",
    font: "500 14px var(--font)",
    textDecoration: "none",
  });
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );
  return (
    <nav
      aria-label="Pagination"
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginTop: 40,
        flexWrap: "wrap",
      }}
    >
      {page > 1 && (
        <Link href={href(page - 1)} style={cell(false)}>
          Prev
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} style={{ display: "contents" }}>
          {i > 0 && n - nums[i - 1] > 1 && (
            <span style={{ alignSelf: "center" }}>…</span>
          )}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            style={cell(n === page)}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} style={cell(false)}>
          Next
        </Link>
      )}
    </nav>
  );
}

export const inputStyle: CSSProperties = {
  display: "block",
  marginTop: 6,
  width: "100%",
  boxSizing: "border-box",
  height: 48,
  border: "1px solid #D1D5DB",
  borderRadius: "var(--r)",
  padding: "0 14px",
  font: "400 16px var(--font)",
  background: "#fff",
  color: INK,
};
