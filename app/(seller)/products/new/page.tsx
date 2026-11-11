"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { rupees } from "@/lib/format";
import type { SellerProduct } from "@/lib/types";
import { ErrBox } from "@/components/ui";

const PER = 20;
type Meta = { page: number; per_page: number; total: number };

export default function Products() {
  const [rows, setRows] = useState<SellerProduct[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qd, setQd] = useState("");
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQd(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let live = true;
    setRows(null);
    setErr(null);
    const qs = `page=${page}&per_page=${PER}${qd ? `&q=${encodeURIComponent(qd)}` : ""}`;
    api<{ products: SellerProduct[]; meta: Meta }>(`/seller/products?${qs}`, {
      auth: true,
    })
      .then((x) => {
        if (!live) return;
        setRows(x.products);
        setMeta(x.meta);
      })
      .catch((e) => live && setErr(e));
    return () => {
      live = false;
    };
  }, [page, qd]);

  const pages = meta ? Math.max(1, Math.ceil(meta.total / meta.per_page)) : 1;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600 }}>
          Products
        </h1>
        <Link className="btn auto" href="/products/new">
          Add product
        </Link>
      </div>
      <input
        className="in"
        type="search"
        placeholder="Search products by name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <ErrBox e={err} />
      <div className="card">
        {!rows && !err && <p className="mut">Loading…</p>}
        {rows && rows.length === 0 && (
          <p className="mut">
            {qd
              ? "No products match your search."
              : "No products yet. Add your first one."}
          </p>
        )}
        {rows?.map((p, i) => (
          <div className={"row" + (i === 0 ? " first" : "")} key={p.id}>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {p.cover_url ? (
                <img
                  src={p.cover_url}
                  alt=""
                  width={56}
                  height={56}
                  style={{ borderRadius: 8, objectFit: "cover" }}
                />
              ) : (
                <span className="ph" style={{ width: 56, height: 56 }}>
                  Photo
                </span>
              )}
              <span>
                <b>{p.name}</b>
                <br />
                <span className="mut t">
                  {rupees(p.price_paise)} ·{" "}
                  {!p.in_stock
                    ? "Out of stock"
                    : p.stock == null
                      ? "No stock limit"
                      : "In stock: " + p.stock}
                </span>
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span className={"b " + (p.status === "live" ? "g" : "n")}>
                {p.status === "live" ? "Live" : "Hidden"}
              </span>
              <Link href={"/products/" + p.id}>Edit</Link>
            </span>
          </div>
        ))}
      </div>
      {meta && pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            marginTop: 16,
          }}
        >
          <button
            className="btn s auto"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span className="mut">
            Page {page} of {pages}
          </span>
          <button
            className="btn s auto"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
