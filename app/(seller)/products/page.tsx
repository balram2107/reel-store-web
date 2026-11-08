"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { rupees } from "@/lib/format";
import type { SellerProduct } from "@/lib/types";
import { ErrBox } from "@/components/ui";
export default function Products() {
  const [rows, setRows] = useState<SellerProduct[] | null>(null);
  const [err, setErr] = useState<unknown>(null);
  useEffect(() => {
    api<{ products: SellerProduct[] }>("/seller/products", { auth: true })
      .then((x) => setRows(x.products))
      .catch(setErr);
  }, []);
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
      <ErrBox e={err} />
      <div className="card">
        {!rows && !err && <p className="mut">Loading…</p>}
        {rows && rows.length === 0 && (
          <p className="mut">No products yet. Add your first one.</p>
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
    </>
  );
}
